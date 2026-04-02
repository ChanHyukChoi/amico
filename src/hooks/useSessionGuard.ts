import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { validateSession } from "@/api/auth";

const POLL_INTERVAL_MS = 30_000;

const sessionPollEnabled =
  import.meta.env.VITE_AUTH_SESSION_POLL === "true";

/**
 * 인증된 상태에서 주기적으로 서버 세션 유효성을 확인한다.
 * 다른 기기 로그인으로 세션이 대체되면 clearAuth("SESSION_REPLACED")가
 * apply401AuthPolicy를 통해 자동 호출되므로, 이 훅은 폴링만 담당한다.
 *
 * 기본값 OFF: 백엔드에 GET /auth/session 이 없거나 401 JSON을 잘못 주면
 * 로그인 직후 로그아웃되는 문제를 막기 위함. 단일 세션 연동 시 `.env`에
 * VITE_AUTH_SESSION_POLL=true 로 켭니다.
 */
export function useSessionGuard() {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!sessionPollEnabled) {
      return;
    }

    if (!isAuthenticated) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const poll = () => {
      void validateSession();
    };

    poll();
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isAuthenticated]);
}
