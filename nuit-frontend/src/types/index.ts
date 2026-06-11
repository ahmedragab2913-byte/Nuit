export interface Product {
  id: number;
  name: string;
  tagline: string;
  price: number;
  size: string;
  category: string;
  notes: string[];
  description: string;
  image: string;
  featured?: boolean;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
