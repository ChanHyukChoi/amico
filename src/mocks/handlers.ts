import { http, HttpResponse } from "msw";
import type { User } from "@/types/user";

/** 개발용 목업 로그인 계정 (MSW 사용 시 이 값으로 로그인) */
export const MOCK_LOGIN = {
  username: "1",
  password: "1",
} as const;

/** userId → 비밀번호 (개발용 목업) */
const mockPasswords: Record<string, string> = {
  "1": "1",
  "2": "kim123",
  "3": "lee123",
};

/** 사용자 목업 저장소 */
const mockUsers: User[] = [
  {
    id: "1",
    userId: "1",
    name: "홍길동",
    department: "개발팀",
    email: "hong@example.com",
    createdAt: "2025-01-15T09:00:00Z",
  },
  {
    id: "2",
    userId: "2",
    name: "김철수",
    department: "인사팀",
    email: "kim@example.com",
    createdAt: "2025-02-01T10:30:00Z",
  },
  {
    id: "3",
    userId: "3",
    name: "이영희",
    department: "기획팀",
    email: "lee@example.com",
    createdAt: "2025-02-10T14:00:00Z",
  },
];

let nextId = 4;

export const handlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };
    const storedPw = mockPasswords[body.username ?? ""];
    const ok = storedPw != null && storedPw === body.password;
    if (ok) {
      return HttpResponse.json({
        success: true,
        data: { accessToken: "mock-access-token" },
      });
    }
    return HttpResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 },
    );
  }),

  http.post("/api/auth/logout", () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // Users API
  http.get("/api/users", ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "10", 10)),
    );
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";
    let filtered = mockUsers;
    if (search) {
      filtered = mockUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.userId.toLowerCase().includes(search) ||
          (u.department?.toLowerCase().includes(search) ?? false) ||
          (u.email?.toLowerCase().includes(search) ?? false),
      );
    }
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return HttpResponse.json({
      success: true,
      data: { items, total, page, pageSize },
    });
  }),

  http.get("/api/users/:id", ({ params }) => {
    const user = mockUsers.find((u) => u.id === params.id);
    if (!user) {
      return HttpResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true, data: user });
  }),

  http.post("/api/users", async ({ request }) => {
    const body = (await request.json()) as {
      userId?: string;
      password?: string;
      name?: string;
      department?: string;
      email?: string;
    };
    const uid = body.userId?.trim();
    if (!uid) {
      return HttpResponse.json(
        { success: false, message: "Login ID is required" },
        { status: 400 },
      );
    }
    if (mockUsers.some((u) => u.userId === uid)) {
      return HttpResponse.json(
        { success: false, message: "Login ID already exists" },
        { status: 400 },
      );
    }
    if (!body.password?.trim()) {
      return HttpResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 },
      );
    }
    if (!body.name?.trim()) {
      return HttpResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 },
      );
    }
    const newUser: User = {
      id: String(nextId++),
      userId: uid,
      name: body.name.trim(),
      department: body.department?.trim() || undefined,
      email: body.email?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    mockPasswords[uid] = body.password;
    mockUsers.push(newUser);
    return HttpResponse.json({ success: true, data: newUser });
  }),

  http.put("/api/users/:id", async ({ params, request }) => {
    const user = mockUsers.find((u) => u.id === params.id);
    if (!user) {
      return HttpResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }
    const body = (await request.json()) as {
      userId?: string;
      password?: string;
      name?: string;
      department?: string;
      email?: string;
    };
    if (body.userId !== undefined) {
      const uid = body.userId.trim();
      if (
        uid &&
        uid !== user.userId &&
        mockUsers.some((u) => u.userId === uid)
      ) {
        return HttpResponse.json(
          { success: false, message: "Login ID already exists" },
          { status: 400 },
        );
      }
      if (uid) user.userId = uid;
    }
    if (body.password?.trim()) mockPasswords[user.userId] = body.password;
    if (body.name !== undefined) user.name = body.name.trim();
    if (body.department !== undefined)
      user.department = body.department?.trim() || undefined;
    if (body.email !== undefined) user.email = body.email?.trim() || undefined;
    return HttpResponse.json({ success: true, data: user });
  }),

  http.delete("/api/users/:id", ({ params }) => {
    const idx = mockUsers.findIndex((u) => u.id === params.id);
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }
    mockUsers.splice(idx, 1);
    return HttpResponse.json({ success: true });
  }),
];
