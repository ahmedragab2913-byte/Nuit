import { create } from "zustand";
import { apiLogin, apiLogout, apiGetMe } from "../services/api";
import type { User } from "../types";

interface AuthStoreState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  hasCheckedAuth: boolean;
  
  login: (credentials: Record<string, string>) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUnauthenticated: () => void;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  hasCheckedAuth: false,

  login: async (credentials) => {
    if (get().loading) return false;
    set({ loading: true, error: null });
    try {
      // Submit Login request
      const data = await apiLogin(credentials);
      
      if (data.status === "success" && data.user) {
        if (data.token) {
          localStorage.setItem("nuit_admin_token", data.token);
        }
        set({
          user: data.user,
          isAuthenticated: true,
          error: null,
        });
        return true;
      } else {
        throw new Error(data.message || "Failed to log in.");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      const msg = err.response?.data?.message || err.message || "Invalid credentials. Please try again.";
      set({ error: msg });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      await apiLogout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("nuit_admin_token");
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const data = await apiGetMe();
      if (data.status === "success" && data.user) {
        set({
          user: data.user,
          isAuthenticated: true,
          hasCheckedAuth: true,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          hasCheckedAuth: true,
        });
      }
    } catch (err) {
      set({
        user: null,
        isAuthenticated: false,
        hasCheckedAuth: true,
      });
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
  
  setUnauthenticated: () => set({
    user: null,
    isAuthenticated: false,
    hasCheckedAuth: true,
  }),
}));

// Set up window listener for global Axios unauthorized event
if (typeof window !== "undefined") {
  window.addEventListener("admin-unauthorized", () => {
    useAuthStore.getState().setUnauthenticated();
  });
}
