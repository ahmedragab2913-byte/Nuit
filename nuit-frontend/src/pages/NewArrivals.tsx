import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useLanguageStore, getBilingualValue, formatPrice } from "../store/languageStore";
import { ShoppingBag, Eye, Sparkles } from "lucide-react";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function NewArrivals() {
  const navigate = useNavigate();
  const { products, loading, error, fetchProducts, addToCart } = useCartStore();
  const { t, language } = useLanguageStore();
  const isAr = language === "ar";

  const [hoveredId, setHoveredId] = useState<string | number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchProducts();
  }, [fetchProducts]);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  const currentArrivals = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div
      className="bg-background text-foreground min-h-screen"
      style={sans}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="pt-28 px-8 lg:px-20 pb-24 max-w-7xl mx-auto">

        {/* ── Page Header ────────────────────────────────────────── */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles size={14} className="text-primary animate-pulse" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-primary font-medium">
              {t("maisonAdditions")}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-foreground mb-4" style={serif}>
            {t("newArrivals")}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground/80 font-light max-w-xl mx-auto leading-relaxed">
            {t("newArrivalsDesc")}
          </p>
        </div>

        {/* ── Content Area ───────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4 animate-pulse">
                <div className="aspect-[3/4] bg-secondary border border-border/20" />
                <div className="h-3 w-1/3 bg-secondary rounded-sm self-center" />
                <div className="h-4 w-2/3 bg-secondary rounded-sm self-center" />
                <div className="h-3 w-1/4 bg-secondary rounded-sm self-center" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 flex flex-col items-center">
            <p className="text-xs text-muted-foreground mb-6 font-light max-w-md">
              {error}
            </p>
            <button
              onClick={() => fetchProducts()}
              className={`text-[10px] ${isAr ? "" : "tracking-[0.25em]"} uppercase text-foreground border border-border px-8 py-3 hover:border-primary hover:text-primary transition-all cursor-pointer`}
            >
              {t("tryAgain")}
            </button>
          </div>
        ) : (
          <>
            {/* ── Product Grid ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {currentArrivals.map((product) => {
                const displayName = getBilingualValue(product.name, product.name_ar, language);
                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col"
                    onMouseEnter={() => setHoveredId(product.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="relative aspect-[3/4] w-full bg-secondary overflow-hidden border border-border/40 mb-5">
                      <span className={`absolute top-3 z-10 text-[9px] font-medium tracking-[0.15em] uppercase bg-background/90 text-foreground px-2.5 py-1 backdrop-blur-sm border border-border/30 ${isAr ? "right-3" : "left-3"}`}>
                        {t("newAdditionBadge")}
                      </span>
                      <img
                        src={product.image} alt={displayName}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 flex flex-col items-center justify-center gap-3 z-20 ${hoveredId === product.id ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                        <button
                          onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
                          className="w-44 bg-background text-foreground text-xs tracking-[0.15em] uppercase font-medium py-3 hover:bg-foreground hover:text-background transition-colors duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                          <ShoppingBag size={13} /> {t("addToBag")}
                        </button>
                        <button
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="w-44 bg-transparent border border-white/60 text-white text-xs tracking-[0.15em] uppercase font-medium py-3 hover:bg-white/10 transition-colors duration-300 flex items-center justify-center gap-2 backdrop-blur-sm cursor-pointer"
                        >
                          <Eye size={13} /> {t("viewDetails")}
                        </button>
                      </div>
                    </div>

                    <div
                      className="flex flex-col flex-grow text-center cursor-pointer"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <span className={`text-[10px] ${isAr ? "" : "tracking-[0.2em]"} uppercase text-muted-foreground mb-1`}>
                        {(t("categoryMap") as any)?.[product.category] 
                  ? (t("categoryMap") as any)[product.category] 
                      : product.category || t("maisonCollection")}
                      </span>
                      <h3 className="text-base text-foreground font-light mb-1" style={serif}>{displayName}</h3>
                      <span
                        className="text-l tracking-[0.16em] uppercase font-medium lining-nums"
                              style={{ fontFamily: "'Playfair Display', serif", color: "#313c45" }}
                      >
                        {formatPrice(product.price, language)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Pagination ────────────────────────────────────────── */}
            <div className="mt-20 flex flex-col items-center gap-4 border-t border-border/40 pt-10">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                  className={`text-[10px] ${isAr ? "" : "tracking-[0.25em]"} uppercase text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer`}
                >
                  {t("prevPage")}
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={() => setCurrentPage(1)} className={`text-[11px] tracking-widest w-7 h-7 flex items-center justify-center cursor-pointer ${currentPage === 1 ? "text-foreground border border-border font-medium" : "text-muted-foreground hover:text-foreground"}`}>1</button>
                  <span className="text-muted-foreground/20 text-xs select-none">/</span>
                  <button onClick={() => setCurrentPage(2)} disabled={products.length <= 4} className={`text-[11px] tracking-widest w-7 h-7 flex items-center justify-center cursor-pointer ${currentPage === 2 ? "text-foreground border border-border font-medium" : "text-muted-foreground hover:text-foreground"} ${products.length <= 4 ? "opacity-30 pointer-events-none" : ""}`}>2</button>
                </div>
                <button
                  onClick={() => setCurrentPage(2)} disabled={currentPage === 2 || products.length <= 4}
                  className={`text-[10px] ${isAr ? "" : "tracking-[0.25em]"} uppercase text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer`}
                >
                  {t("nextPage")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}