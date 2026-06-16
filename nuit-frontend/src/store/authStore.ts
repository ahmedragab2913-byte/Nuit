import { create } from "zustand";
import type { Address, CustomerOrder } from "../services/api";
import { useCartStore } from "./cartStore";
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
} from "../services/api";
import type { AxiosError } from "axios";

// ─── Strict credential types ─────────────────────────────────
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

interface CartSyncItem {
  product_id: number;
  quantity: number;
}

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

  register: (credentials: RegisterCredentials, guestCartItems?: CartSyncItem[]) => Promise<boolean>;
  login: (credentials: LoginCredentials, guestCartItems?: CartSyncItem[]) => Promise<boolean>;
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

/**
 * Safely extracts an error message from an Axios error or generic Error.
 */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as AxiosError<{ message?: string }>;
    return axiosErr.response?.data?.message ?? axiosErr.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
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
        
        // Clear the local guest cart without syncing (backend already has the merged cart)
        useCartStore.getState().clearCart(true /* skipSync */);

        set({
          user: res.user,
          isAuthenticated: true,
          error: null,
        });
        return true;
      }
      return false;
    } catch (err: unknown) {
      console.error("Registration failed:", err);
      set({ error: extractErrorMessage(err, "Registration failed. Try again.") });
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

        // Clear the local guest cart without syncing (backend already has the merged cart)
        useCartStore.getState().clearCart(true /* skipSync */);

        set({
          user: res.user,
          isAuthenticated: true,
          error: null,
        });
        return true;
      }
      return false;
    } catch (err: unknown) {
      console.error("Login failed:", err);
      set({ error: extractErrorMessage(err, "Invalid credentials. Try again.") });
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
      // 1. Remove the token FIRST
      localStorage.removeItem("nuit_auth_token");

      // 2. Mark as unauthenticated BEFORE clearing the cart
      //    so syncWithDB (which checks localStorage for token) won't fire
      set({
        user: null,
        isAuthenticated: false,
        addresses: [],
        orders: [],
        loading: false,
        error: null,
      });

      // 3. Clear local cart with skipSync=true (token is already gone)
      useCartStore.getState().clearCart(true /* skipSync */);
      localStorage.removeItem("nuit-cart-storage");
    }
  },

  checkAuth: async () => {
    // Don't fire if no token exists
    const token = localStorage.getItem("nuit_auth_token");
    if (!token) {
      set({
        user: null,
        isAuthenticated: false,
        hasCheckedAuth: true,
      });
      return;
    }

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

  setUnauthenticated: () => {
    // Clear cart without syncing (session is already dead)
    useCartStore.getState().clearCart(true /* skipSync */);
    set({
      user: null,
      isAuthenticated: false,
      hasCheckedAuth: true,
      addresses: [],
      orders: [],
    });
  }
}));