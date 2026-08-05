import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
      //
      // The fallback alone still answers a cited deep link with HTTP status
      // 404 — the page works for a person and fails for a crawler, a link
      // preview, a cache. So every route the app knows is also written as a
      // real file at build time, each carrying its own <title>: the host now
      // says 200 and means it. The corpus is small and enumerable; this costs
      // nothing and the 404 fallback remains for routes that do not exist.
      name: "prerender-route-shells",
      closeBundle() {
        copyFileSync("dist/index.html", "dist/404.html");
        const html = readFileSync("dist/index.html", "utf8");
        const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const BASE_TITLE = "Atlas — Mathematical Systems";
        const shell = (dir: string, title: string) => {
          mkdirSync(`dist/${dir}`, { recursive: true });
          writeFileSync(
            `dist/${dir}/index.html`,
            html.replace(/<title>[^<]*<\/title>/, `<title>${escape(title)} · ${BASE_TITLE}</title>`),
          );
        };
        for (const [seg, label] of Object.entries({
          compare: "Compare",
          primitives: "Primitives",
          cases: "Cases",
          entailments: "Entailments",
          about: "About",
        }))
          shell(seg, label);
        const atlas = JSON.parse(readFileSync("dist/data/atlas.json", "utf8"));
        for (const e of atlas.entries) shell(`entry/${e.id}`, e.label ?? e.id);
      },
    },
  ],
  // 5190/5191 belong to bert-lenses. strictPort so a collision fails loudly
  // instead of silently serving a different app on a port you expected.
  server: { port: 5192, strictPort: true },
});
