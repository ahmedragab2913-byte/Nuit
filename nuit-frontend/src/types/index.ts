export interface Product {
  id: number;
  name: string;
  name_ar?: string;
  tagline: string;
  price: number;
  size: string;
  category: string;
  notes: string[];
  description: string;
  description_ar?: string;
  image: string;
  featured?: boolean;
  stock: number;
  sales: number; // عدد المبيعات
}

export interface CartItem {
  product: Product;
  quantity: number;
}
