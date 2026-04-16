//#region auth
/** 로그인 요청 */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 로그인 응답의 `data` 안 필드 (`ApiResponse<{ token: string }>`) */
export interface LoginResponse {
  token: string;
}
//#endregion
