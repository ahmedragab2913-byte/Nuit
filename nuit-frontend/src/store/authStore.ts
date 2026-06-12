import { create } from "zustand";
import type { Address, CustomerOrder } from "../services/api";
import {
  apiRegister,
  apiLogin,
  apiLogout,
  apiGetMe,
  apiUpdateProfile,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getMyOrders,
  getCsrfCookie,
} from "../services/api";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface AuthStoreState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  hasCheckedAuth: boolean;
  addresses: Address[];
  orders: CustomerOrder[];
  error: string | null;

  register: (credentials: Record<string, any>, guestCartItems?: { product_id: number; quantity: number }[]) => Promise<boolean>;
  login: (credentials: Record<string, any>, guestCartItems?: { product_id: number; quantity: number }[]) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateName: (name: string) => Promise<boolean>;
  fetchAddresses: () => Promise<void>;
  addAddress: (data: Partial<Address>) => Promise<boolean>;
  editAddress: (id: number, data: Partial<Address>) => Promise<boolean>;
  removeAddress: (id: number) => Promise<boolean>;
  makeAddressDefault: (id: number) => Promise<boolean>;
  fetchOrders: () => Promise<void>;
  clearError: () => void;
  setUnauthenticated: () => void;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  hasCheckedAuth: false,
  addresses: [],
  orders: [],
  error: null,

  register: async (credentials, guestCartItems = []) => {
    set({ loading: true, error: null });
    try {
      const payload = { ...credentials, cart_items: guestCartItems };
      const res = await apiRegister(payload);
      if (res.status === "success" && res.user) {
        if (res.token) {
          localStorage.setItem("nuit_auth_token", res.token);
        }
        set({
          user: res.user,
          isAuthenticated: true,
          error: null,
        });
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Registration failed:", err);
      const msg = err.response?.data?.message || err.message || "Registration failed. Try again.";
      set({ error: msg });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  login: async (credentials, guestCartItems = []) => {
    set({ loading: true, error: null });
    try {
      const payload = { ...credentials, cart_items: guestCartItems };
      const res = await apiLogin(payload);
      if (res.status === "success" && res.user) {
        if (res.token) {
          localStorage.setItem("nuit_auth_token", res.token);
        }
        set({
          user: res.user,
          isAuthenticated: true,
          error: null,
        });
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Login failed:", err);
      const msg = err.response?.data?.message || err.message || "Invalid credentials. Try again.";
      set({ error: msg });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await apiLogout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("nuit_auth_token");
      set({
        user: null,
        isAuthenticated: false,
        addresses: [],
        orders: [],
        loading: false,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    try {
      const res = await apiGetMe();
      if (res.status === "success" && res.user) {
        set({
          user: res.user,
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
    }
  },

  updateName: async (name) => {
    try {
      const res = await apiUpdateProfile({ name });
      if (res.status === "success" && res.user) {
        set({ user: res.user });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Profile update failed:", err);
      return false;
    }
  },

  fetchAddresses: async () => {
    try {
      const list = await getAddresses();
      set({ addresses: list });
    } catch (err) {
      console.error("Failed to load addresses:", err);
    }
  },

  addAddress: async (data) => {
    try {
      await createAddress(data);
      await get().fetchAddresses();
      return true;
    } catch (err) {
      console.error("Failed to add address:", err);
      return false;
    }
  },

  editAddress: async (id, data) => {
    try {
      await updateAddress(id, data);
      await get().fetchAddresses();
      return true;
    } catch (err) {
      console.error("Failed to update address:", err);
      return false;
    }
  },

  removeAddress: async (id) => {
    try {
      await deleteAddress(id);
      await get().fetchAddresses();
      return true;
    } catch (err) {
      console.error("Failed to delete address:", err);
      return false;
    }
  },

  makeAddressDefault: async (id) => {
    try {
      await setDefaultAddress(id);
      await get().fetchAddresses();
      return true;
    } catch (err) {
      console.error("Failed to update default address:", err);
      return false;
    }
  },

  fetchOrders: async () => {
    try {
      const list = await getMyOrders();
      set({ orders: list });
    } catch (err) {
      console.error("Failed to fetch order history:", err);
    }
  },

  clearError: () => set({ error: null }),

  setUnauthenticated: () => set({
    user: null,
    isAuthenticated: false,
    hasCheckedAuth: true,
    addresses: [],
    orders: [],
  })
}));

// Setup unauthorized response interceptor
if (typeof window !== "undefined") {
  window.addEventListener("client-unauthorized", () => {
    useAuthStore.getState().setUnauthenticated();
  });
}
