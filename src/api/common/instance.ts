// src/api/common/instance.ts
import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { assertApiSuccess } from "@/lib/apiEnvelope";
import type { ApiResponse } from "@/types/api";
import { useAuthStore } from "@/store/authStore";

function requestUrl(config: InternalAxiosRequestConfig): string {
  return `${config.baseURL ?? ""}${config.url ?? ""}`;
}

const instance = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // httpOnly 쿠키 전송을 위해 필수
});

// 요청 인터셉터 - access token 붙이기
instance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터 — 공통 래퍼에서 success: false 이면 거부(HTTP 200이어도)
instance.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (
      payload &&
      typeof payload === "object" &&
      "success" in payload &&
      (payload as { success: unknown }).success === false
    ) {
      const message =
        typeof (payload as { message?: unknown }).message === "string"
          ? (payload as { message: string }).message
          : "Request failed";
      return Promise.reject(new Error(message));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 로그인 실패(401)는 토큰 만료가 아니므로 refresh·전체 페이지 이동을 하지 않음
    if (
      error.response?.status === 401 &&
      originalRequest &&
      requestUrl(originalRequest).includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // refresh token은 httpOnly 쿠키로 자동 전송됨
        const base =
          import.meta.env.VITE_API_BASE_URL ||
          import.meta.env.VITE_API_URL ||
          "";
        const { data } = await axios.post<ApiResponse<{ token: string }>>(
          `${base.replace(/\/$/, "")}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        assertApiSuccess(data);
        const newToken = data.data.token;
        useAuthStore.getState().setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return instance(originalRequest); // 원래 요청 재시도
      } catch {
        useAuthStore.getState().clearAuth();
        window.location.href = "/login"; // refresh 실패 시 재로그인
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
