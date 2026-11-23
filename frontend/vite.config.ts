import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// En local el frontend habla con /api y Vite lo reenvia al backend (mismo esquema que el rewrite de Render).
// Asi las cookies de Better Auth quedan en el mismo origen que el frontend.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_URL ?? "http://localhost:3000",
        changeOrigin: false,
      },
    },
  },
});
