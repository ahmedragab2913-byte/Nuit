import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { ShoppingBag, Eye, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function NewArrivals() {
  const navigate = useNavigate();
  
  const { products, loading, error, fetchProducts, addToCart } = useCartStore();
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);
  
  // الـ State دي دلوقتي هتحكم في الـ Sub-pages (الصفحة 1 أو 2 جوة الـ 8 منتجات)
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchProducts(); // بنجيب الـ 8 منتجات الأساسية من السيرفر
  }, [fetchProducts]);

  // تقسيم الـ 8 منتجات قادمين من الباك-إند إلى صفحتين (4 عناصر في كل صفحة)
  const itemsPerPage = 4;
  const indexOfLastItem = currentPage * itemsPerPage; // صفحة 1 -> 4 | صفحة 2 -> 8
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // صفحة 1 -> 0 | صفحة 2 -> 4
  
  // المصفوفة دي هتشيل الـ 4 منتجات اللي عليهم الدور في العرض حالياً
  const currentArrivals = products.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-background text-foreground min-h-screen pt-32 pb-24 px-6 lg:px-16" style={sans}>
      <div className="max-w-7xl mx-auto">
        
        {/* Page Editorial Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary/80 text-xs tracking-[0.3em] uppercase">
            <Sparkles size={12} className="animate-pulse" />
            <span>Maison Additions</span>
          </div>
          <h1 className="text-3xl md:text-5xl tracking-[0.25em] uppercase font-light text-foreground" style={serif}>
            New Arrivals
          </h1>
          <div className="w-12 h-[1px] bg-primary/60 mx-auto"></div>
          <p className="text-muted-foreground text-sm font-light max-w-xl mx-auto leading-relaxed">
            Discover our latest olfactory masterpieces. Handcrafted extraits de parfum, precision-aged and bottled for the discerning connoisseur.
          </p>
        </div>

        {/* 1. حالة التحميل (Skeleton Loader متناسق لـ 4 منتجات فقط بناءً على طلبك) */}
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
          /* 2. حالة الخطأ */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground text-sm font-light mb-6">{error}</p>
            <button
              onClick={() => fetchProducts()}
              className="text-[10px] tracking-[0.25em] uppercase text-foreground border border-border px-8 py-3 hover:border-primary hover:text-primary transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : currentArrivals.length === 0 ? (
          /* 3. حالة عدم وجود داتا */
          <div className="text-center py-16 text-muted-foreground text-sm font-light">
            No products available at the moment.
          </div>
        ) : (
          /* 4. العرض الفعلي للـ 4 منتجات الحالية */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {currentArrivals.map((product) => (
                <div 
                  key={product.id} 
                  className="group relative flex flex-col"
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Product Visual Frame */}
                  <div className="relative aspect-[3/4] w-full bg-secondary overflow-hidden border border-border/40 mb-5">
                    <span className="absolute top-3 left-3 z-10 text-[9px] font-medium tracking-[0.15em] uppercase bg-background/90 text-foreground px-2.5 py-1 backdrop-blur-sm border border-border/30">
                      New Addition
                    </span>

                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Desktop Hover Overlay */}
                    <div className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 flex flex-col items-center justify-center gap-3 z-20 ${
                      hoveredId === product.id ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, 1);
                        }}
                        className="w-44 bg-background text-foreground text-xs tracking-[0.15em] uppercase font-medium py-3 hover:bg-foreground hover:text-background transition-colors duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <ShoppingBag size={13} />
                        Add to Bag
                      </button>
                      <button
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="w-44 bg-transparent border border-white/60 text-white text-xs tracking-[0.15em] uppercase font-medium py-3 hover:bg-white/10 transition-colors duration-300 flex items-center justify-center gap-2 backdrop-blur-sm cursor-pointer"
                      >
                        <Eye size={13} />
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Product Text Details */}
                  <div className="flex flex-col flex-grow text-center cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                      {product.category || "Maison Collection"}
                    </span>
                    <h3 className="text-base tracking-[0.05em] text-foreground font-light mb-1" style={serif}>
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground/80 font-light line-clamp-2 px-4 mb-3 leading-relaxed">
                      {product.tagline || product.description}
                    </p>
                    <span className="text-sm font-medium text-foreground mt-auto" style={sans}>
                      EGP {product.price?.toLocaleString()}
                    </span>
                  </div>

                  {/* Mobile Fallback Button */}
                  <div className="mt-4 lg:hidden">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product, 1);
                      }}
                      className="w-full bg-foreground text-background text-xs tracking-[0.15em] uppercase font-medium py-2.5 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag size={13} />
                      Quick Add
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Premium Pagination Controls (نظام صفحتين 4 و 4 تفاعلي بالكامل) */}
<div className="mt-20 flex items-center justify-center gap-8 border-t border-border/40 pt-10">
  
  {/* سهم الصفحة السابقة */}
  <button
    onClick={() => setCurrentPage(1)}
    disabled={currentPage === 1}
    className="flex items-center gap-1.5 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
  >
    <ChevronLeft size={14} />
    <span className="hidden sm:inline">Prev</span>
  </button>

  {/* أرقام الصفحات التفاعلية Clickable */}
  <div className="flex items-center gap-4 text-xs tracking-[0.2em]" style={sans}>
    {/* زرار الصفحة رقم 1 */}
    <button
      onClick={() => setCurrentPage(1)}
      className={`transition-all duration-300 pb-0.5 relative cursor-pointer min-w-[15px] text-center ${
        currentPage === 1 
          ? "text-primary font-semibold" 
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span>1</span>
      {currentPage === 1 && (
        <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary animate-fade-in" />
      )}
    </button>

    <span className="text-muted-foreground/30 font-light">/</span>

    {/* زرار الصفحة رقم 2 - Clickable وجاهز */}
    <button
      onClick={() => setCurrentPage(2)}
      disabled={products.length <= 4} // لو الداتابيز فيها 4 منتجات أو أقل، الزرار هيقفل ومش هيبقى clickable
      className={`transition-all duration-300 pb-0.5 relative cursor-pointer min-w-[15px] text-center disabled:opacity-20 disabled:pointer-events-none ${
        currentPage === 2 
          ? "text-primary font-semibold" 
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span>2</span>
      {currentPage === 2 && (
        <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary animate-fade-in" />
      )}
    </button>
  </div>

  {/* سهم الصفحة التالية */}
  <button
    onClick={() => setCurrentPage(2)}
    disabled={currentPage === 2 || products.length <= 4}
    className="flex items-center gap-1.5 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
  >
    <span className="hidden sm:inline">Next</span>
    <ChevronRight size={14} />
  </button>

</div>
          </>
        )}

        {/* Bottom Callout Assurance Banner */}
        <div className="mt-24 border-t border-b border-border/60 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-xs tracking-[0.15em] uppercase text-muted-foreground font-light">
          <div className="space-y-1">
            <p className="text-foreground font-medium">Complimentary Shipping</p>
            <p className="text-[10px] lowercase text-muted-foreground/70 tracking-normal italic">on all orders within the network</p>
          </div>
          <div className="space-y-1 border-y md:border-y-0 md:border-x border-border/40 py-4 md:py-0">
            <p className="text-foreground font-medium">Signature Packaging</p>
            <p className="text-[10px] lowercase text-muted-foreground/70 tracking-normal italic">housed in premium keepsake boxes</p>
          </div>
          <div className="space-y-1">
            <p className="text-foreground font-medium">Curated Samples</p>
            <p className="text-[10px] lowercase text-muted-foreground/70 tracking-normal italic">two complimentary extras selected with every order</p>
          </div>
        </div>

      </div>
    </div>
  );
}