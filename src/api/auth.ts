import { apiFetch } from '@/api/client';
import type { LoginRequest, LoginResponse } from '@/types/auth';
import type { ApiResponse } from '@/types/common';
import { useAuthStore } from '@/store/authStore';

/**
 * POST /auth/login
 * 백엔드 응답: { "token": "JWT토큰" } (성공) | HTTP 4xx (실패)
 */
export async function login(
  body: LoginRequest
): Promise<ApiResponse<LoginResponse>> {
  try {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = (await res.json()) as LoginResponse;
      useAuthStore.getState().setAccessToken(data.token);
      return { success: true, data };
    }

    // 401 등 에러 응답
    let message = '로그인에 실패했습니다.';
    try {
      const err = (await res.json()) as { message?: string };
      if (err.message) message = err.message;
    } catch {
      // 응답 본문이 JSON이 아닐 경우 기본 메시지 사용
    }
    return { success: false, message };
  } catch {
    return { success: false, message: '서버에 연결할 수 없습니다.' };
  }
}

/** 로컬 인증 상태 클리어 (별도 logout 엔드포인트 없음) */
export function logout(): void {
  useAuthStore.getState().clearAuth();
}
