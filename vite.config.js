import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "https://cf-colab-cli.zambiancivilservant.workers.dev",
        changeOrigin: true,
      },
      "/login": {
        target: "https://cf-colab-cli.zambiancivilservant.workers.dev",
        changeOrigin: true,
      },
      "/logout": {
        target: "https://cf-colab-cli.zambiancivilservant.workers.dev",
        changeOrigin: true,
      },
      "/sessions": {
        target: "https://cf-colab-cli.zambiancivilservant.workers.dev",
        changeOrigin: true,
      },
      "/events": {
        target: "https://cf-colab-cli.zambiancivilservant.workers.dev",
        changeOrigin: true,
      },
      "/toggle": {
        target: "https://cf-colab-cli.zambiancivilservant.workers.dev",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
  },
});
