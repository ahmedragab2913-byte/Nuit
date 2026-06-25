import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBestSellers, getProductImage } from "../services/api";
import { ShoppingBag, Eye, Sparkles } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useLanguageStore, getBilingualValue, formatPrice } from "../store/languageStore";
import type { Product } from "../types";


const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function BestSellers() {
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { t, language } = useLanguageStore();
  const isAr = language === "ar";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 4;

  const fetchBestSellersData = async (pageNumber: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBestSellers(pageNumber, itemsPerPage);
      setProducts(res.data);
      setCurrentPage(res.current_page);
      setTotalPages(res.last_page);
    } catch (err: any) {
      console.error("Failed to load best sellers:", err);
      setError(t("failedBestSellers"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchBestSellersData(currentPage);
  }, [currentPage]);

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
            <Sparkles size={12} className="animate-pulse" />
            <span>{t("maisonFavorites")}</span>
          </div>
          <h1
            className={`text-3xl md:text-5xl font-light text-foreground ${isAr ? "" : "tracking-[0.25em] uppercase"}`}
            style={serif}
          >
            {t("bestSellers")}
          </h1>
          <div className="w-12 h-[1px] bg-primary/60 mx-auto" />
          <p className="text-muted-foreground text-sm font-light max-w-xl mx-auto leading-relaxed">
            {t("bestSellersDesc")}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex flex-col">
                <div className="bg-secondary aspect-[3/4] mb-5 w-full border border-border/20" />
                <div className="h-3 bg-secondary w-1/3 mx-auto mb-2 rounded-sm" />
                <div className="h-4 bg-secondary w-2/3 mx-auto mb-2 rounded-sm" />
                <div className="h-3 bg-secondary w-1/2 mx-auto rounded-sm" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground text-sm font-light mb-6">{error}</p>
            <button
              onClick={() => fetchBestSellersData(currentPage)}
              className={`text-[10px] uppercase text-foreground border border-border px-8 py-3 hover:border-primary hover:text-primary transition-all cursor-pointer ${isAr ? "" : "tracking-[0.25em]"}`}
            >
              {t("tryAgain")}
            </button>
          </div>
        ) : (
          <>
            {/* ── Product Grid ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {products.map((product) => {
                const displayName = getBilingualValue(product.name, product.name_ar, language);

                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col"
                    onMouseEnter={() => setHoveredId(product.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="relative aspect-[3/4] w-full bg-secondary overflow-hidden border border-border/40 mb-5">
                      {/* Badge */}
                      <span className={`absolute top-3 z-10 text-[9px] font-medium tracking-[0.15em] uppercase bg-background/90 text-foreground px-2.5 py-1 backdrop-blur-sm border border-border/30 ${isAr ? "right-3" : "left-3"}`}>
                        {t("bestSellerBadge")}
                      </span>
                      <img
                        src={getProductImage(product.image)}
                        alt={displayName}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      {/* Hover overlay */}
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

                    {/* Product info */}
                    <div
                      className={`flex flex-col flex-grow text-center cursor-pointer ${isAr ? "items-center" : ""}`}
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <span className={`text-[10px] uppercase text-muted-foreground mb-1 ${isAr ? "" : "tracking-[0.2em]"}`}>
                        {(t("categoryMap") as any)?.[product.category] 
                  ? (t("categoryMap") as any)[product.category] 
                      : product.category || t("maisonCollection")}
                      </span>
                      <h3 className="text-base text-foreground font-light mb-1" style={serif}>
                        {displayName}
                      </h3>
                      <span
                        className="text-l tracking-[0.16em] uppercase font-medium lining-nums"
                              style={{ fontFamily: "'Playfair Display', serif", color: "#c4a76b" }}
                      >
                        {formatPrice(product.price, language)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Pagination ────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 mt-20 border-t border-border/40 pt-10">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`text-[10px] uppercase text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer ${isAr ? "" : "tracking-[0.25em]"}`}
                  >
                    {t("prevPage")}
                  </button>

                  <div className="flex items-center gap-3">
                    {(() => {
                      const pages = [];
                      const maxVisible = 1;
                      pages.push(<button key={1} onClick={() => setCurrentPage(1)} className={`text-[11px] tracking-widest w-7 h-7 flex items-center justify-center cursor-pointer ${currentPage === 1 ? "text-foreground border border-border font-medium" : "text-muted-foreground hover:text-foreground"}`}>1</button>);
                      if (currentPage > maxVisible + 2) pages.push(<span key="dots-start" className="text-muted-foreground/40 text-xs px-0.5 select-none">...</span>);
                      const start = Math.max(2, currentPage - maxVisible);
                      const end = Math.min(totalPages - 1, currentPage + maxVisible);
                      for (let i = start; i <= end; i++) {
                        pages.push(<button key={i} onClick={() => setCurrentPage(i)} className={`text-[11px] tracking-widest w-7 h-7 flex items-center justify-center cursor-pointer ${currentPage === i ? "text-foreground border border-border font-medium" : "text-muted-foreground hover:text-foreground"}`}>{i}</button>);
                      }
                      if (currentPage < totalPages - maxVisible - 1) pages.push(<span key="dots-end" className="text-muted-foreground/40 text-xs px-0.5 select-none">...</span>);
                      if (totalPages > 1) pages.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={`text-[11px] tracking-widest w-7 h-7 flex items-center justify-center cursor-pointer ${currentPage === totalPages ? "text-foreground border border-border font-medium" : "text-muted-foreground hover:text-foreground"}`}>{totalPages}</button>);
                      return pages.reduce((acc: React.ReactNode[], curr, index) => {
                        if (index === 0) return [curr];
                        return [...acc, <span key={`sep-${index}`} className="text-muted-foreground/20 text-xs select-none">/</span>, curr];
                      }, []);
                    })()}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`text-[10px] uppercase text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer ${isAr ? "" : "tracking-[0.25em]"}`}
                  >
                    {t("nextPage")}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}