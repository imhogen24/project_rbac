import type { Role } from "@/db/schema";
import type { Session } from "@/lib/auth";

export type GuardResult =
  | { ok: true }
  | { ok: false; error: string; status: 401 | 403 };

export function requireRole(
  session: Session | null,
  allowed: Role[],
): GuardResult {
  if (!session) {
    return { ok: false, error: "Not authenticated", status: 401 };
  }

  const role = session.user.role as Role;

  if (!allowed.includes(role)) {
    return { ok: false, error: "Insufficient permissions", status: 403 };
  }

  return { ok: true };
}
