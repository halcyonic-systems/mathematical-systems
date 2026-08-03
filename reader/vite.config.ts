import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 5190/5191 belong to bert-lenses. strictPort so a collision fails loudly
  // instead of silently serving a different app on a port you expected.
  server: { port: 5192, strictPort: true },
});
