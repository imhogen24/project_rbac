import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, users } from "@/lib/db";

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set");
  }

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    console.log("Seed admin already exists, skipping.");
    return;
  }

  const result = await auth.api.signUpEmail({
    body: { email, password, name },
  });
  if (!result?.user?.id) throw new Error("Failed to seed admin user");

  await db
    .update(users)
    .set({ role: "admin" })
    .where(eq(users.id, result.user.id));
  console.log(`Seeded admin: ${email}`);
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
