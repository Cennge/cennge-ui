import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const src = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));

// Dev playground: imports the library straight from src/ for instant HMR.
export default defineConfig({
  root: "playground",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^cennge-ui\/utils$/, replacement: src("utils/index.ts") },
      { find: /^cennge-ui$/, replacement: src("index.ts") },
    ],
  },
});
