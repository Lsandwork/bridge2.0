import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000";
const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
  turbopack: {
    root: monorepoRoot,
  },
};

export default nextConfig;
