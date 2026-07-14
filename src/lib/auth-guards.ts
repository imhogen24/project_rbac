import type { Session } from "./auth";

export type Role = "admin" | "engineer";
export type GuardResult =
  | { ok: true }
  | { ok: false; error: string; status: 401 | 403 };

export function requireRole(
  session: Session | null,
  allowed: Role[],
): GuardResult {
  if (!session) {
    return { ok: false, error: "Unauthorized", status: 401 };
  }

  // Safely get role
  const userRole = (session.user as { role: string }).role || "engineer";

  if (!allowed.includes(userRole as Role)) {
    return { ok: false, error: "Forbidden", status: 403 };
  }

  return { ok: true };
}

export function requireAdmin(session: Session | null): GuardResult {
  return requireRole(session, ["admin"]);
}

export function requireEngineer(session: Session | null): GuardResult {
  return requireRole(session, ["admin", "engineer"]);
}
