import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/auth-guards";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  const guard = requireRole(session, ["admin", "engineer"]);
  if (!guard.ok) {
    return NextResponse.json(
      { success: false, error: guard.error },
      { status: guard.status },
    );
  }

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 },
    );
  }

  return NextResponse.json({ success: true, data: session.user });
}
