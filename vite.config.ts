import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { createApiMockMiddleware } from "./vite/mockApi";

const useRealApi = process.env.VITE_USE_REAL_API === "true";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "api-mock",
      configureServer(server) {
        if (!useRealApi) {
          server.middlewares.use(createApiMockMiddleware());
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: useRealApi
      ? {
          "/api": {
            target: "http://localhost:45123",
            changeOrigin: true,
          },
        }
      : undefined,
  },
});
