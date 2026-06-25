import axios from "axios";
import type { Product } from "../types";
import { useAuthStore } from "../store/authStore";

// Resolve the Backend Base URL dynamically from environment variables
const getBackendUrl = (): string => {
  // Vite environment variables (client-side)
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // Safe dynamic lookup to bypass strict TS compiler checking for "process"
  const globalObj = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});
  const proc = (globalObj as any).process;
  if (proc && proc.env) {
    if (proc.env.VITE_BACKEND_URL) {
      return proc.env.VITE_BACKEND_URL;
    }
    if (proc.env.NEXT_PUBLIC_BACKEND_URL) {
      return proc.env.NEXT_PUBLIC_BACKEND_URL;
    }
  }

  // Fallback to VITE_API_BASE_URL or dynamic host detection
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  const hostname = typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
  const isProd = typeof window !== "undefined" && (window.location.hostname.includes("vercel.app") || window.location.hostname.includes("railway.app"));
  return isProd ? "https://nuit-production.up.railway.app" : `http://${hostname}:8000`;
};

// 🌐 1. Base server URL for fetching files and assets
export const BACKEND_URL = getBackendUrl();

const API_BASE = `${BACKEND_URL}/api/v1`;

/**
 * 🖼️ Dynamic Image Path Resolver
 * Handles absolute/external URLs, relative uploads path, and dynamic placeholders.
 */
