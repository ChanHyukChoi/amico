import instance from "../common/instance";
import type { CreateUserRequest, UpdateUserRequest, User } from "@/types/user";

/**
 * GET /api/users — 성공 시 본문은 JSON 배열만 (페이지네이션·success 필드 없음).
 * axios는 2xx가 아니면 throw(ProblemDetails 등은 error.response.data).
 */
export const fetchUsers = async (): Promise<User[]> => {
  const { data } = await instance.get<unknown>("/api/users");
  if (!Array.isArray(data)) {
    throw new Error("Invalid users list response: expected JSON array");
  }
  return data as User[];
};

export const getUser = async (id: number) => {
  const { data } = await instance.get(`/api/users/${id}`);
  return data;
};

export const createUser = async (body: CreateUserRequest) => {
  const { data } = await instance.post("/api/users", body);
  return data;
};

export const updateUser = async (id: number, body: UpdateUserRequest) => {
  const { data } = await instance.put(`/api/users/${id}`, body);
  return data;
};

export const deleteUser = async (id: number) => {
  await instance.delete(`/api/users/${id}`);
};
