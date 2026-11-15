import { fileURLToPath } from "node:url";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

// The library lives one level up (a workspace link to its dist/): Turbopack must see the whole repository.
const root = fileURLToPath(new URL("..", import.meta.url));

const config: NextConfig = {
  // Plain static files: no server, no base path, so the site moves to any host as it is.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  pageExtensions: ["ts", "tsx", "mdx"],
  turbopack: { root },
  outputFileTracingRoot: root,
};

export default createMDX({})(config);
