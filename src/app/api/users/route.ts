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

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
    .from(users);

  return NextResponse.json({ success: true, data: allUsers });
}

const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "engineer"]),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = updateRoleSchema.safeParse(body);

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

  const { userId, role } = parsed.data;

  const [updatedUser] = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, userId))
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
}
