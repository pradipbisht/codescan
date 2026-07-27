import { PrismaClient } from "@/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

/**
 * Prisma Client singleton for Next.js + Neon (Prisma 7).
 *
 * - Runtime uses DATABASE_URL (Neon pooled / -pooler hostname recommended).
 * - Migrations use DIRECT_URL via prisma.config.ts.
 *
 * Import: `import { prisma } from "@/lib/prisma"`
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon pooled Postgres URL to `.env` (see `.env.example`)."
    );
  }

  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
