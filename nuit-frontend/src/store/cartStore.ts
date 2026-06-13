import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, CartItem } from "../types";
import { getProducts, getDBCart, syncDBCart } from "../services/api";

interface CartStoreState {
  cart: CartItem[];
  wishlisted: number[]; // Store product IDs
  products: Product[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProducts: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQty: (productId: number, quantity: number) => void;
  toggleWish: (productId: number) => void;
  clearCart: () => void;
  syncWithDB: () => Promise<void>;
  loadFromDB: () => Promise<void>;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlisted: [],
      products: [],
      loading: false,
      error: null,

      fetchProducts: async () => {
        if (get().products.length > 0) return;
        try {
          set({ loading: true, error: null });
          const products = await getProducts();
          set({ products });
        } catch (err) {
          console.error("Failed to fetch products:", err);
          set({ error: "Unable to load the collection. Please try again later." });
        } finally {
          set({ loading: false });
        }
      },

      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existing = state.cart.find((item) => item.product.id === product.id);
          let newCart;
          if (existing) {
            newCart = state.cart.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            newCart = [...state.cart, { product, quantity }];
          }
          return { cart: newCart };
        });
        get().syncWithDB();
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.product.id !== productId),
        }));
        get().syncWithDB();
      },

      updateQty: (productId, quantity) => {
        set((state) => {
          if (quantity < 1) {
            return { cart: state.cart.filter((item) => item.product.id !== productId) };
          }
          return {
            cart: state.cart.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
          };
        });
        get().syncWithDB();
      },

      toggleWish: (productId) => {
        set((state) => {
          const isWishlisted = state.wishlisted.includes(productId);
          return {
            wishlisted: isWishlisted
              ? state.wishlisted.filter((id) => id !== productId)
              : [...state.wishlisted, productId],
          };
        });
      },

      clearCart: () => {
        set({ cart: [] });
        get().syncWithDB();
      },

      syncWithDB: async () => {
        try {
          const hasCheckedAuth = (await import("./authStore")).useAuthStore.getState().isAuthenticated;
          if (!hasCheckedAuth) return;

          // 1. بناء الـ Array الخاصة بالمنتجات
          const mappedItems = get().cart.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          }));

          // 2. تغليف الـ Array داخل الـ Object المطلوب من الباك إيند بالملي
          const payload = {
            items: mappedItems
          };

          // 3. إرسال الـ Payload المتغلف
          await syncDBCart(payload);
        } catch (err) {
          console.error("Cart sync with DB failed:", err);
        }
      },

      loadFromDB: async () => {
        try {
          set({ loading: true });
          const dbItems = await getDBCart();
          if (Array.isArray(dbItems)) {
            const productsList = get().products.length > 0 ? get().products : await getProducts();
            
            const cartItems: CartItem[] = dbItems.map((dbItem: any) => {
              const product = productsList.find((p) => p.id === dbItem.product.id) || dbItem.product;
              return {
                product,
                quantity: dbItem.quantity,
              };
            });

            set({ cart: cartItems, products: productsList });
          }
        } catch (err) {
          console.error("Failed to load cart from DB:", err);
        } finally {
          set({ loading: false });
        }
      }
    }),
    {
      name: "nuit-cart-storage",
      partialize: (state) => ({
        cart: state.cart,
        wishlisted: state.wishlisted,
      }),
    }
  )
);