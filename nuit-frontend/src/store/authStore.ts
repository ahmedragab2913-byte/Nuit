import { create } from "zustand";
import type { Address, CustomerOrder } from "../services/api";
import { useCartStore } from "./cartStore";
import {
  apiRegister,
  apiLogin,
  apiGoogleLogin,
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
  loginWithGoogle: (googleToken: string, guestCartItems?: CartSyncItem[]) => Promise<boolean>;
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
 * Maps a raw backend error message to a frontend translation key.
 * This keeps error display language in sync with the user's selected language.
 */
function mapErrorToKey(err: unknown, fallbackKey: string): string {
  let raw = "";
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
    // Prefer the first validation error field message if present
    const errors = axiosErr.response?.data?.errors;
    if (errors) {
      const firstField = Object.values(errors)[0];
      raw = Array.isArray(firstField) ? firstField[0] : "";
    }
    if (!raw) raw = axiosErr.response?.data?.message ?? axiosErr.message ?? "";
  } else if (err instanceof Error) {
    raw = err.message;
  }

  const lower = raw.toLowerCase();
  if (lower.includes("already been taken") || lower.includes("already registered") || lower.includes("already exists"))
    return "errEmailTaken";
  if (lower.includes("invalid credentials") || lower.includes("wrong password") || lower.includes("these credentials do not match"))
    return "errInvalidCredentials";
  if (lower.includes("google") || lower.includes("oauth"))
    return "errGoogleAuthFailed";

  return fallbackKey;
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
      set({ error: mapErrorToKey(err, "errRegistrationFailed") });
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
      set({ error: mapErrorToKey(err, "errLoginFailed") });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  loginWithGoogle: async (googleToken, guestCartItems = []) => {
    set({ loading: true, error: null });
    try {
      const payload = { token: googleToken, cart_items: guestCartItems };
      const res = await apiGoogleLogin(payload);
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
      console.error("Google Login failed:", err);
      set({ error: mapErrorToKey(err, "errGoogleAuthFailed") });
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

      // 3. Clear local cart and wishlist with skipSync=true (token is already gone)
      useCartStore.getState().clearCart(true /* skipSync */);
      useCartStore.getState().clearWishlist();
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
    // Clear cart and wishlist without syncing (session is already dead)
    useCartStore.getState().clearCart(true /* skipSync */);
    useCartStore.getState().clearWishlist();
    set({
      user: null,
      isAuthenticated: false,
      hasCheckedAuth: true,
      addresses: [],
      orders: [],
    });
  }
}));