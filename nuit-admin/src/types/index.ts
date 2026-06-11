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

export interface DashboardStats {
  revenue: number;
  orders: number;
  products: number;
  customers: number;
  top_products: Product[];
  recent_orders: Order[];
  revenue_chart: { month: number; total: number }[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}
