import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/NoBogey/admin-assets/" : "/",
  plugins: [react()],
  server: { port: 8080 }
});
