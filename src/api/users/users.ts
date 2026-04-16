import instance from "../common/instance";
import { assertApiSuccess } from "@/lib/apiEnvelope";
import type { ApiResponse } from "@/types/api";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserListParams,
} from "@/types/user";

function buildUserListQuery(
  params?: UserListParams,
): Record<string, string | number> | undefined {
  if (!params) return undefined;
  const q: Record<string, string | number> = {};
  if (params.page != null) q.page = params.page;
  if (params.pageSize != null) q.size = params.pageSize;
  const s = params.search?.trim();
  if (s) q.search = s;
  return Object.keys(q).length ? q : undefined;
}

/**
 * GET /api/users — 본문은 `ApiResponse<User[]>`.
 * `success === false` 이면 예외(message).
 */
export const fetchUsers = async (
  params?: UserListParams,
): Promise<ApiResponse<User[]>> => {
  const { data } = await instance.get<ApiResponse<User[]>>("/api/users", {
    params: buildUserListQuery(params),
  });
  assertApiSuccess(data);
  if (!Array.isArray(data.data)) {
    throw new Error("Invalid users list response: data must be an array");
  }
  return data;
};

export const getUser = async (id: number) => {
  const { data } = await instance.get<ApiResponse<User>>(`/api/users/${id}`);
  assertApiSuccess(data);
  return data.data;
};

export const createUser = async (body: CreateUserRequest) => {
  const { data } = await instance.post<ApiResponse<User>>("/api/users", body);
  assertApiSuccess(data);
  return data.data;
};

export const updateUser = async (id: number, body: UpdateUserRequest) => {
  const { data } = await instance.put<ApiResponse<User>>(
    `/api/users/${id}`,
    body,
  );
  assertApiSuccess(data);
  return data.data;
};

export const deleteUser = async (id: number) => {
  const res = await instance.delete<ApiResponse<unknown>>(`/api/users/${id}`);
  if (res.status === 204 || res.data == null) return;
  assertApiSuccess(res.data);
};