export const getProductImage = (imagePath: string | null | undefined): string => {
  if (!imagePath || imagePath.trim() === "") {
    return `${BACKEND_URL}/uploads/products/placeholder.png`;
  }
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${BACKEND_URL}${cleanPath}`;
};

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Accept": "application/json",
  }
});

// Request interceptor to attach bearer token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("nuit_auth_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Global 401 interceptor — calls setUnauthenticated directly (no custom events)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("nuit_auth_token");
      }
      useAuthStore.getState().setUnauthenticated();
    }
    return Promise.reject(error);
  }
);

// ─── AUTHENTICATION SERVICES ──────────────────────────────────
export const apiRegister = async (data: Record<string, unknown>) => {
  const res = await api.post("/register", data);
  return res.data;
};

export const apiLogin = async (data: Record<string, unknown>) => {
  const res = await api.post("/login", data);
  return res.data;
};

export const apiLogout = async () => {
  const res = await api.post("/logout");
  return res.data;
};

export const apiGetMe = async () => {
  const res = await api.get("/me");
  return res.data;
};

export const apiUpdateProfile = async (data: { name: string }) => {
  const res = await api.put("/profile", data);
  return res.data;
};

// ─── PRODUCTS SERVICE ─────────────────────────────────────────
export const getProducts = async (): Promise<Product[]> => {
  const res = await api.get("/products");
  const data = res.data;
  return (Array.isArray(data) ? data : data.data ?? []).map((p: any) => ({
    ...p,
    notes: Array.isArray(p.notes) ? p.notes : (typeof p.notes === "string" ? JSON.parse(p.notes) : [])
  }));
};

export const getProductswithPagination = async (
  page = 1,
  perPage = 12,
  category?: string,
  search?: string // 👈 ضفنا الـ search parameter هنا كـ اختياري
): Promise<{
  data: Product[];
  current_page: number;
  last_page: number;
  total: number;
}> => {
  const params = new URLSearchParams({
    page:     page.toString(),
    per_page: perPage.toString(),
  });

  if (category && category !== "All") {
    params.append("category", category);
  }
  
  // 👈 لو فيه كلمة بحث مبعوتة، بنضيفها للـ Query String
  if (search && search.trim() !== "") {
    params.append("search", search.trim());
  }

  const res = await api.get(`/products?${params}`);
  const raw = res.data;

  const list = (Array.isArray(raw) ? raw : raw.data ?? []).map((p: any) => ({
    ...p,
    notes: Array.isArray(p.notes)
      ? p.notes
      : typeof p.notes === "string"
      ? JSON.parse(p.notes)
      : [],
  }));

  return {
    data:         list,
    current_page: raw.current_page ?? 1,
    last_page:    raw.last_page    ?? 1,
    total:        raw.total        ?? list.length,
  };
};
export const getProductById = async (id: number): Promise<Product> => {
  const res = await api.get(`/products/${id}`);
  const p = res.data.data ?? res.data;
  return {
    ...p,
    notes: Array.isArray(p.notes) ? p.notes : (typeof p.notes === "string" ? JSON.parse(p.notes) : [])
  };
};

// 🔥 الميثود الجديدة للأكثر مبيعاً مع معالجة الـ Pagination والـ JSON الراجع من الباكيند
export const getBestSellers = async (
  page = 1,
  perPage = 8
): Promise<{
  data: Product[];
  current_page: number;
  last_page: number;
  total: number;
}> => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  const res = await api.get(`/products/best-sellers?${params}`);
  const raw = res.data;

  // 🛡️ معالجة داتا المنتجات والتأكد من تحويل حقل الـ notes المصفوفة
  const list = (Array.isArray(raw.data) ? raw.data : raw ?? []).map((p: any) => ({
    ...p,
    notes: Array.isArray(p.notes)
      ? p.notes
      : typeof p.notes === "string"
      ? JSON.parse(p.notes)
      : [],
  }));

  return {
    data:         list,
    current_page: raw.pagination?.current_page ?? raw.current_page ?? 1,
    last_page:    raw.pagination?.last_page    ?? raw.last_page    ?? 1,
    total:        raw.pagination?.total        ?? raw.total        ?? list.length,
  };
};

export const getCategories = async (): Promise<string[]> => {
  const res = await api.get("/products/categories");
  return res.data ?? [];
};
// ─── SHIPPING RATES SERVICES (ADMIN & PUBLIC) ─────────────────

// الـ Interface الخاص ببيانات الشحن
export interface ShippingRate {
  id: number;
  city_name: string;
  rate: number;
}

/**
 * 1. جلب أسعار الشحن العامة (تستخدم في صفحة الـ Checkout برة)
 */
export const getShippingRatesPublic = async (): Promise<ShippingRate[]> => {
  const res = await api.get("/shipping-rates");
  // تأمين استخراج المصفوفة أياً كان شكل الـ return (لافف جوه data أو مصفوفة صريحة)
  return res.data?.data || res.data || [];
};

// ─── ADDRESS MANAGEMENT ───────────────────────────────────────
export interface Address {
  id: number;
  country: string;
  city: string;
  street: string;
  building: string;
  floor?: string;
  apartment?: string;
  is_default: boolean;
}

export const getAddresses = async (): Promise<Address[]> => {
  const res = await api.get("/addresses");
  return res.data.data ?? [];
};

export const createAddress = async (data: Partial<Address>) => {
  const res = await api.post("/addresses", data);
  return res.data.data;
};

export const updateAddress = async (id: number, data: Partial<Address>) => {
  const res = await api.put(`/addresses/${id}`, data);
  return res.data.data;
};

export const deleteAddress = async (id: number) => {
  const res = await api.delete(`/addresses/${id}`);
  return res.data;
};

export const setDefaultAddress = async (id: number) => {
  const res = await api.patch(`/addresses/${id}/default`);
  return res.data.data;
};

// ─── DATABASE CART PERSISTENCE ───────────────────────────────
export const getDBCart = async () => {
  const res = await api.get("/cart");
  return res.data.data;
};

export const syncDBCart = async (payload: { items: { product_id: number; quantity: number; }[] }) => {
  // ✅ استخدم api وباصي على مسار /cart/sync المظبوط المتناسق مع لارافيل
  const response = await api.post('/cart/sync', payload);
  return response.data;
};

// ─── CHECKOUT & ORDER HISTORY ───────────────────────────────
export interface CheckoutPayload {
  address_id: number;
  payment_method: string;
  items: { product_id: number; quantity: number }[];
  promo_code?: string;
  shipping_cost: number;
  discount_amount: number;
  total_price: number;
}

export const placeOrder = async (payload: CheckoutPayload) => {
  const res = await api.post("/checkout", payload);
  return res.data;
};

export const validatePromoCode = async (code: string, subtotal: number) => {
  const res = await api.post("/promo-codes/validate", { code, subtotal });
  return res.data;
};

export interface CustomerOrder {
  id: number;
  order_number: string;
  date: string;
  items: { product_id: number; name: string; image?: string; qty: number; price: number }[];
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  grand_total: number;
  status: string;
  payment_method: string;
  payment_status: string;
  address: Record<string, string>;
}

export const getMyOrders = async (): Promise<CustomerOrder[]> => {
  const res = await api.get("/my-orders");
  return res.data.data ?? [];
};

// ─── DATABASE WISHLIST PERSISTENCE ───────────────────────────
/**
 * Fetch the authenticated user's wishlist from the DB.
 * Returns an array of Product objects.
 */
export const getDBWishlist = async (): Promise<Product[]> => {
  const res = await api.get("/wishlist");
  const items = res.data.data ?? res.data ?? [];
  return items.map((p: any) => ({
    ...p,
    notes: Array.isArray(p.notes)
      ? p.notes
      : typeof p.notes === "string"
      ? JSON.parse(p.notes)
      : [],
  }));
};

/**
 * Syncs the authenticated user's wishlist to the DB.
 * Accepts an array of product IDs. Returns the updated wishlist products.
 */
export const syncDBWishlist = async (productIds: number[]): Promise<Product[]> => {
  const res = await api.post("/wishlist/sync", { items: productIds });
  const items = res.data.data ?? res.data ?? [];
  return items.map((p: any) => ({
    ...p,
    notes: Array.isArray(p.notes)
      ? p.notes
      : typeof p.notes === "string"
      ? JSON.parse(p.notes)
      : [],
  }));
};