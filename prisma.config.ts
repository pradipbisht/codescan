// Prisma CLI config (migrations, db push, studio).
// Neon: use the DIRECT (non-pooler) connection string here.
// App queries use the pooled DATABASE_URL via @prisma/adapter-neon.

import "dotenv/config";
import { defineConfig } from "prisma/config";

const datasourceUrl =
  process.env.DIRECT_URL || process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prefer DIRECT_URL for migrations; fall back to DATABASE_URL if only one is set.
    url: datasourceUrl,
  },
});
