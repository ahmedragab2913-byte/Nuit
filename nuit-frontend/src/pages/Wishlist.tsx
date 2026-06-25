import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useLanguageStore, getBilingualValue, formatPrice } from "../store/languageStore";
import { getProductImage } from "../services/api";
import { ShoppingBag, Trash2, Heart, ArrowRight } from "lucide-react";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function Wishlist() {
  const navigate = useNavigate();
  const { products, wishlisted, fetchProducts, toggleWish, addToCart } = useCartStore();
  const { t, language } = useLanguageStore();
  const isAr = language === "ar";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchProducts();
  }, [fetchProducts]);

  // Filter products that are in the user's wishlist
  const wishlistedProducts = products.filter((p) => wishlisted.includes(p.id));

  return (
    <div
      className="bg-background text-foreground min-h-screen pt-32 pb-24 px-6 lg:px-16"
      style={sans}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary/80 text-xs tracking-[0.3em] uppercase">
            <Heart size={12} className="animate-pulse fill-primary" />
            <span>{t("wishlist")}</span>
          </div>
          <h1
            className={`text-3xl md:text-5xl font-light text-foreground ${isAr ? "" : "tracking-[0.25em] uppercase"}`}
            style={serif}
          >
            {t("wishlistTitle")}
          </h1>
          <div className="w-12 h-[1px] bg-primary/60 mx-auto" />
          <p className="text-muted-foreground text-sm font-light max-w-xl mx-auto leading-relaxed">
            {t("wishlistDesc")}
          </p>
        </div>

        {wishlistedProducts.length === 0 ? (
          /* ── Empty State ────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-20 text-center select-none border border-border/30 bg-secondary/5 rounded-sm max-w-2xl mx-auto p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/30 rounded-full mb-6 border border-border/40">
              <Heart size={28} strokeWidth={1.2} className="text-muted-foreground/60" />
            </div>
            <h2 className="text-xl md:text-2xl font-light text-foreground mb-3" style={serif}>
              {t("wishlistEmpty")}
            </h2>
            <p className="text-muted-foreground text-xs font-light max-w-sm mb-8 leading-relaxed">
              {isAr
                ? "تصفح العطور الاستثنائية المتوفرة في بوتيك نوي وأضف عطرك المفضل هنا."
                : "Browse our signature collections and curate your personal collection of desired fragrances."}
            </p>
            <button
              onClick={() => navigate("/shop")}
              className={`group flex items-center gap-3 text-[10px] ${isAr ? "" : "tracking-[0.25em]"} uppercase text-foreground border border-border px-8 py-4 hover:border-primary hover:text-primary transition-all duration-300 cursor-pointer font-semibold`}
            >
              {t("exploreCollection")}
              <ArrowRight
                size={13}
                className={`group-hover:translate-x-1 transition-transform ${isAr ? "rotate-180 group-hover:-translate-x-1" : ""}`}
              />
            </button>
          </div>
        ) : (
          /* ── Wishlist Grid ──────────────────────────────────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {wishlistedProducts.map((product) => {
              const displayName = getBilingualValue(product.name, product.name_ar, language);
              
              return (
                <div key={product.id} className="group relative flex flex-col border border-border/30 bg-secondary/10 p-4 rounded-sm">
                  {/* Remove Button */}
                  <button
                    onClick={() => toggleWish(product.id)}
                    className={`absolute top-6 z-30 p-2 rounded-full bg-background/80 hover:bg-red-500/10 border border-border/30 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer ${isAr ? "left-6" : "right-6"}`}
                    title={isAr ? "إزالة من قائمة الأمنيات" : "Remove from wishlist"}
                  >
                    <Trash2 size={13} />
                  </button>

                  {/* Image wrapper */}
                  <div
                    className="relative aspect-[3/4] w-full bg-secondary overflow-hidden border border-border/20 mb-5 cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <img
                      src={getProductImage(product.image)}
                      alt={displayName}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* Product info */}
                  <div
                    className="flex flex-col flex-grow text-center cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <span className={`text-[9px] uppercase text-muted-foreground mb-1 ${isAr ? "" : "tracking-[0.2em]"}`}>
                      {product.category || t("maisonCollection")}
                    </span>
                    <h3 className="text-base text-foreground font-light mb-1" style={serif}>
                      {displayName}
                    </h3>
                    <span
                      className="text-l tracking-[0.16em] uppercase font-medium lining-nums mt-auto"
                      style={{ fontFamily: "'Playfair Display', serif", color: "#c4a76b" }}
                    >
                      {formatPrice(product.price, language)}
                    </span>
                  </div>

                  {/* Add to Bag CTA */}
                  <button
                    onClick={() => addToCart(product, 1)}
                    className="w-full bg-foreground text-background text-[10px] tracking-wider uppercase font-semibold py-3 hover:bg-foreground/90 transition-colors mt-4 flex items-center justify-center gap-2 cursor-pointer rounded-sm"
                  >
                    <ShoppingBag size={12} />
                    {t("addToBag")}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
