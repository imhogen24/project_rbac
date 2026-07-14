import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-guards";
import { getAllUsers, updateUserRole } from "@/server/users";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  const guard = requireAdmin(session);

  if (!guard.ok) {
    return NextResponse.json(
      { success: false, error: guard.error },
      { status: guard.status },
    );
  }

  try {
    const users = await getAllUsers();
    return NextResponse.json({ success: true, data: users });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "engineer"]),
});

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  const guard = requireAdmin(session);

  if (!guard.ok) {
    return NextResponse.json(
      { success: false, error: guard.error },
      { status: guard.status },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const validation = updateRoleSchema.safeParse(body);
  if (!validation.success) {
    const errorMessage = validation.error.issues
      .map((issue: { message: string }) => issue.message)
      .join(", ");
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 },
    );
  }

  try {
    if (validation.data.userId === session?.user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot change your own role" },
        { status: 403 },
      );
    }

    const user = await updateUserRole(
      validation.data.userId,
      validation.data.role,
    );

    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update user role" },
      { status: 500 },
    );
  }
}
