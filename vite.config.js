import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => {
  return {
    plugins: [react()],

    // Development runs at localhost:5173/
    // Production runs at GitHub Pages /your-stay-concept/
    base:
      command === "serve"
        ? "/"
        : "/your-stay-concept/",

    build: {
      outDir: "dist",
      sourcemap: false,
      emptyOutDir: true,
    },
  };
});