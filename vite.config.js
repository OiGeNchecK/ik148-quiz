import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" makes asset paths relative, so the app works under
// https://<user>.github.io/<repo>/ without editing anything per repo name.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
