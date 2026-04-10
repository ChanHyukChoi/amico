import { requestEnvelope } from "@/api/client";
import { API_ERROR_CODES } from "@/api/apiErrorCodes";
import type { ApiResponse } from "@/types/common";

export type AmicoDeviceConnectResponse = {
  /** 장치 제어용 세션 문자열 (백엔드 응답 그대로 표시/보관) */
  session: string;
};

const SESSION_STRING_KEYS = [
  "session",
  "token",
  "accessToken",
  "access_token",
  "sessionToken",
  "SessionToken",
  "deviceToken",
  "Session",
  "Token",
] as const;

const SESSION_NEST_KEYS = [
  "data",
  "result",
  "value",
  "payload",
  "content",
] as const;

/** `POST .../connect` — 필드명·중첩 구조가 백엔드마다 달라도 문자열 세션 하나를 찾음 */
function extractSessionFromConnectData(
  data: unknown,
  depth = 0,
): string | null {
  if (depth > 6) return null;
  if (typeof data === "string") {
    const t = data.trim();
    return t.length > 0 ? t : null;
  }
  if (typeof data === "number" && Number.isFinite(data)) {
    return String(data);
  }
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  for (const k of SESSION_STRING_KEYS) {
    const c = o[k];
    if (typeof c === "string") {
      const t = c.trim();
      if (t.length > 0) return t;
    }
    if (typeof c === "number" && Number.isFinite(c)) {
      return String(c);
    }
  }
  for (const k of SESSION_NEST_KEYS) {
    const inner = o[k];
    if (inner !== undefined && inner !== null) {
      const found = extractSessionFromConnectData(inner, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

/** AMICO: 장치 세션 — POST /api/devices/{id}/connect (Bearer는 client에서 자동) */
export async function connectAmicoDevice(
  id: number,
): Promise<ApiResponse<AmicoDeviceConnectResponse>> {
  const res = await requestEnvelope<unknown>(`/api/devices/${id}/connect`, {
    method: "POST",
  });
  if (!res.success) return res;
  const session = extractSessionFromConnectData(res.data);
  if (!session) {
    return {
      success: false,
      code: API_ERROR_CODES.UNKNOWN,
      status: 200,
    };
  }
  return { success: true, data: { session } };
}
