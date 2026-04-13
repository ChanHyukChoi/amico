import instance from "../common/instance";
import type { LoginRequest } from "@/types/auth";

export const login = async (body: LoginRequest) => {
  const { data } = await instance.post("/auth/login", body);
  sessionStorage.setItem("access_token", data.token);
  return data;
};

export const logout = async () => {
  await instance.post("/auth/logout");
  sessionStorage.removeItem("acess_token");
};

export const getSession = async () => {
  const { data } = await instance.get("/auth/session");
  return data;
};

/** 세션 폴링 등에서 사용 — `getSession`과 동일 */
export const validateSession = getSession;
