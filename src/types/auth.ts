/** 로그인 요청 */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 로그인 성공 응답 (accessToken만 프론트 저장, refreshToken은 httpOnly 쿠키) */
export interface LoginResponse {
  accessToken: string;
}
