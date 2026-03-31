/** 사용자 엔티티 */
export interface User {
  id: number;
  /** 로그인 ID */
  userId: string;
  name: string;
  department?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 사용자 목록 조회 파라미터 */
export interface UserListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/** 사용자 생성 요청 */
export interface CreateUserRequest {
  userId: string;
  password: string;
  name: string;
  department?: string;
  email?: string;
}

/** 사용자 수정 요청 */
export interface UpdateUserRequest {
  userId?: string;
  password?: string;
  name?: string;
  department?: string;
  email?: string;
}
