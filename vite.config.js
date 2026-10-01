import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";

const apiTarget = process.env.VITE_DEV_API || "http://127.0.0.1:8790";

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
    proxy: {
      "/api": { target: apiTarget, changeOrigin: true },
      "/sessions": { target: apiTarget, changeOrigin: true },
      "/events": { target: apiTarget, changeOrigin: true },
      "/toggle": { target: apiTarget, changeOrigin: true },
      "/login": { target: apiTarget, changeOrigin: true },
      "/logout": { target: apiTarget, changeOrigin: true },
    },
  },
  preview: {
    proxy: {
      "/api": { target: apiTarget, changeOrigin: true },
      "/sessions": { target: apiTarget, changeOrigin: true },
      "/events": { target: apiTarget, changeOrigin: true },
      "/toggle": { target: apiTarget, changeOrigin: true },
      "/login": { target: apiTarget, changeOrigin: true },
      "/logout": { target: apiTarget, changeOrigin: true },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
  },
});
