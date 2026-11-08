/**
 * Validates every MDX file under /content and imports it into PostgreSQL.
 *
 *   npm run content:import            # validate + upsert
 *   npm run content:import -- --prune # also archive cheatsheets whose file was removed
 *   npm run content:validate          # validate only, no database needed
 */
import "dotenv/config";
import path from "node:path";
import { createPrismaClient } from "@/db/client";
import { ingestContent } from "@/lib/content/ingest";
import { ContentValidationError, loadContent } from "@/lib/content/loader";

const args = new Set(process.argv.slice(2));
const contentDir = path.resolve(process.cwd(), "content");

async function revalidateDeployment() {
  const url = process.env.REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) return;
  const res = await fetch(url, { method: "POST", headers: { authorization: `Bearer ${secret}` } });
  console.log(res.ok ? `✓ revalidated ${url}` : `⚠ revalidation failed: ${res.status}`);
}

async function main() {
  const bundle = await loadContent(contentDir);
  console.log(`✓ validated ${bundle.documents.length} documents in ${path.relative(process.cwd(), contentDir)}/`);
  if (args.has("--validate-only")) return;

  const db = createPrismaClient();
  try {
    const result = await ingestContent(db, bundle, { prune: args.has("--prune"), log: console.log });
    console.log(`Done: ${result.cheatsheets} cheatsheets imported.`);
  } finally {
    await db.$disconnect();
  }
  await revalidateDeployment();
}

main().catch((error: unknown) => {
  console.error(error instanceof ContentValidationError ? error.message : error);
  process.exit(1);
});
