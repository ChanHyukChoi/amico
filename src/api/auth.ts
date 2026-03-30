import {
  AUTH_LOGIN_PATH,
  transportFetch,
  parseApiErrorCodeFromText,
  apply401AuthPolicy,
} from "@/api/client";
import { API_ERROR_CODES } from "@/api/apiErrorCodes";
import type { LoginRequest, LoginResponse } from "@/types/auth";
import type { ApiResponse } from "@/types/common";
import { useAuthStore } from "@/store/authStore";

/**
 * POST /auth/login
 * 성공: `{ "token": string }` (래핑 없음)
 * 실패: `{ "success": false, "code": string }` + HTTP 401 등
 */
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
        if (
          json &&
          typeof json === "object" &&
          "token" in json &&
          typeof (json as { token: unknown }).token === "string"
        ) {
          const token = (json as { token: string }).token;
          useAuthStore.getState().setAccessToken(token);
          return { success: true, data: { token } };
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

export function logout(): void {
  useAuthStore.getState().clearAuth();
}
