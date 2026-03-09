import { apiFetch } from '@/api/client';
import type { ApiResponse } from '@/types/common';
import type { LoginRequest, LoginResponse } from '@/types/auth';
import { useAuthStore } from '@/store/authStore';

export async function login(
  body: LoginRequest
): Promise<ApiResponse<LoginResponse>> {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
    credentials: 'include',
  });
  const data = (await res.json()) as ApiResponse<LoginResponse>;
  if (data.success && data.data?.accessToken) {
    useAuthStore.getState().setAccessToken(data.data.accessToken);
  }
  return data;
}

export async function logout(): Promise<void> {
  await apiFetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  useAuthStore.getState().clearAuth();
}
