import type { ApiResponse } from "@/types/api";

/** 백엔드 공통 래퍼 본문인지(느슨히) 판별 */
export function isApiEnvelope(body: unknown): body is ApiResponse<unknown> {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.success === "boolean" &&
    "data" in b &&
    typeof b.message === "string"
  );
}

/** `success === false` 이면 예외. 이후 `body.data` 사용 가능 */
export function assertApiSuccess<T>(body: ApiResponse<T>): void {
  if (!body.success) {
    throw new Error(body.message || "API error");
  }
}
