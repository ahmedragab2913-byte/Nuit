import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, CartItem } from "../types";
import { getProducts, getDBCart, syncDBCart, getDBWishlist, syncDBWishlist } from "../services/api";

// ─── DB Cart Item shape returned by the API ───────────────────
interface DBCartItem {
  id: number;
  quantity: number;
  product: Product;
}

// ─── Debounce timers ──────────────────────────────────────────
let syncTimer: ReturnType<typeof setTimeout> | null = null;
let wishSyncTimer: ReturnType<typeof setTimeout> | null = null;
const SYNC_DEBOUNCE_MS = 600;

// ─── Product cache TTL ────────────────────────────────────────
const PRODUCTS_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CartStoreState {
  cart: CartItem[];
  wishlisted: number[]; // Store product IDs
  products: Product[];
  productsLoadedAt: number; // timestamp for TTL
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProducts: (force?: boolean) => Promise<void>;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQty: (productId: number, quantity: number) => void;
  toggleWish: (productId: number) => void;
  clearCart: (skipSync?: boolean) => void;
  clearWishlist: () => void;
  syncWithDB: () => Promise<void>;
  syncWishlistWithDB: () => Promise<void>;
  loadFromDB: () => Promise<void>;
  loadWishlistFromDB: () => Promise<void>;
}

/**
 * Schedules a debounced syncWithDB call.
 * Prevents N rapid mutations from firing N API requests.
 */
function debouncedSync(get: () => CartStoreState) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    get().syncWithDB();
  }, SYNC_DEBOUNCE_MS);
}

function debouncedWishSync(get: () => CartStoreState) {
  if (wishSyncTimer) clearTimeout(wishSyncTimer);
  wishSyncTimer = setTimeout(() => {
    get().syncWishlistWithDB();
  }, SYNC_DEBOUNCE_MS);
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlisted: [],
      products: [],
      productsLoadedAt: 0,
      loading: false,
      error: null,

      fetchProducts: async (force = false) => {
        const state = get();
        // Skip if products are cached and within TTL (unless forced)
        if (
          !force &&
          state.products.length > 0 &&
          Date.now() - state.productsLoadedAt < PRODUCTS_TTL_MS
        ) {
          return;
        }

        try {
          set({ loading: true, error: null });
          const products = await getProducts();
          
          // Prune any stale IDs from wishlisted list that do not exist in database
          const cleanWishlisted = state.wishlisted.filter((id) =>
            products.some((p) => p.id === id)
          );
          
          set({ products, wishlisted: cleanWishlisted, productsLoadedAt: Date.now() });
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
        debouncedSync(get);
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.product.id !== productId),
        }));
        debouncedSync(get);
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
        debouncedSync(get);
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
        debouncedWishSync(get);
      },

      clearCart: (skipSync = false) => {
        set({ cart: [] });
        // Cancel any pending debounced sync
        if (syncTimer) {
          clearTimeout(syncTimer);
          syncTimer = null;
        }
        if (!skipSync) {
          get().syncWithDB(); // immediate, no debounce — this is intentional
        }
      },

      clearWishlist: () => {
        set({ wishlisted: [] });
        if (wishSyncTimer) {
          clearTimeout(wishSyncTimer);
          wishSyncTimer = null;
        }
      },

      syncWithDB: async () => {
        try {
          // ✅ Check token directly — avoids circular import with authStore
          const token = typeof window !== "undefined"
            ? localStorage.getItem("nuit_auth_token")
            : null;
          if (!token) return;

          const mappedItems = get().cart.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          }));

          await syncDBCart({ items: mappedItems });
        } catch (err) {
          console.error("Cart sync with DB failed:", err);
        }
      },

      loadFromDB: async () => {
        try {
          set({ loading: true });
          const dbItems: DBCartItem[] = await getDBCart();
          if (Array.isArray(dbItems)) {
            const productsList = get().products.length > 0 ? get().products : await getProducts();
            
            const cartItems: CartItem[] = dbItems.map((dbItem) => {
              const product = productsList.find((p) => p.id === dbItem.product.id) || dbItem.product;
              return {
                product,
                quantity: dbItem.quantity,
              };
            });

            set({ cart: cartItems, products: productsList, productsLoadedAt: Date.now() });
          }
        } catch (err) {
          console.error("Failed to load cart from DB:", err);
        } finally {
          set({ loading: false });
        }
      },

      syncWishlistWithDB: async () => {
        try {
          const token = typeof window !== "undefined"
            ? localStorage.getItem("nuit_auth_token")
            : null;
          if (!token) return;

          const ids = get().wishlisted;
          await syncDBWishlist(ids);
        } catch (err) {
          console.error("Wishlist sync with DB failed:", err);
        }
      },

      loadWishlistFromDB: async () => {
        try {
          const token = typeof window !== "undefined"
            ? localStorage.getItem("nuit_auth_token")
            : null;
          if (!token) return;

          // Merge: local guest wishlist IDs + DB wishlist IDs, push merged set to DB
          const localIds = get().wishlisted;
          const dbProducts = await getDBWishlist();
          const dbIds = dbProducts.map((p) => p.id);

          // Union of both lists (guest + DB), deduped
          const merged = Array.from(new Set([...localIds, ...dbIds]));

          if (merged.length !== dbIds.length || localIds.some((id) => !dbIds.includes(id))) {
            // Local has items not in DB → push merged list to DB
            await syncDBWishlist(merged);
          }

          set({ wishlisted: merged });
        } catch (err) {
          console.error("Failed to load wishlist from DB:", err);
        }
      },
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