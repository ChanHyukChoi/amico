import { useAuthStore } from "@/store/authStore";
import type { ApiResponse } from "@/types/common";
import { API_ERROR_CODES } from "@/api/apiErrorCodes";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export const AUTH_LOGIN_PATH = "/auth/login";

function logJsonParseFailure(status: number, textPreview: string): void {
  if (!import.meta.env.DEV && import.meta.env.VITE_API_DEBUG !== "true") return;
  console.warn(`[API] JSON parse failed (HTTP ${status}):`, textPreview);
}

/** `{ "success": false, "code": "..." }` 에서 code 추출 */
export function parseApiErrorCodeFromText(text: string): string | null {
  if (!text.trim()) return null;
  try {
    const o = JSON.parse(text) as unknown;
    if (
      o &&
      typeof o === "object" &&
      (o as { success?: unknown }).success === false &&
      typeof (o as { code?: unknown }).code === "string"
    ) {
      return (o as { code: string }).code;
    }
  } catch {
    logJsonParseFailure(0, text.slice(0, 300));
  }
  return null;
}

/** 401 시 로컬 인증 정리 — 로그인 실패(AUTH_INVALID_CREDENTIALS)만 예외 */
export function apply401AuthPolicy(path: string, code: string): void {
  if (path === AUTH_LOGIN_PATH && code === API_ERROR_CODES.AUTH_INVALID_CREDENTIALS) {
    return;
  }
  useAuthStore.getState().clearAuth();
}

export async function transportFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = useAuthStore.getState().accessToken;
  const method = (init.method ?? "GET").toUpperCase();
  const url = `${BASE_URL}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...init.headers,
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  if (import.meta.env.DEV) {
    // 최소 로그: 요청/응답 라인만
    console.log("[API] ->", method, url);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  if (import.meta.env.DEV) {
    console.log("[API] <-", res.status, method, url);
  }

  return res;
}

/**
 * 래핑 REST 응답 `{ success, data }` 파싱.
 * - 204: 본문 없이 성공
 * - 본문 `success: false`면 HTTP 200이어도 실패
 * - 401: 본문 `code`·경로에 따라 인증 정리
 */
export async function requestEnvelope<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await transportFetch(path, init);
  } catch {
    return {
      success: false,
      code: API_ERROR_CODES.CLIENT_NETWORK_ERROR,
      status: 0,
    };
  }

  if (res.status === 204) {
    if (res.ok) {
      return { success: true, data: undefined as T };
    }
    return {
      success: false,
      code: API_ERROR_CODES.UNKNOWN,
      status: res.status,
    };
  }

  const text = await res.text();
  const status = res.status;

  if (status === 401) {
    const code =
      parseApiErrorCodeFromText(text) ??
      (path === AUTH_LOGIN_PATH
        ? API_ERROR_CODES.AUTH_INVALID_CREDENTIALS
        : API_ERROR_CODES.AUTH_TOKEN_INVALID);
    apply401AuthPolicy(path, code);
    return { success: false, code, status };
  }

  if (!text.trim()) {
    if (!res.ok) {
      return { success: false, code: API_ERROR_CODES.UNKNOWN, status };
    }
    return { success: true, data: undefined as T };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    logJsonParseFailure(status, text.slice(0, 300));
    return { success: false, code: API_ERROR_CODES.UNKNOWN, status };
  }

  if (parsed && typeof parsed === "object" && "success" in parsed) {
    const p = parsed as {
      success: unknown;
      code?: unknown;
      data?: unknown;
    };
    if (p.success === false) {
      const code =
        typeof p.code === "string" ? p.code : API_ERROR_CODES.UNKNOWN;
      return { success: false, code, status };
    }
    if (p.success === true && "data" in p) {
      if (!res.ok) {
        return { success: false, code: API_ERROR_CODES.UNKNOWN, status };
      }
      return { success: true, data: p.data as T };
    }
  }

  if (!res.ok) {
    const code = parseApiErrorCodeFromText(text) ?? API_ERROR_CODES.UNKNOWN;
    return { success: false, code, status };
  }

  return { success: false, code: API_ERROR_CODES.UNKNOWN, status };
}
