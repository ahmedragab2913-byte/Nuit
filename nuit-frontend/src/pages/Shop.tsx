import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Heart, ShoppingBag, Eye, Sparkles } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import type { Product } from "../types";
import { getProductswithPagination, getCategories } from "../services/api";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

const ITEMS_PER_PAGE = 12;

export default function Shop() {
  const navigate = useNavigate();
  const { wishlisted, addToCart, toggleWish } = useCartStore();

  // 1. إدارة الفلترة والصفحات عبر الـ URL Query Parameters مباشرة
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeCategory = searchParams.get("category") || "All";
  const currentPage    = Number(searchParams.get("page")) || 1;

  const [hoveredId, setHoveredId]             = useState<string | number | null>(null);
  const [products, setProducts]               = useState<Product[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [totalPages, setTotalPages]           = useState(1);
  const [total, setTotal]                     = useState(0);
  const [categories, setCategories]           = useState<string[]>(["All"]);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  // 2. جلب الفئات وترتيبها ترتيب مخصص (Men -> Women -> Unisex)
  useEffect(() => {
    getCategories()
      .then(data => {
        // الترتيب المفضل لعرض التبويب في الواجهة
        const preferredOrder = ["All", "Men Perfumes", "Women Perfumes", "Unisex", "General"];

        const sortedCategories = ["All", ...data].sort((a, b) => {
          const indexA = preferredOrder.indexOf(a);
          const indexB = preferredOrder.indexOf(b);

          // إذا ظهرت فئة جديدة من قاعدة البيانات مستقبلاً توضع في النهاية تلقائياً
          const finalIndexA = indexA === -1 ? 99 : indexA;
          const finalIndexB = indexB === -1 ? 99 : indexB;

          return finalIndexA - finalIndexB;
        });

        setCategories(sortedCategories);
      })
      .catch(err => console.error("Failed to load categories:", err));
  }, []);

  // 3. دالة جلب المنتجات بناءً على الفئة والصفحة الحالية من الـ API
  const fetchProducts = (page: number, category: string) => {
    setLoading(true);
    setError(null);

    getProductswithPagination(page, ITEMS_PER_PAGE, category)
      .then(data => {
        setProducts(data.data);
        setTotalPages(data.last_page);
        setTotal(data.total);
      })
      .catch(() => setError("Unable to load the collection. Please try again."))
      .finally(() => setLoading(false));
  };

  // 4. مراقبة الـ URL لتحديث المنتجات فوراً عند الضغط على أي فلتر أو الانتقال لصفحة أخرى
  useEffect(() => {
    fetchProducts(currentPage, activeCategory);
  }, [currentPage, activeCategory]);

  // البيانات تأتي مفرزة بالكامل من الـ Backend
  const filtered = products;

  const handleCategoryChange = (cat: string) => {
    if (cat === "All") {
      setSearchParams({}); // العودة للمتجر العام ومسح الـ Parameters
    } else {
      setSearchParams({ category: cat, page: "1" }); // الانتقال للفئة وتصفير الصفحة لـ 1 دائمًا
    }
  };

  const goToPage = (page: number) => {
    if (activeCategory === "All") {
      setSearchParams({ page: page.toString() });
    } else {
      setSearchParams({ category: activeCategory, page: page.toString() });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleAddToCart = (product: Product) => {
  addToCart(product, 1);
  setAddedIds(prev => new Set(prev).add(product.id));

  setTimeout(() => {
    setAddedIds(prev => {
      const next = new Set(prev);
      next.delete(product.id);
      return next;
    });
  }, 3000);
};

  return (
    <div className="bg-background text-foreground min-h-screen pt-32 pb-24 px-6 lg:px-16" style={sans}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary/80 text-xs tracking-[0.3em] uppercase">
            <Sparkles size={12} />
            <span>Maison Collection</span>
          </div>
          <h1 className="text-3xl md:text-5xl tracking-[0.25em] uppercase font-light text-foreground" style={serif}>
            All Fragrances
          </h1>
          <div className="w-12 h-[1px] bg-primary/60 mx-auto" />
          <p className="text-muted-foreground text-sm font-light max-w-xl mx-auto leading-relaxed">
            Explore our curated catalog of artistic extraits de parfum. Crafted with absolute raw ingredients and designed for timeless presence.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex justify-center gap-7 mb-16 border-b border-border/60 pb-5 overflow-x-auto">
          {loading && categories.length === 1
            ? [1, 2, 3, 4].map(i => <div key={i} className="h-4 w-20 bg-secondary rounded animate-pulse flex-shrink-0" />)
            : categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`text-[10px] tracking-[0.22em] uppercase whitespace-nowrap pb-2 transition-all duration-300 relative cursor-pointer ${
                  activeCategory === cat ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
                {activeCategory === cat && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary" />
                )}
              </button>
            ))
          }
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse flex flex-col">
                <div className="bg-secondary aspect-[3/4] mb-5 w-full border border-border/20" />
                <div className="h-2 bg-secondary w-1/3 mx-auto mb-2 rounded-sm" />
                <div className="h-4 bg-secondary w-2/3 mx-auto mb-2 rounded-sm" />
                <div className="h-3 bg-secondary w-1/2 mx-auto mb-4 rounded-sm" />
                <div className="h-3 bg-secondary w-1/4 mx-auto rounded-sm" />
              </div>
            ))}
          </div>

        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-muted-foreground text-sm font-light mb-6">{error}</p>
            <button
              onClick={() => fetchProducts(currentPage, activeCategory)}
              className="text-[10px] tracking-[0.25em] uppercase text-foreground border border-border px-8 py-3 hover:border-primary hover:text-primary transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>

        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-muted-foreground text-sm font-light">No fragrances in this category yet.</p>
          </div>

        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {filtered.map(product => {
                const isWish = wishlisted.includes(product.id);
                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col"
                    onMouseEnter={() => setHoveredId(product.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] w-full bg-secondary overflow-hidden border border-border/40 mb-5">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      {/* شارة نفاد الكمية */}
                      {(product.stock === 0) && (
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-10">
                          <span className="bg-[#0c0c0c]/90 text-white/90 border border-white/10 px-3 py-1.5 text-[9px] uppercase tracking-widest font-light">
                            Sold Out
                          </span>
                        </div>
                      )}

                      {/* Wishlist */}
                      <button
                        className={`absolute top-4 right-4 z-30 p-1.5 rounded-full transition-all duration-300 cursor-pointer lg:opacity-0 lg:group-hover:opacity-100 ${
                          isWish ? "text-primary opacity-100" : "text-foreground/60 hover:text-primary"
                        }`}
                        onClick={e => { e.stopPropagation(); toggleWish(product.id); }}
                      >
                        <Heart size={15} fill={isWish ? "currentColor" : "none"} />
                      </button>

                      {/* Hover Overlay */}
                      <div className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 flex flex-col items-center justify-center gap-3 z-20 ${
                        hoveredId === product.id ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}>
                        {product.stock > 0 ? (
                          <button
  onClick={e => { e.stopPropagation(); handleAddToCart(product); }}
  disabled={addedIds.has(product.id)}
  className={`w-44 text-xs tracking-[0.15em] uppercase font-medium py-3 transition-colors duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
    addedIds.has(product.id)
      ? "bg-emerald-700 text-white cursor-not-allowed"
      : "bg-background text-foreground hover:bg-foreground hover:text-background"
  }`}
>
  {addedIds.has(product.id) ? (
    <>Added</>
  ) : (
    <>
      <ShoppingBag size={13} /> Add to Bag
    </>
  )}
</button>
                        ) : (
                          <div className="w-44 bg-zinc-800/80 text-zinc-400 text-xs tracking-[0.15em] uppercase font-medium py-3 border border-zinc-700/50 cursor-not-allowed flex items-center justify-center">
                            Sold Out
                          </div>
                        )}
                        
                        <button
                          onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                          className="w-44 bg-transparent border border-white/60 text-white text-xs tracking-[0.15em] uppercase font-medium py-3 hover:bg-white/10 transition-colors duration-300 flex items-center justify-center gap-2 backdrop-blur-sm cursor-pointer"
                        >
                          <Eye size={13} /> View Details
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div
                      className="flex flex-col flex-grow text-center cursor-pointer"
                      onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                    >
                      <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                        {product.category}
                      </span>
                      <h3 className="text-base tracking-[0.05em] text-foreground font-light mb-1" style={serif}>
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground/80 font-light line-clamp-2 px-4 mb-3 leading-relaxed">
                        {product.tagline}
                      </p>
                      <div className="mt-auto pt-2 flex flex-col gap-2 items-center">
                        <span className="text-sm font-medium text-foreground">EGP {product.price}</span>
                        {product.notes && product.notes.length > 0 && (
                          <div className="flex gap-1.5 justify-center flex-wrap mt-1">
                            {product.notes.slice(0, 2).map((note: string) => (
                              <span key={note} className="text-[8px] tracking-wider uppercase bg-muted text-muted-foreground/80 px-2 py-0.5 border border-border/30">
                                {note}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile Buttons */}
                    <div className="mt-5 lg:hidden flex gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); handleAddToCart(product); }}
                        disabled={addedIds.has(product.id)}
                        className="flex-1 bg-foreground text-background text-xs tracking-[0.15em] uppercase font-medium py-2.5 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingBag size={12} /> Add
                      </button>
                      <button
                        onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                        className="border border-border px-3 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination (نظام ترقيم ذكي وموحد مع هوية السايت الفخمة) */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 mt-16">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    ‹ Prev
                  </button>

                  <div className="flex items-center gap-3">
                    {(() => {
                      const pages = [];
                      const maxVisible = 1; // عدد الصفحات حول الصفحة الحالية

                      // 1. الصفحة الأولى دائمًا
                      pages.push(
                        <button
                          key={1}
                          onClick={() => goToPage(1)}
                          className={`text-[11px] tracking-widest transition-colors w-7 h-7 flex items-center justify-center cursor-pointer ${
                            currentPage === 1
                              ? "text-foreground border border-border font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          1
                        </button>
                      );

                      // نقاط البداية
                      if (currentPage > maxVisible + 2) {
                        pages.push(<span key="dots-start" className="text-muted-foreground/40 text-xs px-0.5 select-none">...</span>);
                      }

                      // 2. الصفحات الديناميكية حول الحالية
                      const start = Math.max(2, currentPage - maxVisible);
                      const end = Math.min(totalPages - 1, currentPage + maxVisible);

                      for (let i = start; i <= end; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => goToPage(i)}
                            className={`text-[11px] tracking-widest transition-colors w-7 h-7 flex items-center justify-center cursor-pointer ${
                              currentPage === i
                                ? "text-foreground border border-border font-medium"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }

                      // نقاط النهاية
                      if (currentPage < totalPages - maxVisible - 1) {
                        pages.push(<span key="dots-end" className="text-muted-foreground/40 text-xs px-0.5 select-none">...</span>);
                      }

                      // 3. الصفحة الأخيرة دائمًا
                      if (totalPages > 1) {
                        pages.push(
                          <button
                            key={totalPages}
                            onClick={() => goToPage(totalPages)}
                            className={`text-[11px] tracking-widest transition-colors w-7 h-7 flex items-center justify-center cursor-pointer ${
                              currentPage === totalPages
                                ? "text-foreground border border-border font-medium"
                                : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    // 4. دمج الصفحات مع الفاصل المائل (/) بشكل متناسق ومريح للعين
                    return pages.reduce((acc: React.ReactNode[], curr, index) => {
                      if (index === 0) return [curr];
                      return [
                        ...acc,
                        <span key={`sep-${index}`} className="text-muted-foreground/20 text-xs select-none">/</span>,
                        curr
                      ];
                    }, []);
                  })()}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer"
                >
                  Next ›
                </button>
              </div>

              {/* نص عرض عدد المنتجات الحالي */}
              <p className="text-[10px] text-muted-foreground tracking-wider">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} fragrances
              </p>
            </div>
          )}
        </>
      )}

      </div>
    </div>
  );
}