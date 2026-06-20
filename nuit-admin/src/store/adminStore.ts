import { create } from "zustand";
import { 
  getDashboardStats,
  getProductswithPagination,
  createProduct,
  updateProduct,
  deleteProduct,
  importProducts,
  getOrders,
  updateOrderStatus,
  getCustomers,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getPromoCodes,
  createPromoCode,
  togglePromoCodeStatus,
  deletePromoCode,
  getAdminShippingRates,
  createShippingRate,
  updateShippingRate,
  deleteShippingRate,
  extractErrorMessage,
  type Announcement,
  type ShippingRate,
  type PromoCode
} from "../services/api";
import type { Product, Order, Customer, DashboardStats } from "../types";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  timestamp: Date;
  read: boolean;
}

interface AdminStoreState {
  // --- Notifications ---
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  pollNewOrders: () => Promise<Order[]>;

  // --- Dashboard Stats ---
  dashboardStats: DashboardStats | null;
  dashboardLoading: boolean;
  dashboardError: string | null;

  // --- Products ---
  products: Product[];
  productsLoading: boolean;
  productsError: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  searchQuery: string;
  categoryFilter: string;

  // --- Orders ---
  orders: Order[];
  ordersLoading: boolean;
  ordersError: string | null;
  ordersSearchQuery: string;
  ordersStatusFilter: string;

  // --- Customers ---
  customers: Customer[];
  customersLoading: boolean;
  customersError: string | null;
  customersSearchQuery: string;
  customersStatusFilter: string;

  // --- Announcements ---
  announcements: Announcement[];
  announcementsLoading: boolean;
  announcementsError: string | null;

  // --- Promo Codes ---
  promoCodes: PromoCode[];
  promoCodesLoading: boolean;
  promoCodesError: string | null;

  // --- Shipping Rates ---
  shippingRates: ShippingRate[];
  shippingRatesLoading: boolean;
  shippingRatesError: string | null;

  // --- Actions ---
  // Dashboard Stats
  fetchDashboardStats: () => Promise<void>;

  // Products
  setProductsFilter: (search: string, category: string) => void;
  fetchProducts: (page?: number, perPage?: number) => Promise<void>;
  addProduct: (formData: FormData) => Promise<void>;
  editProduct: (id: number, formData: FormData | Record<string, any>) => Promise<void>;
  removeProduct: (id: number) => Promise<void>;
  importProductExcel: (formData: FormData) => Promise<void>;

  // Orders
  setOrdersFilter: (search: string, status: string) => void;
  fetchOrders: () => Promise<void>;
  updateStatus: (id: string, status: Order["status"]) => Promise<void>;

  // Customers
  setCustomersFilter: (search: string, status: string) => void;
  fetchCustomers: () => Promise<void>;

  // Announcements
  fetchAnnouncements: () => Promise<void>;
  addAnnouncement: (data: { text: string; is_active?: boolean; priority?: number }) => Promise<void>;
  editAnnouncement: (id: number, data: Partial<Announcement>) => Promise<void>;
  removeAnnouncement: (id: number) => Promise<void>;
  toggleAnnouncementActive: (announcement: Announcement) => Promise<void>;

  // Promo Codes
  fetchPromoCodes: () => Promise<void>;
  addPromoCode: (data: Record<string, any>) => Promise<void>;
  togglePromoStatus: (id: number, currentStatus: boolean) => Promise<void>;
  removePromoCode: (id: number) => Promise<void>;

  // Shipping Rates
  fetchShippingRates: () => Promise<void>;
  addShippingRate: (data: { city_name: string; rate: number }) => Promise<void>;
  editShippingRate: (id: number, data: { rate: number }) => Promise<void>;
  removeShippingRate: (id: number) => Promise<void>;
}

