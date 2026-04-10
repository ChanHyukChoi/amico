//#region imports
import { normalizeAccessToken } from "@/lib/accessToken";
import { isJwtExpiredOnClient } from "@/lib/jwtExpiry";
import { create } from "zustand";
//#endregion

//#region constants
const STORAGE_KEY = "hid-amico-access-token";
//#endregion

//#region helpers
function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const t = normalizeAccessToken(raw);
    return t.length > 0 ? t : null;
  } catch {
    return null;
  }
}

/** 스토어 초기화 시: JWT이고 exp가 지났으면 저장소·세션에서 제거 */
function readStoredTokenOrClearIfJwtExpired(): string | null {
  const raw = getStoredToken();
  if (!raw) return null;
  if (!isJwtExpiredOnClient(raw)) return raw;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    void 0;
  }
  return null;
}
//#endregion

//#region types
export type LogoutReason = "SESSION_REPLACED" | null;

interface AuthState {
  accessToken: string | null;
  logoutReason: LogoutReason;
  setAccessToken: (token: string | null) => void;
  clearAuth: (reason?: LogoutReason) => void;
  consumeLogoutReason: () => LogoutReason;
  isAuthenticated: () => boolean;
}
//#endregion

//#region store
export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: readStoredTokenOrClearIfJwtExpired(),
  logoutReason: null,
  setAccessToken: (token) => {
    const next =
      token && token.length > 0 ? normalizeAccessToken(token) : null;
    const toStore = next && next.length > 0 ? next : null;
    try {
      if (toStore) localStorage.setItem(STORAGE_KEY, toStore);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      void 0;
    }
    set({ accessToken: toStore, logoutReason: null });
  },
  clearAuth: (reason = null) => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      void 0;
    }
    set({ accessToken: null, logoutReason: reason });
  },
  consumeLogoutReason: () => {
    const reason = get().logoutReason;
    if (reason) set({ logoutReason: null });
    return reason;
  },
  isAuthenticated: () => !!get().accessToken,
}));
//#endregion
