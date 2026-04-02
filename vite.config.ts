import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import type { ClientRequest, IncomingMessage } from "http";

/** 일부 환경에서 프록시가 Authorization 을 누락하는 경우 대비 */
function forwardAuthorizationHeader(proxy: {
  on(
    event: "proxyReq",
    listener: (proxyReq: ClientRequest, req: IncomingMessage) => void,
  ): void;
}) {
  proxy.on("proxyReq", (proxyReq, req) => {
    const auth = req.headers.authorization;
    if (typeof auth === "string" && auth.length > 0) {
      proxyReq.setHeader("Authorization", auth);
    }
  });
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devProxyTarget = (
    env.VITE_DEV_PROXY_TARGET || "https://localhost:7255"
  ).replace(/\/$/, "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      proxy: {
        "/auth": {
          target: devProxyTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => forwardAuthorizationHeader(proxy),
        },
        "/api": {
          target: devProxyTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => forwardAuthorizationHeader(proxy),
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
