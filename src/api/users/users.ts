import instance from "../common/instance";
import type { CreateUserRequest, UpdateUserRequest } from "@/types/user";

export const fetchUsers = async () => {
  const { data } = await instance.get("/users");
  return data;
};

export const getUser = async (id: number) => {
  const { data } = await instance.get(`/users/${id}`);
  return data;
};

export const createUser = async (body: CreateUserRequest) => {
  const { data } = await instance.post("/users", body);
  return data;
};

export const updateUser = async (id: number, body: UpdateUserRequest) => {
  const { data } = await instance.put(`/users/${id}`, body);
  return data;
};

export const deleteUser = async (id: number) => {
  const { data } = await instance.delete(`/users/${id}`);
  return data;
};
