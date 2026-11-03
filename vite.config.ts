import { defineConfig } from "vitest/config";
import { execFileSync } from "node:child_process";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname.replace(
        /^\/([A-Za-z]:)/,
        "$1",
      ),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "build-identity",
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "build-info.json",
          source: JSON.stringify({
            commit:
              process.env.GITHUB_SHA ??
              execFileSync("git", ["rev-parse", "HEAD"], {
                encoding: "utf8",
              }).trim(),
            builtAt: new Date().toISOString(),
            version: "0.2.2",
          }),
        });
      },
    },
  ],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.test.tsx", "src/**/*.test.ts"],
  },
});
