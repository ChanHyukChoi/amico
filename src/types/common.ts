/** API 성공 응답 공통 형태 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

/** API 에러 응답 공통 형태 */
export interface ApiErrorResponse {
  success: false;
  message: string;
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
