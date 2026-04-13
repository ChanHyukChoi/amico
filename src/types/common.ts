//#region api
/** API 성공 응답 (래핑된 REST — 서버 `success: true`) */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

/** API 실패 응답 — 구분은 주로 `status`(HTTP 또는 0=네트워크). `code`는 서버 본문 비즈니스 코드가 있을 때만 */
export interface ApiErrorResponse {
  success: false;
  /** HTTP 상태. 네트워크 실패 등은 0 */
  status: number;
  /** 서버가 준 문자열 코드(옵션). 없으면 UI는 status·공통 문구로 처리 */
  code?: string;
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

export function isApiError<T>(r: ApiResponse<T>): r is ApiErrorResponse {
  return !r.success;
}

export function apiOk<T>(data: T): ApiSuccessResponse<T> {
  return { success: true, data };
}

export function apiFail(status: number, code?: string): ApiErrorResponse {
  if (code !== undefined && code !== "") {
    return { success: false, status, code };
  }
  return { success: false, status };
}
//#endregion
