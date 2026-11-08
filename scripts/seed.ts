/**
 * Seeds a fresh database: applies the content import (categories, technologies,
 * tags, cheatsheets) and resets engagement counters if --reset is passed.
 *
 *   npm run db:seed
 *   npm run db:seed -- --reset   # also clears feedback and view counts
 */
import "dotenv/config";
import path from "node:path";
import { createPrismaClient } from "@/db/client";
import { ingestContent } from "@/lib/content/ingest";
import { ContentValidationError, loadContent } from "@/lib/content/loader";

async function main() {
  const reset = process.argv.includes("--reset");
  const bundle = await loadContent(path.resolve(process.cwd(), "content"));
  const db = createPrismaClient();
  try {
    if (reset) {
      await db.feedback.deleteMany();
      await db.cheatsheet.updateMany({ data: { viewCount: 0 } });
      console.log("✓ cleared feedback and view counts");
    }
    await ingestContent(db, bundle, { prune: true, log: console.log });
    console.log("Seed complete.");
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof ContentValidationError ? error.message : error);
  process.exit(1);
});
