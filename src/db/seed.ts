import dotenv from "dotenv";

dotenv.config({ path: ".env.development" });

import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function seed() {
  // ... rest of seed code
  const testEmail = "you@example.com"; // Replace with your desired email
  const testPassword = "Password123!"; // Replace with your desired password
  const testName = "Test User";

  console.log(`Checking for existing user: ${testEmail}...`);

  const existingUser = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, testEmail))
    .limit(1);

  if (existingUser.length > 0) {
    console.log("User already exists! Cleaning up existing record...");
    await db.delete(schema.users).where(eq(schema.users.email, testEmail));
  }

  // Create user & hashed credentials via Better Auth
  await auth.api.signUpEmail({
    body: {
      email: testEmail,
      password: testPassword,
      name: testName,
    },
  });

  console.log("✅ Test user seeded successfully!");
  console.log(`Email: ${testEmail}`);
  console.log("Password: (hidden)");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
