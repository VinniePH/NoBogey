import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), "index.html"),
        getStarted: resolve(process.cwd(), "get-started/index.html"),
        privacy: resolve(process.cwd(), "privacy/index.html"),
        terms: resolve(process.cwd(), "terms/index.html")
      }
    }
  },
  server: { port: 8082 }
});
