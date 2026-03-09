import { useAuthStore } from '@/store/authStore';

/** 상대 경로 /api 전용 fetch. baseURL 사용 금지. */
async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = useAuthStore.getState().accessToken;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    useAuthStore.getState().clearAuth();
    // 라우터/가드에서 /login 리다이렉트 처리
  }

  return res;
}

export { apiFetch };
