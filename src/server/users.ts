import { eq } from "drizzle-orm";
import { db, type Role, type User, users } from "@/lib/db";

export async function getAllUsers(): Promise<User[]> {
  return await db.select().from(users);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0];
}

export async function updateUserRole(
  userId: string,
  role: Role,
): Promise<User> {
  const result = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  if (!result[0]) throw new Error("User not found");
  return result[0];
}

export async function deleteUser(userId: string): Promise<void> {
  await db.delete(users).where(eq(users.id, userId));
}
