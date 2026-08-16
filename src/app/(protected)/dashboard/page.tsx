// src/app/(protected)/dashboard/page.tsx

import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RoleBanner } from "@/components/dashboard/role-banner";
import { Button } from "@/components/ui/button";
import { type Role, users as usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const userRole = (session.user.role as Role) || "engineer";

  let userCount = 0;

  if (userRole === "admin") {
    const dbUsers = await db.select({ id: usersTable.id }).from(usersTable);
    userCount = dbUsers.length;
  }

  return (
    <div className="flex flex-col gap-6">
      <RoleBanner role={userRole === "admin" ? "admin" : "engineer"} />

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        {userRole === "admin" ? (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">
                Admin Overview
              </h2>
              <p className="text-sm text-muted-foreground">
                {userCount} total {userCount === 1 ? "user" : "users"} in the
                system.
              </p>
            </div>
            <Link href="/admin">
              <Button>Go to Admin Panel</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-card-foreground">
              Engineer Workspace
            </h2>
            <p className="text-sm text-muted-foreground">
              You are in your assigned workspace.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
