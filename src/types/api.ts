/** 공통 API 래퍼 (목록 등) */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total: number;
  page: number;
  size: number;
  message: string;
}
