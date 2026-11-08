import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma CLI configuration.
 *
 * Migrations should run over a direct (non-pooled) connection. Set DIRECT_URL
 * explicitly, or let us derive it from a Neon pooled DATABASE_URL by removing
 * the `-pooler` host suffix. `prisma generate` never needs a database.
 */
function migrationUrl(): string {
  if (process.env.DIRECT_URL) return process.env.DIRECT_URL;
  const pooled = process.env.DATABASE_URL;
  if (!pooled) return "";
  return pooled.replace(/-pooler\./, ".");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx scripts/seed.ts",
  },
  datasource: {
    url: migrationUrl(),
  },
});
