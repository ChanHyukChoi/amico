//#region user
/** 사용자 엔티티 (GET /api/users 목록 항목과 동일 — 로그인 ID는 username) */
export interface User {
  id: number;
  username: string;
  name: string;
  department?: string | null;
  email?: string | null;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 사용자 생성 요청 */
export interface CreateUserRequest {
  username: string;
  password: string;
  name: string;
  department?: string;
  email?: string;
}

/** 사용자 수정 요청 */
export interface UpdateUserRequest {
  username?: string;
  password?: string;
  name?: string;
  department?: string;
  email?: string;
}

export type UserDetailRow = {
  id: string;
  __isDetail: true;
  parent: User;
};
//#endregion
