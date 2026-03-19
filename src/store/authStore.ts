import { create } from 'zustand';

const STORAGE_KEY = 'hid-amico-access-token';

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: getStoredToken(),
  setAccessToken: (token) => {
    try {
      if (token) localStorage.setItem(STORAGE_KEY, token);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
    set({ accessToken: token });
  },
  clearAuth: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    set({ accessToken: null });
  },
  isAuthenticated: () => !!get().accessToken,
}));
