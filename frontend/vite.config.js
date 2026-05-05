import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Each project is served from /api/preview/{project_id}/, so emit assets with a
  // relative base so the built bundle works under any sub-path.
  base: "./",
  build: {
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
  },
});
