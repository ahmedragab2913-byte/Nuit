import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Heart, ShoppingBag, Eye, Sparkles, Search, X } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useLanguageStore, getBilingualValue, formatPrice } from "../store/languageStore";
import type { Product } from "../types";
import { getProductswithPagination, getCategories, getProductImage } from "../services/api";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

const ITEMS_PER_PAGE = 12;

// 1. تعريف نصوص الهيدر لكل فئة باللغتين العربية والإنجليزية
const CATEGORY_HEADERS: Record<string, { title: { ar: string; en: string }; desc: { ar: string; en: string } }> = {
  All: {
    title: { ar: "كل المنتجات", en: "All Products" },
    desc: { ar: "مجموعة منسقة من العطور الفاخرة المصممة لكل المناسبات. جرب الأناقة التي تدوم طويلاً وتحدد حضورك.", en: "A curated collection of luxury fragrances crafted for every occasion. Experience elegance that lingers." }
  },
  "Men Perfumes": {
    title: { ar: "عطور رجالية", en: "Men's Perfumes" },
    desc: { ar: "مجموعة فاخرة من العطور الرجالية الجريئة والقوية التي تعكس الجاذبية والثقة المطلقة.", en: "A bold selection of sophisticated fragrances crafted for the modern gentleman." }
  },
  "Women Perfumes": {
    title: { ar: "عطور نسائية", en: "Women's Perfumes" },
    desc: { ar: "تركيبات ساحرة تفيض بالأنوثة والرقة، مصممة خصيصاً لتترك أثراً لا يُنسى في كل مكان.", en: "Enchanting compositions of delicate notes, designed to leave an unforgettable impression." }
  },
  Unisex: {
    title: { ar: "عطور للجنسين", en: "Unisex Perfumes" },
    desc: { ar: "عطور متناغمة تتجاوز الحدود لتناسب الجميع، بمزيج فريد يجمع بين الدفء والانتعاش.", en: "Harmonious scents tailored for everyone, blending unique elements to defy expectations." }
  },
  General: {
    title: { ar: "عطور عامة", en: "General Collection" },
    desc: { ar: "اكتشف تشكيلتنا العامة والمتنوعة من الإبداعات العطرية التي تناسب يومك بمختلف تفاصيله.", en: "Discover our versatile collection of aromatic creations perfect for your daily rituals." }
  }
};

