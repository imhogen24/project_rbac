// src/app/(protected)/admin/page.tsx

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { AdminUserTable } from "@/components/dashboard/admin-user-table";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Server-side role check: only admins can access
  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch all users from database
  const dbUsers = await db.select().from(users);

  // Transform to the format expected by AdminUserTable
  const usersList = dbUsers.map((u) => ({
    id: u.id,
    name: u.name ?? "",
    email: u.email,
    role: u.role as "admin" | "engineer",
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">
            Admin Panel
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage users and roles in the system.
          </p>
        </div>

        {/* User Table Section */}
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-md font-semibold text-card-foreground">
              System Users ({usersList.length})
            </h3>
          </div>
          <AdminUserTable users={usersList} />
        </div>

        {/* Create User Form Section */}
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-md font-semibold text-card-foreground">
              Create New User
            </h3>
          </div>
          <CreateUserForm />
        </div>
      </div>
    </div>
  );
}
