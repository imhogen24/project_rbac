import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

// Lazy-load the database connection
let dbInstance: NeonHttpDatabase<typeof schema> | null = null;

export function getDb() {
  if (!dbInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined");
    }
    const sql = neon(process.env.DATABASE_URL);
    dbInstance = drizzle(sql, { schema });
  }
  return dbInstance;
}

// Export a proxy that lazy-initializes the db with proper types
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get: (_target, prop) => {
    const instance = getDb();
    const value = instance[prop as keyof typeof instance];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export * from "@/db/schema";
