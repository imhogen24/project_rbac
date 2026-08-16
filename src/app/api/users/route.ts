// src/app/api/users/route.ts
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/auth-guards";
import { db, users } from "@/lib/db";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  const guard = requireRole(session, ["admin"]);
  if (!guard.ok) {
    return NextResponse.json(
      { success: false, error: guard.error },
      { status: guard.status },
    );
  }

  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users);

    return NextResponse.json({ success: true, data: allUsers });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// --- Schemas ---

const createUserSchema = z.object({
  action: z.literal("create"),
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(["admin", "engineer"]),
  password: z.string().min(8),
});

const updateRoleSchema = z.object({
  action: z.literal("update-role"),
  userId: z.string().min(1),
  role: z.enum(["admin", "engineer"]),
});

const bodySchema = z.discriminatedUnion("action", [
  createUserSchema,
  updateRoleSchema,
]);

// --- POST handler ---

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 },
    );
  }

  const session = await auth.api.getSession({ headers: request.headers });

  const guard = requireRole(session, ["admin"]);
  if (!guard.ok) {
    return NextResponse.json(
      { success: false, error: guard.error },
      { status: guard.status },
    );
  }

  if (parsed.data.action === "create") {
    return handleCreateUser(parsed.data);
  }

  return handleUpdateRole(parsed.data);
}

// --- Action handlers ---

async function handleCreateUser(data: z.infer<typeof createUserSchema>) {
  try {
    // Step 1: create through better-auth so the password is hashed correctly.
    // New accounts always land as "engineer" per ARCHITECTURE.md default.
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
    });

    const createdId = signUpResult?.user?.id;

    if (!createdId) {
      return NextResponse.json(
        { success: false, error: "Failed to create user" },
        { status: 400 },
      );
    }

    // Step 2: elevate to admin if requested. Default from step 1 is "engineer",
    // so no extra write is needed when the requested role is "engineer".
    let finalRole: "admin" | "engineer" = "engineer";

    if (data.role === "admin") {
      const [promoted] = await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.id, createdId))
        .returning({ role: users.role });

      if (!promoted) {
        // User was created but role elevation failed — surface this clearly
        // rather than silently returning success with the wrong role.
        return NextResponse.json(
          {
            success: false,
            error:
              "User created but could not be elevated to admin. Please update the role manually.",
          },
          { status: 500 },
        );
      }

      finalRole = promoted.role as "admin" | "engineer";
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: createdId,
          name: data.name,
          email: data.email,
          role: finalRole,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    // better-auth throws on duplicate email / invalid input in some configs
    const message =
      err instanceof Error && /already exists|duplicate/i.test(err.message)
        ? "A user with this email already exists"
        : "Internal server error";

    const status = message.includes("already exists") ? 400 : 500;

    return NextResponse.json({ success: false, error: message }, { status });
  }
}

async function handleUpdateRole(data: z.infer<typeof updateRoleSchema>) {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({ role: data.role })
      .where(eq(users.id, data.userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
