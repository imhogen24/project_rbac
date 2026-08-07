// src/app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RoleBanner } from "@/components/dashboard/role-banner";
import { AdminUserTable } from "@/components/dashboard/admin-user-table";
import { db } from "@/lib/db";
import { users as usersTable, type Role } from "@/db/schema";

// Type matching AdminUserTable's required prop shape
type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const userRole = (session.user.role as Role) || "engineer";

  // Explicitly type the array so TypeScript doesn't infer 'any[]'
  let usersList: User[] = [];

  if (userRole === "admin") {
    // Fetch users from database using Drizzle
    const dbUsers = await db.select().from(usersTable);
    usersList = dbUsers.map((u) => ({
      id: u.id,
      name: u.name ?? "",
      email: u.email,
      role: u.role as Role,
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <RoleBanner role={userRole === "admin" ? "admin" : "engineer"} />

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        {userRole === "admin" ? (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">
                System Users Overview
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage accounts and roles across the organization.
              </p>
            </div>
            <AdminUserTable users={usersList} />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-card-foreground">
              Engineer Workspace
            </h2>
            <p className="text-sm text-muted-foreground">
              Welcome back. Access your active workspace and projects here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}