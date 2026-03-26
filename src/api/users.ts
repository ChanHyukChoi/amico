import { apiFetch } from '@/api/client';
import type { ApiResponse, PaginatedResponse } from '@/types/common';
import type {
  User,
  UserListParams,
  CreateUserRequest,
  UpdateUserRequest,
} from '@/types/user';

/** 사용자 목록 조회 */
export async function fetchUsers(
  params?: UserListParams
): Promise<ApiResponse<PaginatedResponse<User>>> {
  const searchParams = new URLSearchParams();
  if (params?.page != null) searchParams.set('page', String(params.page));
  if (params?.pageSize != null)
    searchParams.set('pageSize', String(params.pageSize));
  if (params?.search) searchParams.set('search', params.search);
  const query = searchParams.toString();
  const path = query ? `/users?${query}` : '/users';
  const res = await apiFetch(path);
  return res.json() as Promise<ApiResponse<PaginatedResponse<User>>>;
}

/** 사용자 단건 조회 */
export async function fetchUser(id: string): Promise<ApiResponse<User>> {
  const res = await apiFetch(`/users/${id}`);
  return res.json() as Promise<ApiResponse<User>>;
}

/** 사용자 생성 */
export async function createUser(
  body: CreateUserRequest
): Promise<ApiResponse<User>> {
  const res = await apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.json() as Promise<ApiResponse<User>>;
}

/** 사용자 수정 */
export async function updateUser(
  id: string,
  body: UpdateUserRequest
): Promise<ApiResponse<User>> {
  const res = await apiFetch(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return res.json() as Promise<ApiResponse<User>>;
}

/** 사용자 삭제 */
export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  const res = await apiFetch(`/users/${id}`, { method: 'DELETE' });
  return res.json() as Promise<ApiResponse<void>>;
}
