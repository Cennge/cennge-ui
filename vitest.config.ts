import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup.ts"],
    server: {
      deps: {
        // Through Vite, like in an app. Node itself cannot load Radix's ESM on React 17: its
        // "react/jsx-runtime" import needs a package "exports" map, which React has only since 18.
        inline: [/radix-ui/],
      },
    },
  },
});
