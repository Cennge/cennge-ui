import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const src = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));

// Dev playground: imports the library straight from src/ for instant HMR.
export default defineConfig({
  root: "playground",
  plugins: [react(), tailwindcss()],
  // The e2e server needs no hot reload: its WebSocket could drop under load (a console error that
  // fails the test), and edits made during a run would reload pages mid-test.
  server: { hmr: process.env.CENNGE_E2E ? false : undefined },
  resolve: {
    alias: [
      { find: /^cennge-ui\/utils$/, replacement: src("utils/index.ts") },
      { find: /^cennge-ui$/, replacement: src("index.ts") },
    ],
  },
});
