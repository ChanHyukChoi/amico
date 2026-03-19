/** 로그인 요청 */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 로그인 성공 응답 - ASP.NET 백엔드: { "token": "..." } */
export interface LoginResponse {
  token: string;
}
