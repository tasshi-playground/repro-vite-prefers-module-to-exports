import { defineConfig } from "vite";

/** @type {import('vite').UserConfig} */
const config = {
  build: {
    rollupOptions: {
      input: "src/index.mjs",
      output: {
        format: "cjs",
        entryFileNames: "[name].vite.cjs",
      },
    },
  },
};
export default defineConfig(config);
