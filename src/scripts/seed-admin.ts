import { config } from "dotenv";
import { auth } from "@/lib/auth";
import { db, users } from "@/lib/db";

config({ path: ".env.development" });

async function seedAdmin() {
  console.log("🌱 Seeding admin...");

  try {
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("⚠️ Users exist. Skipping.");
      return;
    }

    await auth.api.signUpEmail({
      body: {
        email: "admin@example.com",
        password: "Admin123!",
        name: "Admin",
      },
    });

    console.log("✅ Admin created: admin@example.com / Admin123!");
  } catch (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }
}

seedAdmin();
