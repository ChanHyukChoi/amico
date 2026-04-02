/** 로그인 요청 */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 로그인 성공 시 클라이언트에 보관되는 토큰 (응답은 token / accessToken / data 래핑 등 지원) */
export interface LoginResponse {
  token: string;
}
