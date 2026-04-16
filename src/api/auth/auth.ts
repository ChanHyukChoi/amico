import instance from "../common/instance";
import { assertApiSuccess } from "@/lib/apiEnvelope";
import type { LoginRequest } from "@/types/auth";
import type { ApiResponse } from "@/types/api";
import { useAuthStore } from "@/store/authStore";

export const login = async (body: LoginRequest) => {
  const { data } = await instance.post<ApiResponse<{ token: string }>>(
    "/auth/login",
    body,
  );
  assertApiSuccess(data);
  useAuthStore.getState().setAccessToken(data.data.token);
  return data;
};

export const logout = async () => {
  await instance.post("/auth/logout");
  useAuthStore.getState().clearAuth();
};

export const getSession = async () => {
  const { data } = await instance.get<ApiResponse<unknown>>("/auth/session");
  assertApiSuccess(data);
  return data;
};

/** 세션 폴링 등에서 사용 — `getSession`과 동일 */
export const validateSession = getSession;
