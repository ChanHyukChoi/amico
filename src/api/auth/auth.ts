import instance from "../common/instance";
import type { LoginRequest } from "@/types/auth";
import { useAuthStore } from "@/store/authStore";

export const login = async (body: LoginRequest) => {
  const { data } = await instance.post("/auth/login", body);
  useAuthStore.getState().setAccessToken(data.token);
  return data;
};

export const logout = async () => {
  await instance.post("/auth/logout");
  useAuthStore.getState().clearAuth();
};

export const getSession = async () => {
  const { data } = await instance.get("/auth/session");
  return data;
};

/** 세션 폴링 등에서 사용 — `getSession`과 동일 */
export const validateSession = getSession;
