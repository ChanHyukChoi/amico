import { requestEnvelope } from "@/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/common";
import type {
  User,
  UserListParams,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/types/user";

export async function fetchUsers(
  params?: UserListParams,
): Promise<ApiResponse<PaginatedResponse<User>>> {
  const searchParams = new URLSearchParams();
  if (params?.page != null) searchParams.set("page", String(params.page));
  if (params?.pageSize != null)
    searchParams.set("pageSize", String(params.pageSize));
  if (params?.search) searchParams.set("search", params.search);
  const query = searchParams.toString();
  const path = query ? `/api/users?${query}` : "/api/users";
  return requestEnvelope<PaginatedResponse<User>>(path);
}

export async function fetchUser(id: string): Promise<ApiResponse<User>> {
  return requestEnvelope<User>(`/api/users/${id}`);
}

export async function createUser(
  body: CreateUserRequest,
): Promise<ApiResponse<User>> {
  return requestEnvelope<User>("/api/users", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateUser(
  id: string,
  body: UpdateUserRequest,
): Promise<ApiResponse<User>> {
  return requestEnvelope<User>(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  return requestEnvelope<void>(`/api/users/${id}`, { method: "DELETE" });
}