export default function Shop() {
  const navigate = useNavigate();
  const { wishlisted, addToCart, toggleWish } = useCartStore();
  const { language, t } = useLanguageStore();

  const translateCategory = (cat: string) => {
    if (cat === "All") return t("all");
    if (cat === "Men Perfumes") return t("mensPerfumes");
    if (cat === "Women Perfumes") return t("womensPerfumes");
    if (cat === "Unisex") return t("unisex");
    return cat;
  };

  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeCategory = searchParams.get("category") || "All";
  const currentPage    = Number(searchParams.get("page")) || 1;
  const searchQuery    = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [hoveredId, setHoveredId]             = useState<string | number | null>(null);
  const [products, setProducts]               = useState<Product[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [totalPages, setTotalPages]           = useState(1);
  const [total, setTotal]                     = useState(0);
  const [categories, setCategories]           = useState<string[]>(["All"]);
  const [addedIds, setAddedIds]               = useState<Set<number>>(new Set());

  // جلب النصوص الديناميكية للفئة الحالية (وإن لم تكن معرفة نعود لـ All كاحتياط)
  const currentHeader = CATEGORY_HEADERS[activeCategory] || CATEGORY_HEADERS["All"];
  const displayTitle = language === "ar" ? currentHeader.title.ar : currentHeader.title.en;
  const displayDesc = language === "ar" ? currentHeader.desc.ar : currentHeader.desc.en;

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    getCategories()
      .then(data => {
        const preferredOrder = ["All", "Men Perfumes", "Women Perfumes", "Unisex", "General"];
        const sortedCategories = ["All", ...data].sort((a, b) => {
          const indexA = preferredOrder.indexOf(a);
          const indexB = preferredOrder.indexOf(b);
          const finalIndexA = indexA === -1 ? 99 : indexA;
          const finalIndexB = indexB === -1 ? 99 : indexB;
          return finalIndexA - finalIndexB;
        });
        setCategories(sortedCategories);
      })
      .catch(err => console.error("Failed to load categories:", err));
  }, []);

  const fetchProducts = (page: number, category: string, query: string) => {
    setLoading(true);
    setError(null);
    getProductswithPagination(page, ITEMS_PER_PAGE, category, query)
      .then(data => {
        setProducts(data.data);
        setTotalPages(data.last_page);
        setTotal(data.total);
      })
      .catch(() => setError("Unable to load the collection. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts(currentPage, activeCategory, searchQuery);
  }, [currentPage, activeCategory, searchQuery]);

  const filtered = products;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = { page: "1" };
    if (activeCategory !== "All") params.category = activeCategory;
    if (searchInput.trim() !== "") params.search = searchInput.trim();
    setSearchParams(params);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    const params: any = { page: "1" };
    if (activeCategory !== "All") params.category = activeCategory;
    setSearchParams(params);
  };

  const handleCategoryChange = (cat: string) => {
    const params: any = { page: "1" };
    if (cat !== "All") params.category = cat;
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params);
  };

  const goToPage = (page: number) => {
    const params: any = { page: page.toString() };
    if (activeCategory !== "All") params.category = activeCategory;
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params);
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

        {/* Dynamic Header */}
        <div className="text-center mb-10 space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary/80 text-xs tracking-[0.3em] uppercase">
            <Sparkles size={12} />
            <span>{language === "ar" ? "التشكيلة الخاصة" : "Maison Collection"}</span>
          </div>
          {/* تغيير العنوان ديناميكياً */}
          <h1 className="text-3xl md:text-5xl tracking-[0.25em] uppercase font-light text-foreground/90" style={serif}>
            {displayTitle}
          </h1>
          <div className="w-12 h-[1px] bg-primary/60 mx-auto" />
          {/* تغيير الوصف ديناميكياً */}
          <p className="text-muted-foreground text-sm font-light max-w-xl mx-auto leading-relaxed">
            {displayDesc}
          </p>
        </div>

        {/* Luxury Search Bar */}
        <div className="max-w-md mx-auto mb-14">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-border focus-within:border-primary transition-colors duration-300 pb-2">
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-transparent text-sm font-light tracking-wide text-foreground placeholder-muted-foreground/60 outline-none pr-8"
            />
            <div className="absolute right-0 flex items-center gap-2">
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="submit"
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <Search size={16} />
              </button>
            </div>
          </form>
          {searchQuery && (
            <p className="text-[11px] text-muted-foreground tracking-wide mt-2 text-center">
              {language === "ar" ? "نتائج البحث عن:" : "Results for:"} <span className="text-primary italic">"{searchQuery}"</span>
            </p>
          )}
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
                {translateCategory(cat)}
                {activeCategory === cat && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary" />
                )}
              </button>
            ))
          }
        </div>

        {/* Products Render Box */}
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
            <p className="text-muted-foreground text-sm font-light mb-6">
              {language === "ar" ? "عذراً، تعذر تحميل مجموعة العطور. يرجى المحاولة لاحقاً." : error}
            </p>
            <button
              onClick={() => fetchProducts(currentPage, activeCategory, searchQuery)}
              className="text-[10px] tracking-[0.25em] uppercase text-foreground border border-border px-8 py-3 hover:border-primary hover:text-primary transition-all cursor-pointer"
            >
              {language === "ar" ? "أعد المحاولة" : "Try Again"}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-muted-foreground text-sm font-light">{t("noProducts")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {filtered.map(product => {
                const isWish = wishlisted.includes(product.id);
                const pName = getBilingualValue(product.name, product.name_ar, language);
                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col"
                    onMouseEnter={() => setHoveredId(product.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="relative aspect-[3/4] w-full bg-secondary overflow-hidden border border-border/40 mb-5">
                      <img
                        src={getProductImage(product.image)}
                        alt={pName}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-10">
                          <span className="bg-[#0c0c0c]/90 text-white/90 border border-white/10 px-3 py-1.5 text-[9px] uppercase tracking-widest font-light">
                            {t("outOfStock")}
                          </span>
                        </div>
                      )}
                      <button
                        className={`absolute top-4 right-4 z-30 p-1.5 rounded-full transition-all duration-300 cursor-pointer lg:opacity-0 lg:group-hover:opacity-100 ${
                          isWish ? "text-primary opacity-100" : "text-foreground/60 hover:text-primary"
                        }`}
                        onClick={e => { e.stopPropagation(); toggleWish(product.id); }}
                      >
                        <Heart size={15} fill={isWish ? "currentColor" : "none"} />
                      </button>
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
                            {addedIds.has(product.id) ? (language === "ar" ? "تمت الإضافة" : "Added") : <><ShoppingBag size={13} /> {t("addToCart")}</>}
                          </button>
                        ) : (
                          <div className="w-44 bg-zinc-800/80 text-zinc-400 text-xs tracking-[0.15em] uppercase font-medium py-3 border border-zinc-700/50 cursor-not-allowed flex items-center justify-center">
                            {t("outOfStock")}
                          </div>
                        )}
                        <button
                          onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                          className="w-44 bg-transparent border border-white/60 text-white text-xs tracking-[0.15em] uppercase font-medium py-3 hover:bg-white/10 transition-colors duration-300 flex items-center justify-center gap-2 backdrop-blur-sm cursor-pointer"
                        >
                          <Eye size={13} /> {language === "ar" ? "عرض التفاصيل" : "View Details"}
                        </button>
                      </div>
                    </div>
                    <div
                      className="flex flex-col flex-grow text-center cursor-pointer"
                      onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                    >
                      <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                        {translateCategory(product.category)}
                      </span>
                      <h3 className="text-base tracking-[0.05em] text-foreground font-light mb-1" style={sans}>
                        {pName}
                      </h3>
                      <p className="text-xs text-muted-foreground/80 font-light line-clamp-2 px-4 mb-3 leading-relaxed">
                        {product.tagline}
                      </p>
                      <div className="mt-auto pt-2 flex flex-col gap-2 items-center">
                        <span 
                          className="text-base tracking-[0.16em] uppercase font-medium lining-nums" 
                          style={{ ...serif, color: "#c4a76b" }}
                        >
                          {formatPrice(product.price, language)}
                        </span>
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

                    {/* Mobile Quick Buttons */}
                    <div className="mt-5 lg:hidden flex gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); handleAddToCart(product); }}
                        disabled={addedIds.has(product.id)}
                        className="flex-1 bg-foreground text-background text-xs tracking-[0.15em] uppercase font-medium py-2.5 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingBag size={12} /> {addedIds.has(product.id) ? (language === "ar" ? "تم" : "Added") : (language === "ar" ? "إضافة" : "Add")}
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

            {/* Pagination Box */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 mt-16">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    {language === "ar" ? "‹ السابق" : "‹ Prev"}
                  </button>

                  <div className="flex items-center gap-3">
                    {(() => {
                      const pages = [];
                      const maxVisible = 1;

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

                      if (currentPage > maxVisible + 2) {
                        pages.push(<span key="dots-start" className="text-muted-foreground/40 text-xs px-0.5 select-none">...</span>);
                      }

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

                      if (currentPage < totalPages - maxVisible - 1) {
                        pages.push(<span key="dots-end" className="text-muted-foreground/40 text-xs px-0.5 select-none">...</span>);
                      }

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
                    {language === "ar" ? "التالي ›" : "Next ›"}
                  </button>
                </div>

                <p className="text-[10px] text-muted-foreground tracking-wider">
                  {language === "ar"
                    ? `عرض ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, total)} من أصل ${total} عطور`
                    : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, total)} of ${total} fragrances`
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}