// src/lib/auth.ts

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { count } from "drizzle-orm";
import { accounts, sessions, users, verifications } from "@/db/schema";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  databaseHooks: {
    user: {
      create: {
        async before(user) {
          const [row] = await db.select({ count: count() }).from(users);
          const isFirstUser = Number(row?.count ?? 0) === 0;

          return {
            data: {
              ...user,
              role: isFirstUser ? "admin" : "engineer",
            },
          };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "engineer",
        input: false,
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});

export type Session = typeof auth.$Infer.Session;
