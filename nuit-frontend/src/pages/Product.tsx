import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Minus, Plus, Link2, Check } from "lucide-react";
import { useCartStore } from "../store/cartStore";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);
  const { products, loading, error, wishlisted, fetchProducts, addToCart, toggleWish } = useCartStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const product = products.find((p) => p.id === Number(id));

  // Reset quantity when ID changes
  useEffect(() => {
    setQty(1);
  }, [id]);

  // دالة نسخ رابط المنتج الحالي
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 px-8 lg:px-20 min-h-screen flex items-center justify-center" style={serif}>
        <div className="animate-pulse flex flex-col items-center gap-4 w-full max-w-lg">
          <div className="bg-secondary h-96 w-full rounded" />
          <div className="h-6 bg-secondary w-3/4 rounded" />
          <div className="h-4 bg-secondary w-1/2 rounded" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pt-32 px-8 lg:px-20 min-h-screen flex flex-col items-center justify-center text-center" style={serif}>
        <p className="text-muted-foreground text-sm font-light mb-6">
          {error || "Fragrance not found."}
        </p>
        <button
          onClick={() => navigate("/shop")}
          className="text-[10px] tracking-[0.25em] uppercase text-foreground border border-border px-8 py-3 hover:border-primary hover:text-primary transition-all cursor-pointer"
        >
          Back to Collection
        </button>
      </div>
    );
  }

  const isWish = wishlisted.includes(product.id);
  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 4);

  // إعداد نصوص وروابط السوشيال ميديا
  const shareUrl = window.location.href;
  const shareText = `Discover ${product.name} from Nuit Luxury Fragrances.`;
  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    x: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
  };

  // 🌟 تشيك هل المنتج خلصان من المخزون تماماً
  const isOutOfStock = product.stock === undefined || Number(product.stock) <= 0;

  return (
    <div className="pt-28" style={serif}>
      <div className="px-8 lg:px-20 mb-8">
        <button
          onClick={() => navigate("/shop")}
          className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 cursor-pointer"
        >
          ← Back to Collection
        </button>
      </div>

      <div className="px-8 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 pb-28">
        {/* Image */}
        <div className="relative">
          <div className="aspect-[4/5] bg-secondary overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          
          {/* 🌟 شارة راقية تظهر على الصورة لو المنتج خلصان */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-[#0c0c0c]/90 text-white/90 border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.3em] font-light">
                Sold Out
              </span>
            </div>
          )}

          <div className="absolute top-6 left-6 flex flex-col gap-2">
            {product.notes?.slice(0, 3).map((note) => (
              <span key={note} className="text-[8px] tracking-widest uppercase bg-background/80 backdrop-blur-sm text-muted-foreground px-2.5 py-1 border border-border">
                {note}
              </span>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center lg:py-8">
          <p className="text-[11px] tracking-[0.45em] uppercase text-primary mb-4">
            {product.category} · {product.size} 
          </p>
          <h1 className="text-5xl lg:text-6xl font-light text-foreground mb-2" style={serif}>
            {product.name}
          </h1>
          <p className="text-muted-foreground italic mb-8 text-lg font-light" style={serif}>
            {product.tagline}
          </p>
          <p className="text-foreground/75 leading-relaxed mb-10 text-sm font-light" style={serif}>
            {product.description}
          </p>

          {/* Fragrance Pyramid */}
          <div className="mb-10">
            <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-4">Fragrance Pyramid</p>
            <div className="space-y-2">
              {[
                { label: "Top",      note: product.notes?.[0] },
                { label: "Heart",    note: product.notes?.[1] },
                { label: "Base",     note: product.notes?.[2] },
                ...(product.notes?.[3] ? [{ label: "Dry-down", note: product.notes[3] }] : []),
              ].map(({ label, note }) => (
                <div key={label} className="flex items-center gap-4">
                  <span className="text-[11px] tracking-widest uppercase text-muted-foreground w-16">{label}</span>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-foreground/80">{note || "Not specified"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-8 mb-6">
            <div className="flex items-baseline justify-between mb-6">
              <p className="text-3xl font-light text-foreground" style={sans}>
                EGP {product.price}
              </p>
              <p className="text-[10px] text-muted-foreground tracking-wider">
                {product.size} Eau de Parfum
              </p>
            </div>

            {/* Qty */}
            <div className="flex items-center gap-5 mb-6">
              <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Qty</p>
              <div className="flex items-center border border-border">
                <button
                  // 🌟 منع تقليل الكمية تحت 1، وقفل الزرار لو خلصان
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={isOutOfStock}
                  className="px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-30"
                >
                  <Minus size={11} />
                </button>
                
                {/* 🌟 عرض صفر لو خلصان، غير كده يعرض الكمية الحالية */}
                <span className="px-5 text-sm text-foreground">
                  {isOutOfStock ? 0 : qty}
                </span>
                
                <button
                  // 🌟 تزويد الكمية بشرط متعديش كمية المخزون الفعلي المتاحة
                  onClick={() => setQty(prev => (product.stock && prev >= product.stock) ? prev : prev + 1)}
                  disabled={isOutOfStock || (product.stock !== undefined && qty >= product.stock)}
                  className="px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-30"
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              {/* 🌟 التحكم في شكل وحالة زرار الإضافة على حسب المخزون */}
              {isOutOfStock ? (
                <button
                  disabled
                  className="flex-1 bg-zinc-800 text-zinc-500 border border-zinc-700/30 text-[10px] tracking-[0.25em] uppercase py-4 cursor-not-allowed"
                >
                  Sold Out · نفد من المخزون
                </button>
              ) : (
                <button
                  onClick={() => {
                    addToCart(product, qty);
                    navigate("/cart");
                    window.scrollTo(0, 0);
                  }}
                  className="flex-1 bg-primary text-primary-foreground text-[10px] tracking-[0.25em] uppercase py-4 hover:bg-primary/85 transition-colors cursor-pointer"
                >
                  Add to Cart 
                </button>
              )}

              <button
                onClick={() => toggleWish(product.id)}
                className={`border px-4 py-4 transition-colors cursor-pointer ${
                  isWish ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                <Heart size={15} fill={isWish ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground leading-relaxed font-light mb-6">
            Each bottle is carefully packed in our signature packaging to ensure safe delivery. Includes a product care card and complimentary perfume samples with every order.
          </p>

          {/* ─── ميزة الـ Share والمشاركة المضافة ─── */}
          <div className="border-t border-border/30 pt-5 flex flex-wrap items-center gap-4 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-light">
            <span>Share This Creation:</span>
            
            <div className="flex items-center gap-3.5">
              {/* Facebook */}
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors p-1"
                title="Share on Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
              </a>

              {/* X (Twitter) */}
              <a
                href={shareLinks.x}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors p-1"
                title="Share on X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* Whatsapp */}
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors p-1"
                title="Share on WhatsApp"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>

              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer p-1"
                title="Copy Link"
              >
                {copied ? (
                  <>
                    <Check size={11} className="text-emerald-600" />
                    <span className="text-[9px] text-emerald-600 normal-case tracking-normal font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 size={11} />
                    <span className="text-[9px] normal-case tracking-normal">Copy link</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-secondary border-t border-border px-8 lg:px-20 py-20">
          <h2 className="text-2xl font-light text-foreground mb-12" style={serif}>You may also like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                className="group cursor-pointer"
                onClick={() => {
                  navigate(`/product/${p.id}`);
                  window.scrollTo(0, 0);
                }}
              >
                <div className="aspect-[3/4] bg-background overflow-hidden mb-4">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <p className="text-sm text-foreground font-light" style={serif}>{p.name}</p>
                <p className="text-base font-light tracking-wider text-foreground" style={sans}>
                  EGP {p.price}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}