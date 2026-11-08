import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Creates a Prisma client backed by the Neon serverless driver.
 * Shared by the Next.js server runtime (see ./index.ts) and Node scripts.
 * Never import this module from client components.
 */
export function createPrismaClient(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string.",
    );
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export type Database = ReturnType<typeof createPrismaClient>;
