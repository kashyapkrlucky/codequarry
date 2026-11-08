import "server-only";
import { createPrismaClient, type Database } from "./client";

const globalForDb = globalThis as unknown as { __cqDb?: Database };

/**
 * Lazily-created singleton so that importing this module never throws during
 * builds without DATABASE_URL — only an actual query does.
 */
export function getDb(): Database {
  if (!globalForDb.__cqDb) {
    globalForDb.__cqDb = createPrismaClient();
  }
  return globalForDb.__cqDb;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
