import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// base: "./" makes asset paths relative, so the app works under
// https://<user>.github.io/<repo>/ without editing anything per repo name.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "apple-touch-icon.png"],
      manifest: {
        name: "Deutsch A0–B1 — граматика та письмо",
        short_name: "Deutsch B1",
        description:
          "Тренажер німецької: граматика A0–B1, письмо (Schreiben), інтервальні повторення. Працює офлайн.",
        lang: "uk",
        display: "standalone",
        orientation: "portrait",
        theme_color: "#13151a",
        background_color: "#13151a",
        start_url: ".",
        scope: ".",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // cache everything the build produces → full offline support
        globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
      },
    }),
  ],
  base: "./",
});
