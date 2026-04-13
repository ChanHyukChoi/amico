//#region imports
import {
  AUTH_LOGIN_PATH,
  transportFetch,
  parseApiErrorCodeFromText,
  apply401AuthPolicy,
} from "@/api/clients/client";
import { API_ERROR_CODES } from "@/api/common/apiErrorCodes";
import type { LoginRequest, LoginResponse } from "@/types/auth";
import type { ApiResponse } from "@/types/common";
import { useAuthStore } from "@/store/authStore";
//#endregion

//#region helpers
/** 로그인 200 본문에서 토큰 추출 — `token`, `accessToken`, `{ success, data }` 등 */
function extractTokenFromLoginJson(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const o = json as Record<string, unknown>;
  const pick = (v: unknown): string | null =>
    typeof v === "string" && v.trim() !== "" ? v : null;

  let t =
    pick(o.token) ?? pick(o.accessToken) ?? pick(o.access_token);
  if (t) return t;

  if (o.data !== null && typeof o.data === "object") {
    const d = o.data as Record<string, unknown>;
    t = pick(d.token) ?? pick(d.accessToken) ?? pick(d.access_token);
    if (t) return t;
  }

  return null;
}
//#endregion

/**
 * POST /auth/login
 * 성공: `{ "token": string }` 등 (래핑·필드명은 extractTokenFromLoginJson 참고)
 * 실패: `{ "success": false, "code": string }` + HTTP 401 등
 */
//#region api
export async function login(
  body: LoginRequest,
): Promise<ApiResponse<LoginResponse>> {
  try {
    const res = await transportFetch(AUTH_LOGIN_PATH, {
      method: "POST",
      body: JSON.stringify(body),
    });
    const text = await res.text();

    if (res.ok) {
      try {
        const json = text.trim()
          ? (JSON.parse(text) as unknown)
          : null;
        const token = extractTokenFromLoginJson(json);
        if (token) {
          useAuthStore.getState().setAccessToken(token);
          const stored = useAuthStore.getState().accessToken;
          if (stored) {
            return { success: true, data: { token: stored } };
          }
        }
      } catch {
        void 0;
      }
      return {
        success: false,
        code: API_ERROR_CODES.UNKNOWN,
        status: res.status,
      };
    }

    if (res.status === 401) {
      const code =
        parseApiErrorCodeFromText(text) ??
        API_ERROR_CODES.AUTH_INVALID_CREDENTIALS;
      apply401AuthPolicy(AUTH_LOGIN_PATH, code);
      return { success: false, code, status: 401 };
    }

    const code =
      parseApiErrorCodeFromText(text) ?? API_ERROR_CODES.UNKNOWN;
    return { success: false, code, status: res.status };
  } catch {
    return {
      success: false,
      code: API_ERROR_CODES.CLIENT_NETWORK_ERROR,
      status: 0,
    };
  }
}

const AUTH_SESSION_PATH = "/auth/session";

/**
 * GET /auth/session — 현재 토큰이 서버에서 여전히 유효한지 확인.
 * - 404: 백엔드에 엔드포인트가 아직 없으면 세션 유지(폴링만 무시).
 * - 401: 본문이 `{ success:false, code }` 형식일 때만 apply401AuthPolicy 호출.
 *   (빈 본문/HTML 등은 게이트웨이·미구현 응답일 수 있어 로그인 직후 로그아웃 방지)
 */
export async function validateSession(): Promise<ApiResponse<void>> {
  let res: Response;
  try {
    res = await transportFetch(AUTH_SESSION_PATH, { method: "GET" });
  } catch {
    return {
      success: false,
      code: API_ERROR_CODES.CLIENT_NETWORK_ERROR,
      status: 0,
    };
  }

  const text = await res.text();
  const status = res.status;

  if (status === 404) {
    return { success: true, data: undefined };
  }

  if (status === 401) {
    const codeFromBody = parseApiErrorCodeFromText(text);
    if (codeFromBody === null) {
      if (import.meta.env.DEV) {
        console.warn(
          "[API] GET /auth/session 401 without { success:false, code } JSON — auth not cleared (check backend contract).",
        );
      }
      return {
        success: false,
        code: API_ERROR_CODES.AUTH_TOKEN_INVALID,
        status,
      };
    }
    apply401AuthPolicy(AUTH_SESSION_PATH, codeFromBody);
    return { success: false, code: codeFromBody, status };
  }

  if (status === 204) {
    return res.ok
      ? { success: true, data: undefined }
      : { success: false, code: API_ERROR_CODES.UNKNOWN, status };
  }

  if (!text.trim()) {
    return res.ok
      ? { success: true, data: undefined }
      : { success: false, code: API_ERROR_CODES.UNKNOWN, status };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
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
    if (p.success === true && "data" in p && res.ok) {
      return { success: true, data: undefined };
    }
  }

  if (!res.ok) {
    return {
      success: false,
      code: parseApiErrorCodeFromText(text) ?? API_ERROR_CODES.UNKNOWN,
      status,
    };
  }

  return { success: false, code: API_ERROR_CODES.UNKNOWN, status };
}

export function logout(): void {
  useAuthStore.getState().clearAuth();
}
//#endregion