export const useAdminStore = create<AdminStoreState>((set, get) => ({
  // --- Initial States ---
  notifications: [],
  unreadCount: 0,

  dashboardStats: null,
  dashboardLoading: false,
  dashboardError: null,

  products: [],
  productsLoading: false,
  productsError: null,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  searchQuery: "",
  categoryFilter: "All",

  orders: [],
  ordersLoading: false,
  ordersError: null,
  ordersSearchQuery: "",
  ordersStatusFilter: "All",

  customers: [],
  customersLoading: false,
  customersError: null,
  customersSearchQuery: "",
  customersStatusFilter: "All",

  announcements: [],
  announcementsLoading: false,
  announcementsError: null,

  promoCodes: [],
  promoCodesLoading: false,
  promoCodesError: null,

  shippingRates: [],
  shippingRatesLoading: false,
  shippingRatesError: null,

  // --- Actions ---

  // Dashboard Stats
  fetchDashboardStats: async () => {
    set({ dashboardLoading: true, dashboardError: null });
    try {
      const stats = await getDashboardStats();
      set({ dashboardStats: stats, dashboardError: null });
    } catch (err: unknown) {
      set({ dashboardError: extractErrorMessage(err) });
    } finally {
      set({ dashboardLoading: false });
    }
  },

  // Products
  setProductsFilter: (search, category) => {
    set({ searchQuery: search, categoryFilter: category });
  },

  fetchProducts: async (page = 1, perPage = 12) => {
    set({ productsLoading: true, productsError: null });
    try {
      const { searchQuery, categoryFilter } = get();
      const response = await getProductswithPagination(page, perPage, categoryFilter, searchQuery);
      set({
        products: response.data,
        currentPage: response.current_page,
        totalPages: response.last_page,
        totalItems: response.total,
        productsError: null
      });
    } catch (err: unknown) {
      set({ productsError: extractErrorMessage(err) });
    } finally {
      set({ productsLoading: false });
    }
  },

  addProduct: async (formData) => {
    set({ productsLoading: true, productsError: null });
    try {
      await createProduct(formData);
      // Re-fetch current products page
      await get().fetchProducts(get().currentPage);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      set({ productsError: msg });
      throw new Error(msg);
    } finally {
      set({ productsLoading: false });
    }
  },

  editProduct: async (id, formData) => {
    set({ productsLoading: true, productsError: null });
    try {
      await updateProduct(id, formData);
      // Re-fetch current products page
      await get().fetchProducts(get().currentPage);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      set({ productsError: msg });
      throw new Error(msg);
    } finally {
      set({ productsLoading: false });
    }
  },

  removeProduct: async (id) => {
    // Optimistic/Immediate local update first
    const originalProducts = get().products;
    const originalTotalItems = get().totalItems;
    set({
      products: originalProducts.filter(p => p.id !== id),
      totalItems: Math.max(0, originalTotalItems - 1)
    });

    try {
      await deleteProduct(id);
    } catch (err: unknown) {
      // Revert if API fails
      set({ products: originalProducts, totalItems: originalTotalItems, productsError: extractErrorMessage(err) });
      throw err;
    }
  },

  importProductExcel: async (formData) => {
    set({ productsLoading: true, productsError: null });
    try {
      await importProducts(formData);
      await get().fetchProducts(1);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      set({ productsError: msg });
      throw new Error(msg);
    } finally {
      set({ productsLoading: false });
    }
  },

  // Orders
  setOrdersFilter: (search, status) => {
    set({ ordersSearchQuery: search, ordersStatusFilter: status });
  },

  fetchOrders: async () => {
    set({ ordersLoading: true, ordersError: null });
    try {
      const data = await getOrders();
      set({ orders: data, ordersError: null });
    } catch (err: unknown) {
      set({ ordersError: extractErrorMessage(err) });
    } finally {
      set({ ordersLoading: false });
    }
  },

  updateStatus: async (id, status) => {
    // Optimistic/Immediate local update
    const originalOrders = get().orders;
    const updatedOrders = originalOrders.map(o => 
      o.id === id ? {
        ...o,
        status,
        payment_status: status === "delivered" ? "paid" : status === "cancelled" ? "failed" : o.payment_status
      } : o
    );
    set({ orders: updatedOrders });

    try {
      await updateOrderStatus(id, status);
    } catch (err: unknown) {
      // Revert if API fails
      set({ orders: originalOrders, ordersError: extractErrorMessage(err) });
      throw err;
    }
  },

  // Customers
  setCustomersFilter: (search, status) => {
    set({ customersSearchQuery: search, customersStatusFilter: status });
  },

  fetchCustomers: async () => {
    set({ customersLoading: true, customersError: null });
    try {
      const data = await getCustomers();
      set({ customers: data, customersError: null });
    } catch (err: unknown) {
      set({ customersError: extractErrorMessage(err) });
    } finally {
      set({ customersLoading: false });
    }
  },

  // Announcements
  fetchAnnouncements: async () => {
    set({ announcementsLoading: true, announcementsError: null });
    try {
      const data = await getAnnouncements();
      set({ announcements: data, announcementsError: null });
    } catch (err: unknown) {
      set({ announcementsError: extractErrorMessage(err) });
    } finally {
      set({ announcementsLoading: false });
    }
  },

  addAnnouncement: async (data) => {
    set({ announcementsLoading: true, announcementsError: null });
    try {
      await createAnnouncement(data);
      await get().fetchAnnouncements();
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      set({ announcementsError: msg });
      throw new Error(msg);
    } finally {
      set({ announcementsLoading: false });
    }
  },

  editAnnouncement: async (id, data) => {
    set({ announcementsLoading: true, announcementsError: null });
    try {
      await updateAnnouncement(id, data);
      await get().fetchAnnouncements();
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      set({ announcementsError: msg });
      throw new Error(msg);
    } finally {
      set({ announcementsLoading: false });
    }
  },

  removeAnnouncement: async (id) => {
    const original = get().announcements;
    set({ announcements: original.filter(a => a.id !== id) });
    try {
      await deleteAnnouncement(id);
    } catch (err: unknown) {
      set({ announcements: original, announcementsError: extractErrorMessage(err) });
      throw err;
    }
  },

  toggleAnnouncementActive: async (a) => {
    const original = get().announcements;
    set({
      announcements: original.map(item => item.id === a.id ? { ...item, is_active: !item.is_active } : item)
    });
    try {
      await updateAnnouncement(a.id, { is_active: !a.is_active });
    } catch (err: unknown) {
      set({ announcements: original, announcementsError: extractErrorMessage(err) });
      throw err;
    }
  },

  // Promo Codes
  fetchPromoCodes: async () => {
    set({ promoCodesLoading: true, promoCodesError: null });
    try {
      const data = await getPromoCodes();
      set({ promoCodes: data, promoCodesError: null });
    } catch (err: unknown) {
      set({ promoCodesError: extractErrorMessage(err) });
    } finally {
      set({ promoCodesLoading: false });
    }
  },

  addPromoCode: async (data) => {
    set({ promoCodesLoading: true, promoCodesError: null });
    try {
      await createPromoCode(data);
      await get().fetchPromoCodes();
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      set({ promoCodesError: msg });
      throw new Error(msg);
    } finally {
      set({ promoCodesLoading: false });
    }
  },

  togglePromoStatus: async (id, currentStatus) => {
    const original = get().promoCodes;
    set({
      promoCodes: original.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p)
    });
    try {
      await togglePromoCodeStatus(id, currentStatus);
    } catch (err: unknown) {
      set({ promoCodes: original, promoCodesError: extractErrorMessage(err) });
      throw err;
    }
  },

  removePromoCode: async (id) => {
    const original = get().promoCodes;
    set({ promoCodes: original.filter(p => p.id !== id) });
    try {
      await deletePromoCode(id);
    } catch (err: unknown) {
      set({ promoCodes: original, promoCodesError: extractErrorMessage(err) });
      throw err;
    }
  },

  // Shipping Rates
  fetchShippingRates: async () => {
    set({ shippingRatesLoading: true, shippingRatesError: null });
    try {
      const data = await getAdminShippingRates();
      set({ shippingRates: data, shippingRatesError: null });
    } catch (err: unknown) {
      set({ shippingRatesError: extractErrorMessage(err) });
    } finally {
      set({ shippingRatesLoading: false });
    }
  },

  addShippingRate: async (data) => {
    set({ shippingRatesLoading: true, shippingRatesError: null });
    try {
      await createShippingRate(data);
      await get().fetchShippingRates();
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      set({ shippingRatesError: msg });
      throw new Error(msg);
    } finally {
      set({ shippingRatesLoading: false });
    }
  },

  editShippingRate: async (id, data) => {
    const original = get().shippingRates;
    set({
      shippingRates: original.map(r => r.id === id ? { ...r, rate: data.rate } : r)
    });
    try {
      await updateShippingRate(id, data);
    } catch (err: unknown) {
      set({ shippingRates: original, shippingRatesError: extractErrorMessage(err) });
      throw err;
    }
  },

  removeShippingRate: async (id) => {
    const original = get().shippingRates;
    set({ shippingRates: original.filter(r => r.id !== id) });
    try {
      await deleteShippingRate(id);
    } catch (err: unknown) {
      set({ shippingRates: original, shippingRatesError: extractErrorMessage(err) });
      throw err;
    }
  },

  // Notifications Actions
  addNotification: (n) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newN = {
      ...n,
      id,
      timestamp: new Date(),
      read: false
    };
    set(state => ({
      notifications: [newN, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },

  markAllNotificationsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }));
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  pollNewOrders: async () => {
    try {
      const data = await getOrders();
      const existingOrders = get().orders;
      
      // If we don't have orders loaded in client yet, just save them silently and return empty
      if (existingOrders.length === 0) {
        set({ orders: data });
        return [];
      }

      // Check if there are any new orders
      const existingIds = new Set(existingOrders.map(o => o.id));
      const newOrders = data.filter(o => !existingIds.has(o.id));

      if (newOrders.length > 0) {
        // Update client store with latest orders list
        set({ orders: data });

        // Add a notification for each new order
        newOrders.forEach(o => {
          get().addNotification({
            title: "New Order Received",
            message: `Order #${o.id} placed by ${o.customer} for EGP ${o.total.toLocaleString()}`,
            type: "success"
          });
        });
      }

      return newOrders;
    } catch (err) {
      console.error("Silent polling failed:", err);
      return [];
    }
  }
}));
