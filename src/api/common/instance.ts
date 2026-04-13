// src/api/common/instance.ts
import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // httpOnly 쿠키 전송을 위해 필수
});

// 요청 인터셉터 - access token 붙이기
instance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터 - 401 시 refresh 시도
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // refresh token은 httpOnly 쿠키로 자동 전송됨
        const { data } = await axios.post(
          "/auth/refresh",
          {},
          { withCredentials: true },
        );

        const newToken = data.token;
        sessionStorage.setItem("access_token", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return instance(originalRequest); // 원래 요청 재시도
      } catch {
        sessionStorage.removeItem("access_token");
        window.location.href = "/login"; // refresh 실패 시 재로그인
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
