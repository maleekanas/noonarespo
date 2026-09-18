import { prisma } from "../src/lib/database/prisma";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const requiredTables = ["users", "email_verification_tokens", "rate_limit_attempts"];
  const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name IN ('users','email_verification_tokens','rate_limit_attempts')
  `;
  const found = new Set(tables.map((row) => row.table_name));
  const missingTables = requiredTables.filter((name) => !found.has(name));

  const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users'
      AND column_name IN ('mfaEnabled','mfaSecretEncrypted','mfaRecoveryHashes','mfaLastUsedStep')
  `;
  const foundColumns = new Set(columns.map((row) => row.column_name));
  const requiredColumns = ["mfaEnabled", "mfaSecretEncrypted", "mfaRecoveryHashes", "mfaLastUsedStep"];
  const missingColumns = requiredColumns.filter((name) => !foundColumns.has(name));

  if (missingTables.length || missingColumns.length) {
    throw new Error(
      `Production schema is incomplete. Missing tables: ${missingTables.join(", ") || "none"}; missing users columns: ${missingColumns.join(", ") || "none"}. Apply the Prisma schema before deployment.`
    );
  }

  await prisma.$queryRaw`SELECT 1`;
  console.log("Production schema verification passed: database reachable and P0 auth tables/columns exist.");
}

main().finally(async () => prisma.$disconnect());
