import type { NextConfig } from "next";
import path from "path";

/**
 * Parent folder C:\Users\ACER also has a package-lock.json, so Next may pick
 * the wrong Turbopack root and look for src/middleware.ts in the wrong place.
 * Pin root to the directory where `npm run dev` is started (this project).
 */
const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
