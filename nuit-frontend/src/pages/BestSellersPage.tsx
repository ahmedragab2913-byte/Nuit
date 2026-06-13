import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBestSellers } from "../services/api";
import { ShoppingBag, Eye, Sparkles } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import type { Product } from "../types";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function BestSellers() {
  const navigate = useNavigate();
  const { addToCart } = useCartStore();

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
      setError("Failed to load our best-selling collections. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchBestSellersData(currentPage);
  }, [currentPage]);

  return (
    <div className="bg-background text-foreground min-h-screen pt-32 pb-24 px-6 lg:px-16" style={sans}>
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary/80 text-xs tracking-[0.3em] uppercase">
            <Sparkles size={12} className="animate-pulse" />
            <span>Maison Favorites</span>
          </div>
          <h1 className="text-3xl md:text-5xl tracking-[0.25em] uppercase font-light text-foreground" style={serif}>
            Best Sellers
          </h1>
          <div className="w-12 h-[1px] bg-primary/60 mx-auto"></div>
          <p className="text-muted-foreground text-sm font-light max-w-xl mx-auto leading-relaxed">
            Explore our most coveted olfactive creations. Highly acclaimed extraits de parfum, celebrated worldwide and curated for true connoisseurs.
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
              className="text-[10px] tracking-[0.25em] uppercase text-foreground border border-border px-8 py-3 hover:border-primary hover:text-primary transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {products.map((product) => (
                <div key={product.id} className="group relative flex flex-col" onMouseEnter={() => setHoveredId(product.id)} onMouseLeave={() => setHoveredId(null)}>
                  <div className="relative aspect-[3/4] w-full bg-secondary overflow-hidden border border-border/40 mb-5">
                    <span className="absolute top-3 left-3 z-10 text-[9px] font-medium tracking-[0.15em] uppercase bg-background/90 text-foreground px-2.5 py-1 backdrop-blur-sm border border-border/30">Best Seller</span>
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                    
                    <div className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 flex flex-col items-center justify-center gap-3 z-20 ${hoveredId === product.id ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                      <button onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }} className="w-44 bg-background text-foreground text-xs tracking-[0.15em] uppercase font-medium py-3 hover:bg-foreground hover:text-background transition-colors duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                        <ShoppingBag size={13} /> Add to Bag
                      </button>
                      <button onClick={() => navigate(`/product/${product.id}`)} className="w-44 bg-transparent border border-white/60 text-white text-xs tracking-[0.15em] uppercase font-medium py-3 hover:bg-white/10 transition-colors duration-300 flex items-center justify-center gap-2 backdrop-blur-sm cursor-pointer">
                        <Eye size={13} /> View Details
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col flex-grow text-center cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">{product.category || "Maison Collection"}</span>
                    <h3 className="text-base tracking-[0.05em] text-foreground font-light mb-1" style={serif}>{product.name}</h3>
                    <span className="text-sm font-medium text-foreground mt-auto" style={sans}>EGP {product.price?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination الموحد */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 mt-20 border-t border-border/40 pt-10">
                <div className="flex items-center gap-6">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer">‹ Prev</button>
                  
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

                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer">Next ›</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}