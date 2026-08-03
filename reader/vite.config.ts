import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { copyFileSync } from "node:fs";
import { defineConfig } from "vite";

// Served from the repository root on a custom domain, and from /<repo>/ on a
// GitHub project page. Everything that builds a URL reads import.meta.env.BASE_URL
// rather than assuming "/", so the same build works under either and moving
// between them is a config change, not a rewrite.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [
    react(),
    tailwindcss(),
    {
      // GitHub Pages serves 404.html for any path it does not recognise. Entry
      // URLs (/entry/<id>) are real to the app and unknown to the host, so the
      // fallback IS the app. Without this a cited link 404s.
      name: "spa-fallback-for-pages",
      closeBundle() {
        copyFileSync("dist/index.html", "dist/404.html");
      },
    },
  ],
  // 5190/5191 belong to bert-lenses. strictPort so a collision fails loudly
  // instead of silently serving a different app on a port you expected.
  server: { port: 5192, strictPort: true },
});
