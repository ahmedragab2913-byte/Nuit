import axios from "axios";
import type { Product } from "../types";

const hostname = typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
const API_BASE = `http://${hostname}:8000/api/v1`;
const SANCTUM_BASE = `http://${hostname}:8000`;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Accept": "application/json",
  }
});

// CSRF interception helper
api.interceptors.request.use(async (config) => {
  const hasToken = typeof document !== "undefined" && document.cookie.includes("XSRF-TOKEN=");
  if (!hasToken) {
    await getCsrfCookie();
  }
  if (typeof document !== "undefined") {
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];
    if (csrfToken) {
      config.headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Global unauthorized listener
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(new Event("client-unauthorized"));
    }
    return Promise.reject(error);
  }
);

export const getCsrfCookie = async () => {
  await axios.get(`${SANCTUM_BASE}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
};

// ─── AUTHENTICATION SERVICES ──────────────────────────────────
export const apiRegister = async (data: Record<string, any>) => {
  const res = await api.post("/register", data);
  return res.data;
};

export const apiLogin = async (data: Record<string, any>) => {
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
  category?: string
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

export const getCategories = async (): Promise<string[]> => {
  const res = await api.get("/products/categories");
  return res.data ?? [];
};;

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

export const syncDBCart = async (items: { product_id: number; quantity: number }[]) => {
  const res = await api.post("/cart/sync", { items });
  return res.data.data;
};

// ─── CHECKOUT & ORDER HISTORY ───────────────────────────────
export interface CheckoutPayload {
  address_id: number;
  payment_method: string;
  items: { product_id: number; quantity: number }[];
}

export const placeOrder = async (payload: CheckoutPayload) => {
  const res = await api.post("/checkout", payload);
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
