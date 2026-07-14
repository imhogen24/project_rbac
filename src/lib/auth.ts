import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { count } from "drizzle-orm";
import { accounts, sessions, users, verifications } from "@/db/schema";
import { db } from "./db";

export const auth = betterAuth({
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET || "",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: ["http://localhost:3000"],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "engineer",
        input: false, // clients can never set their own role on sign-up
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const [{ value: existingUsers }] = await db
            .select({ value: count() })
            .from(users);

          // First account ever created becomes admin; everyone after is engineer.
          const role = existingUsers === 0 ? "admin" : "engineer";

          return { data: { ...user, role } };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
