import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: {
    port: 5173,        // ⬅️ usa 5173
    strictPort: true,
    host: false,
    watch: { ignored: ["**/src-tauri/**"] },
    // sin override de HMR: que use el puerto del server
  },
});
