// import dotenv from "dotenv";

// dotenv.config({ path: ".env.development" });

// import { eq } from "drizzle-orm";
// import * as schema from "@/db/schema";

// async function seed() {
//   const [{ auth }, { db }] = await Promise.all([
//     import("@/lib/auth"),
//     import("@/lib/db"),
//   ]);

//   // ... rest of seed code
//   const testEmail = "you@example.com"; // Replace with your desired email
//   const testPassword = "Password123!"; // Replace with your desired password
//   const testName = "Test User";

//   console.log(`Checking for existing user: ${testEmail}...`);

//   const existingUser = await db
//     .select()
//     .from(schema.users)
//     .where(eq(schema.users.email, testEmail))
//     .limit(1);

//   if (existingUser.length > 0) {
//     console.log("User already exists! Cleaning up existing record...");
//     await db.delete(schema.users).where(eq(schema.users.email, testEmail));
//   }

//   // Create user & hashed credentials via Better Auth
//   await auth.api.signUpEmail({
//     body: {
//       email: testEmail,
//       password: testPassword,
//       name: testName,
//     },
//   });

//   console.log("Test user seeded successfully!");
//   console.log(`Email: ${testEmail}`);
//   console.log("Password: (hidden)");
//   process.exit(0);
// }

// seed().catch((err) => {
//   console.error("❌ Seeding failed:", err);
//   process.exit(1);
// });
// scripts/seed.ts

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
