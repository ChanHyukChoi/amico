/**
 * Vite 개발 서버용 API 목업 미들웨어.
 * 백엔드가 없을 때 ECONNREFUSED를 방지하기 위해 프록시보다 먼저 /api 요청을 처리합니다.
 * VITE_USE_REAL_API=true 일 때는 프록시를 사용하고, 이 미들웨어는 동작하지 않습니다.
 */
import type { IncomingMessage, ServerResponse } from "node:http";

type NextHandleFunction = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) => void | Promise<void>;

interface User {
  id: string;
  name: string;
  department?: string;
  email?: string;
  createdAt?: string;
}

export const MOCK_LOGIN = {
  username: "1",
  password: "1",
} as const;

const mockUsers: User[] = [
  {
    id: "1",
    name: "홍길동",
    department: "개발팀",
    email: "hong@example.com",
    createdAt: "2025-01-15T09:00:00Z",
  },
  {
    id: "2",
    name: "김철수",
    department: "인사팀",
    email: "kim@example.com",
    createdAt: "2025-02-01T10:30:00Z",
  },
  {
    id: "3",
    name: "이영희",
    department: "기획팀",
    email: "lee@example.com",
    createdAt: "2025-02-10T14:00:00Z",
  },
];

let nextId = 4;

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer | string) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

export function createApiMockMiddleware(): NextHandleFunction {
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) => {
    const url = req.url ?? "";
    if (!url.startsWith("/api")) return next();

    const path = url.split("?")[0];
    const method = req.method ?? "GET";

    try {
      if (method === "POST" && path === "/api/auth/login") {
        const body = JSON.parse(await readBody(req)) as {
          username?: string;
          password?: string;
        };
        const ok =
          body.username === MOCK_LOGIN.username &&
          body.password === MOCK_LOGIN.password;
        if (ok) {
          sendJson(res, 200, {
            success: true,
            data: { accessToken: "mock-access-token" },
          });
          return;
        }
        sendJson(res, 401, {
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      if (method === "POST" && path === "/api/auth/logout") {
        res.statusCode = 200;
        res.end();
        return;
      }

      if (method === "GET" && path === "/api/users") {
        const parsed = new URL(url, "http://localhost");
        const page = Math.max(
          1,
          parseInt(parsed.searchParams.get("page") ?? "1", 10),
        );
        const pageSize = Math.min(
          50,
          Math.max(
            1,
            parseInt(parsed.searchParams.get("pageSize") ?? "10", 10),
          ),
        );
        const search = parsed.searchParams.get("search")?.toLowerCase() ?? "";
        let filtered = mockUsers;
        if (search) {
          filtered = mockUsers.filter(
            (user) =>
              user.name.toLowerCase().includes(search) ||
              (user.department?.toLowerCase().includes(search) ?? false) ||
              (user.email?.toLowerCase().includes(search) ?? false),
          );
        }
        const total = filtered.length;
        const start = (page - 1) * pageSize;
        const items = filtered.slice(start, start + pageSize);
        sendJson(res, 200, {
          success: true,
          data: { items, total, page, pageSize },
        });
        return;
      }

      const getUserId = path.match(/^\/api\/users\/([^/]+)$/);
      if (method === "GET" && getUserId) {
        const user = mockUsers.find((u) => u.id === getUserId[1]);
        if (!user) {
          sendJson(res, 404, {
            success: false,
            message: "User not found",
          });
          return;
        }
        sendJson(res, 200, { success: true, data: user });
        return;
      }

      if (method === "POST" && path === "/api/users") {
        const body = JSON.parse(await readBody(req)) as {
          name?: string;
          department?: string;
          email?: string;
        };
        if (!body.name?.trim()) {
          sendJson(res, 400, {
            success: false,
            message: "Name is required",
          });
          return;
        }
        const newUser: User = {
          id: String(nextId++),
          name: body.name.trim(),
          department: body.department?.trim() || undefined,
          email: body.email?.trim() || undefined,
          createdAt: new Date().toISOString(),
        };
        mockUsers.push(newUser);
        sendJson(res, 200, { success: true, data: newUser });
        return;
      }

      const putUserId = path.match(/^\/api\/users\/([^/]+)$/);
      if (method === "PUT" && putUserId) {
        const user = mockUsers.find((u) => u.id === putUserId[1]);
        if (!user) {
          sendJson(res, 404, {
            success: false,
            message: "User not found",
          });
          return;
        }
        const body = JSON.parse(await readBody(req)) as {
          name?: string;
          department?: string;
          email?: string;
        };
        if (body.name !== undefined) user.name = body.name.trim();
        if (body.department !== undefined)
          user.department = body.department?.trim() || undefined;
        if (body.email !== undefined)
          user.email = body.email?.trim() || undefined;
        sendJson(res, 200, { success: true, data: user });
        return;
      }

      const delUserId = path.match(/^\/api\/users\/([^/]+)$/);
      if (method === "DELETE" && delUserId) {
        const idx = mockUsers.findIndex((u) => u.id === delUserId[1]);
        if (idx === -1) {
          sendJson(res, 404, {
            success: false,
            message: "User not found",
          });
          return;
        }
        mockUsers.splice(idx, 1);
        sendJson(res, 200, { success: true });
        return;
      }

      return next();
    } catch {
      return next();
    }
  };
}
