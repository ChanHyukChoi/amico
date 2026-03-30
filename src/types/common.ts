/** API 성공 응답 (래핑된 REST — 서버 `success: true`) */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

/** API 실패 응답 — 서버는 `code`만 제공, UI 문구는 클라이언트 매핑 */
export interface ApiErrorResponse {
  success: false;
  code: string;
  /** HTTP 상태 (0 = 네트워크 실패 등) */
  status?: number;
}

/** API 응답 (성공 또는 에러) */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/** 페이지네이션 요청 파라미터 (쿼리/요청 body에서 사용) */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/** 페이지네이션된 리스트 응답 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

export function isApiError<T>(
  r: ApiResponse<T>,
): r is ApiErrorResponse {
  return !r.success;
}
