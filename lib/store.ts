import { create } from "zustand";
import { API_BASE } from "./constants";

export type AdminAuthState = {
  token: string | null;
  user: { id: number; username: string; email: string; role: string } | null;
  permissions: string[];
  setAuth: (token: string, user: { id: number; username: string; email: string; role: string }) => void;
  setPermissions: (permissions: string[]) => void;
  logout: () => Promise<void>;
  clear: () => void;
};

export const useAdminAuth = create<AdminAuthState>()((set) => ({
  token: null,
  user: null,
  permissions: [],
  setAuth: (token, user) => {
    set({ token, user });
  },
  setPermissions: (permissions) => set({ permissions }),
  logout: async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch {
      // ignore
    }
    set({ token: null, user: null, permissions: [] });
  },
  clear: () => {
    set({ token: null, user: null, permissions: [] });
  }
}));
