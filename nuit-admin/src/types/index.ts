export interface Product {
  id: number;
  name: string;
  name_ar?: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
  featured: boolean;
  published: boolean;
  sku?: string;
  description?: string;
  description_ar?: string;
  notes: string[];
  tagline?: string;
  size?: string;
  sales?: number;
}

export interface Order {
  id: string;
  order_number?: string;
  customer: string;
  email: string;
  phone?: string;
  products: string;
  total: number;
  status: "delivered" | "processing" | "pending" | "confirmed" | "preparing" | "shipped" | "cancelled";
  payment_method?: string;
  payment_status?: string;
  date: string;
  address?: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  orders: number;
  spent: number;
  joined: string;
  status: "vip" | "regular" | "new";
}

/** Shape returned by GET /api/v1/dashboard/stats */
export interface TopProductStat {
  id: number;
  name: string;
  price: number;
  image?: string | null;
  sales?: number | null;
  category?: string;
}

export interface RevenueChartPoint {
  month: number; // 1–12
  total: number;
}

export interface RecentOrderStat {
  id: string;
  customer: string;
  total: number;
  status: string;
  date: string;
}

export interface DashboardStats {
  revenue: number;
  orders: number;
  products: number;
  customers: number;
  top_products: TopProductStat[];
  recent_orders: RecentOrderStat[];
  revenue_chart: RevenueChartPoint[];
  category_stats?: {
    women_pct: number;
    men_pct: number;
    unisex_pct: number;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}
