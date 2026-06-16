import axios from "axios";
import type { Product, Order, Customer, DashboardStats } from "../types";

const hostname = typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
// Use Railway production URL if page is loaded from vercel, otherwise fallback to local/detected host
const isProd = typeof window !== "undefined" && (window.location.hostname.includes("vercel.app") || window.location.hostname.includes("railway.app"));
const API_BASE = isProd ? "https://nuit-production.up.railway.app/api/v1" : `http://${hostname}:8000/api/v1`;

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Accept": "application/json",
  }
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("nuit_admin_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));


// Intercept 401 responses to clear session and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("nuit_admin_token");
      }
      // Session expired or unauthenticated
      window.dispatchEvent(new Event("admin-unauthorized"));
    }
    return Promise.reject(error);
  }
);

// ─── CSRF & AUTH SERVICE ───────────────────────────────────
export const getCsrfCookie = async () => {
  return Promise.resolve();
};

export const apiLogin = async (credentials: Record<string, string>) => {
  const res = await api.post("/admin/login", credentials);
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

// ─── DASHBOARD STATS SERVICE ───────────────────────────────
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get("/dashboard/stats");
  return res.data.data ?? res.data;
};

// ─── PRODUCTS CRUD SERVICE ─────────────────────────────────
export const getProducts = async (): Promise<Product[]> => {
  const res = await api.get("/products");
  const data = res.data;
  return Array.isArray(data) ? data : data.data ?? [];
};
// اذهب لملف src/services/api.ts (أو الملف اللي فيه الدوال)

export const getProductswithPagination = async (
  page = 1,
  perPage = 12,
  category?: string,
  search?: string // 🌟 ضيف السطر ده هنا عشان الـ TypeScript يفهم المعامل الرابع
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

  // 🌟 تأكد برضه إنك بتضيفه للـ params عشان يتبعت للباك إند
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

export const createProduct = async (formData: FormData) => {
  const res = await api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

export const updateProduct = async (id: number, formData: FormData | Record<string, any>) => {
  // If it's a FormData object (photo upload), Laravel expects POST with _method=PUT due to PHP multipart limitations
  if (formData instanceof FormData) {
    if (!formData.has("_method")) {
      formData.append("_method", "PUT");
    }
    const res = await api.post(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  }
  
  // Standard PUT request for json payload
  const res = await api.put(`/products/${id}`, formData);
  return res.data;
};

export const deleteProduct = async (id: number) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};

export const importProducts = async (formData: FormData) => {
  const res = await api.post("/products/import", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

export const exportProductsBlob = async () => {
  const res = await api.get("/products/export", { responseType: "blob" });
  return res.data;
};

// ─── ORDERS SERVICE ────────────────────────────────────────
export const getOrders = async (): Promise<Order[]> => {
  const res = await api.get("/orders");
  const data = res.data;
  return Array.isArray(data) ? data : data.data ?? [];
};

export const updateOrderStatus = async (id: string, status: string) => {
  const res = await api.patch(`/orders/${id}/status`, { status });
  return res.data;
};

// ─── CUSTOMERS SERVICE ─────────────────────────────────────
export const getCustomers = async (): Promise<Customer[]> => {
  const res = await api.get("/customers");
  const data = res.data;
  return Array.isArray(data) ? data : data.data ?? [];
};

// ─── ANNOUNCEMENTS SERVICE ────────────────────────────────
export interface Announcement {
  id: number;
  text: string;
  is_active: boolean;
  priority: number;
}

export const getAnnouncements = async (): Promise<Announcement[]> => {
  const res = await api.get("/announcements/all");
  const data = res.data;
  return Array.isArray(data) ? data : data.data ?? [];
};

export const createAnnouncement = async (data: { text: string; is_active?: boolean; priority?: number }) => {
  const res = await api.post("/announcements", data);
  return res.data;
};

export const updateAnnouncement = async (id: number, data: Partial<Announcement>) => {
  const res = await api.put(`/announcements/${id}`, data);
  return res.data;
};

export const deleteAnnouncement = async (id: number) => {
  const res = await api.delete(`/announcements/${id}`);
  return res.data;
};
// ─── SHIPPING RATES SERVICE ────────────────────────────────
export interface ShippingRate {
  id: number;
  city_name: string;
  rate: number;
  created_at?: string;
  updated_at?: string;
}

export const getAdminShippingRates = async (): Promise<ShippingRate[]> => {
  const res = await api.get("/shipping-rates");
  return res.data?.data || res.data || [];
};

/**
 * 3. إضافة محافظة جديدة (لوحة تحكم الأدمن)
 */
export const createShippingRate = async (data: { city_name: string; rate: number }) => {
  const res = await api.post("/shipping-rates", data);
  return res.data;
};

/**
 * 4. تعديل سعر شحن محافظة (لوحة تحكم الأدمن)
 */
export const updateShippingRate = async (id: number, data: { rate: number }) => {
  const res = await api.put(`/shipping-rates/${id}`, data);
  return res.data;
};

/**
 * 5. حذف محافظة (لوحة تحكم الأدمن)
 */
export const deleteShippingRate = async (id: number) => {
  const res = await api.delete(`/shipping-rates/${id}`);
  return res.data;
};
// ─── PROMO CODES SERVICE ───────────────────────────────────
export interface PromoCode {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  user_usage_limit: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
}

export const getPromoCodes = async (): Promise<PromoCode[]> => {
  const res = await api.get("/admin/promo-codes");
  const data = res.data;
  return Array.isArray(data) ? data : data.data ?? [];
};

export const createPromoCode = async (data: Record<string, any>) => {
  const res = await api.post("/admin/promo-codes", data);
  return res.data;
};

export const togglePromoCodeStatus = async (id: number, currentStatus: boolean) => {
  const res = await api.patch(`/admin/promo-codes/${id}/toggle`, {
    is_active: !currentStatus
  });
  return res.data;
};

export const deletePromoCode = async (id: number) => {
  const res = await api.delete(`/admin/promo-codes/${id}`);
  return res.data;
};
