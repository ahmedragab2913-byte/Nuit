import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Search, X } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useLanguageStore, getBilingualValue, formatPrice } from "../store/languageStore";
import { getProductImage } from "../services/api";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function Home() {
  const navigate = useNavigate();
  const { products, loading, error, wishlisted, fetchProducts, toggleWish } = useCartStore();
  const { language, t } = useLanguageStore();
  
  // تفعيل حالة البحث الفوري
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts(true);
  }, [fetchProducts]);
  
  // البحث في الـ tagline أو الوصف عن كلمة best seller بشكل مرن لتجنب مشاكل الـ Types
  const bestSellerProduct = products.find(
    (p) => p.tagline?.toLowerCase().includes("best") || p.description?.toLowerCase().includes("best")
  );

  // معالجة البحث عند الضغط على Enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div style={sans} className="bg-background min-h-screen text-foreground overflow-x-hidden">
      
      {/* Search Bar Floating Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-background/95 z-[70] flex flex-col items-center justify-center p-6 backdrop-blur-sm transition-all duration-300">
          <button 
            onClick={() => setIsSearchOpen(false)} 
            className="absolute top-8 right-8 text-muted-foreground hover:text-primary transition-colors cursor-pointer focus:outline-none"
          >
            <X size={24} />
          </button>
          <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl border-b border-border/60 py-4 flex items-center gap-4">
            <Search size={22} className="text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t("searchPlaceholder")} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full bg-transparent text-2xl font-light text-foreground focus:outline-none placeholder:text-muted-foreground/35"
              style={serif}
            />
          </form>
        </div>
      )}

      {/* Hero */}
      <section className="relative h-[85vh] flex items-center justify-center bg-black overflow-hidden select-none">
        {/* Background Image with luxury soft dark mask */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=2000" 
            alt="Luxury perfume bottle background" 
            className="w-full h-full object-cover opacity-80"
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl space-y-6">
          <p className="text-[11px] tracking-[0.45em] uppercase text-primary font-medium">{t("maisonParis")}</p>
          <h1 className="text-5xl md:text-7xl font-extralight text-white leading-[1.1] md:leading-[1.15]" style={serif}>
            {language === "ar" ? "فن الفخامة في زجاجة" : t("artOfLuxury")}
          </h1>
          <p className="text-sm md:text-base text-zinc-300 font-light max-w-xl mx-auto leading-relaxed">
            {t("heroDesc")}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate("/shop")}
              className="bg-primary text-primary-foreground text-xs tracking-[0.2em] uppercase font-semibold px-8 py-4.5 hover:bg-primary/95 transition-all w-56 cursor-pointer"
            >
              {t("discoverCollection")}
            </button>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="bg-transparent border border-white/20 hover:border-white/50 text-white text-xs tracking-[0.25em] uppercase font-semibold px-8 py-4.5 transition-all w-56 cursor-pointer flex items-center justify-center gap-2"
            >
              <Search size={13} /> {t("searchPlaceholder").slice(0, 12)}...
            </button>
          </div>
        </div>
      </section>

      {/* New Compositions */}
      <section className="px-8 lg:px-20 py-28 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-baseline mb-16 gap-4">
          <div>
            {/* <p className="text-[15px] tracking-[0.5em] uppercase text-primary mb-3">{t("justComposed")}</p> */}
            <h2 className="text-4xl font-light text-foreground" style={serif}>
              {language === "ar" ? "وصل حديثاً" : "New Releases"}
            </h2>
          </div>
          <button 
            onClick={() => navigate("/new-arrivals")}
            className="group flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-primary font-semibold hover:text-primary/80 transition-colors cursor-pointer"
          >
            {t("viewAll")} 
            <ArrowRight size={13} className={`group-hover:translate-x-1 transition-transform ${language === "ar" ? "rotate-180" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col">
                <div className="bg-secondary aspect-[3/4] mb-5" />
                <div className="h-3 bg-secondary w-1/3 mb-2 rounded-sm" />
                <div className="h-4 bg-secondary w-2/3 mb-2 rounded-sm" />
                <div className="h-3 bg-secondary w-1/4 rounded-sm" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-sm text-muted-foreground">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[...products]
              .sort((a, b) => b.id - a.id)
              .slice(0, 4)
              .map((product) => {
                const isWish = wishlisted.includes(product.id);
                const pName = getBilingualValue(product.name, product.name_ar, language);
                const pCategory = language === "ar" && (t("categoryMap") as any)?.[product.category] 
                  ? (t("categoryMap") as any)[product.category] 
                      : product.category;
                return (
                  <div
                    key={product.id}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="relative overflow-hidden bg-secondary aspect-[3/4] mb-5">
                      <img 
                        src={getProductImage(product.image)} 
                        alt={pName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                      <button
                        className={`absolute top-4 right-4 transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer ${
                          isWish ? "text-primary" : "text-foreground/50 hover:text-primary"
                        }`}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          toggleWish(product.id); 
                        }}
                      >
                        <Heart size={15} fill={isWish ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-1">{pCategory}</p>
                    <h3 className="text-xl text-foreground font-light mb-1" style={serif}>{pName}</h3>
                    <p className="text-xs text-muted-foreground italic mb-3">{product.tagline}</p>
                    
                    <p className="text-l tracking-[0.16em] uppercase font-medium lining-nums"
                              style={{ fontFamily: "'Playfair Display', serif", color: "#c4a76b" }}>
                      {formatPrice(product.price, language)}
                    </p>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* Signature banner - Best Seller Setup */}
      {!loading && !error && bestSellerProduct && (
        <section className="mx-8 lg:mx-20 mb-28">
          <div className="bg-secondary border border-border p-12 lg:p-20 flex flex-col lg:flex-row items-center gap-14">
            <div className="flex-1 order-2 lg:order-1">
              <p className="text-[15px] tracking-normal  tracking-widest uppercase text-primary mb-5">{t("bestSellerAccord")}</p>
              <h2 className="text-4xl lg:text-5xl font-light text-foreground mb-6 leading-tight" style={serif}>
                {getBilingualValue(bestSellerProduct.name, bestSellerProduct.name_ar, language)} <br />
                <em>{bestSellerProduct.tagline}</em>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed text-sm max-w-md font-light">
                {getBilingualValue(bestSellerProduct.description, bestSellerProduct.description_ar, language)}
              </p>
              <button
                onClick={() => navigate(`/product/${bestSellerProduct.id}`)}
                className="group flex items-center gap-4 text-[15px] tracking-[0.25em] uppercase text-primary border border-primary px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-all duration-300 cursor-pointer"
              >
                {t("discoverBestSeller")}
                <ArrowRight size={13} className={`group-hover:translate-x-1 transition-transform ${language === "ar" ? "rotate-180" : ""}`} />
              </button>
            </div>
            <div className="w-60 h-72 bg-background overflow-hidden flex-shrink-0 order-1 lg:order-2">
              <img 
                src={getProductImage(bestSellerProduct.image)} 
                alt={getBilingualValue(bestSellerProduct.name, bestSellerProduct.name_ar, language)} 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section className="px-8 lg:px-20 py-28 border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <p className="text-[15px] tracking-[0.5em] uppercase text-primary mb-6">{t("theMaison")}</p>
            <h2 className="text-4xl lg:text-5xl font-light text-foreground mb-8 leading-tight" style={serif}>
              {language === "ar" ? (
                <>
                  فن العطور الراقية <br />
                  <span className="text-primary/90 font-medium">المصممة لكل لحظة</span>
                </>
              ) : (
                <>
                  The art of fine fragrance<br />
                  <em className="text-primary/90 font-medium">crafted for every moment</em>
                </>
              )}
            </h2>
            <p className="text-muted-foreground mb-5 leading-relaxed text-sm font-light">
              {t("aboutDesc1")}
            </p>
            <p className="text-muted-foreground mb-10 leading-relaxed text-sm font-light">
              {t("aboutDesc2")}
            </p>
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border lining-nums">
              {[
                ["+50", t("uniqueScents")],
                ["24h", t("longevity")],
                ["100%", t("premiumQuality")]
              ].map(([num, label]) => (
                <div key={label}>
                  <p className="text-3xl font-light text-primary mb-1" style={serif}>{num}</p>
                  <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] bg-secondary overflow-hidden">
              <img src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1000&auto=format&fit=crop&q=80" alt="Perfumer at work" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 w-36 h-36 border border-border bg-background flex flex-col items-center justify-center">
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-1">{t("est")}</p>
              <p className="text-3xl text-foreground font-light" style={serif}>2020</p>
            </div>
          </div>
        </div>
      </section>

      {/* Notes strip — Seamless Infinite Scroll */}
<section className="border-t border-b border-border py-0 bg-background overflow-hidden relative select-none" style={{ height: "48px" }}>
  <style>{`
    @keyframes notes-ticker {
      /* الحركة القياسية الضامنة لعدم حدوث أي قفزة أو تعليق نهائياً */
      from { transform: translate3d(0, 0, 0); }
      to   { transform: translate3d(-50%, 0, 0); }
    }
    
    .notes-container {
      width: 100%;
      height: 48px;
      position: relative;
      direction: ltr; /* إجبار الاتجاه العام على ltr لحساب مسار الأنميشن بدقة */
      overflow: hidden;
    }

    .notes-track {
      display: inline-flex;
      width: max-content;
      animation: notes-ticker 60s linear infinite; /* نفس السرعة الراقية المطلوبة */
      will-change: transform;
      /* قلب اتجاه الحركة بصرياً لتخرج العناصر من اليمين وتختفي في أقصى الشمال */
      flex-direction: row-reverse; 
    }
    
    .notes-group {
      display: flex;
      align-items: center;
      white-space: nowrap;
      flex-shrink: 0;
    }
    
    .notes-item-wrapper {
      display: flex;
      align-items: center;
    }

    .notes-item {
      display: inline-flex;
      align-items: center;
      font-size: 10px;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: var(--muted-foreground, #9c9c8e);
      padding: 0 1.75rem;
      transition: color 0.3s;
      cursor: default;
      font-family: 'Raleway', 'Cairo', sans-serif;
    }
    
    .notes-item:hover { 
      color: var(--primary, #8b7355); 
    }
    
    .notes-sep {
      font-size: 7px;
      opacity: 0.35;
      flex-shrink: 0;
      color: var(--muted-foreground, #9c9c8e);
    }

    /* حماية النصوص العربية لتقرأ من اليمين لليسار بشكل طبيعي أثناء الدوران */
    .arabic-note {
      direction: rtl;
      unicode-bidi: isolate;
    }
  `}</style>

  {/* التظليل الجانبي المتناسق مع خلفية الموقع الثنائية أو المتغيرة */}
  <div style={{
    position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
    background: "linear-gradient(to right, var(--background,#f8f5f1) 0%, transparent 8%, transparent 92%, var(--background,#f8f5f1) 100%)",
  }} />

  <div className="notes-container">
    {(() => {
      const baseNotes = [
        t("noteVanilla"),
        t("noteWhiteMusk"),
        t("noteBergamot"),
        t("notePatchouli"),
        t("noteLavender"),
        t("noteSandalwood"),
        t("noteJasmine"),
        t("noteCitrus"),
        t("noteAmber"),
        t("noteCedarwood"),
        t("noteMint"),
        t("noteOud"),
        t("noteRose"),
        t("noteNeroli")
      ];
      
      // كررنا المصفوفة لضمان توفر عناصر كافية تملأ الشاشات الكبيرة وتمنع ظهور بياض
      const notes = [...baseNotes, ...baseNotes, ...baseNotes];

      const Group = () => (
        <div className="notes-group">
          {notes.map((note, i) => {
            const isArabic = /[\u0600-\u06FF]/.test(note);
            return (
              <div key={i} className="notes-item-wrapper">
                <span className={`notes-item ${isArabic ? "arabic-note" : ""}`}>
                  {note}
                </span>
                <span className="notes-sep">◆</span>
              </div>
            );
          })}
        </div>
      );

      return (
        <div className="notes-track">
          {/* مجموعتين متطابقتين تماماً بتلحم ورا بعضها في حلقة مفرغة */}
          <Group />
          <Group />
        </div>
      );
    })()}
  </div>
</section>

      {/* Newsletter */}
      <section className="py-16 text-center bg-background">
        <div className="max-w-2xl mx-auto px-4">
          <span className="text-xs font-semibold tracking-[0.35em] uppercase text-primary mb-4 block">
            {t("stayInDark")}
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-foreground tracking-wide mb-3" style={serif}>
            {t("receiveReleases")}
          </h2>
          <p className="text-base font-normal text-foreground/70 max-w-md mx-auto mb-8 leading-relaxed">
            {t("newsletterDesc")}
          </p>
          <form 
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row max-w-md mx-auto items-stretch justify-center gap-0 border border-border/60 bg-white shadow-sm overflow-hidden rounded-sm"
          >
            <input
              type="email"
              placeholder={t("emailPlaceholder")}
              className="w-full px-5 py-3.5 text-base bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none flex-grow"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-8 py-3.5 text-sm font-medium tracking-widest uppercase hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
            >
              {t("subscribe")}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}