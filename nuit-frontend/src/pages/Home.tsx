import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart } from "lucide-react";
import { useCartStore } from "../store/cartStore";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function Home() {
  const navigate = useNavigate();
  const { products, loading, error, wishlisted, fetchProducts, toggleWish } = useCartStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const signatureProduct = products.find((p) => p.featured) ?? products[0];

  return (
    <div style={sans}>
      {/* Hero */}
      <section className="relative h-screen flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-secondary"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=1800&h=1200&fit=crop&auto=format)`,
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/10" />
        <div className="relative z-10 px-8 lg:px-20 pb-24 max-w-4xl">
          <p className="text-[10px] tracking-[0.5em] uppercase text-primary mb-7">
            Maison de Parfum · Paris
          </p>
          <h1 className="text-6xl lg:text-8xl font-light text-foreground leading-[1.05] mb-8" style={serif}>
            The art of<br />
            <em className="text-primary/90">luxury in every bottle</em>
          </h1>
          <p className="text-muted-foreground max-w-sm mb-10 leading-relaxed text-sm font-light">
            A curated collection of premium fragrances crafted for every occasion. Experience long-lasting elegance that defines your presence.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="group flex items-center gap-4 text-[11px] tracking-[0.25em] uppercase text-foreground border border-border px-9 py-4 hover:border-primary hover:text-primary transition-all duration-300 cursor-pointer"
          >
            Discover the Collection
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Featured / Recent Added */}
      <section className="px-8 lg:px-20 py-28">
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-[11px] tracking-[0.4em] uppercase text-primary mb-3">New Arrivals</p>
            <h2 className="text-4xl lg:text-5xl font-light text-foreground" style={serif}>Just composed</h2>
          </div>
          <button
            onClick={() => navigate("/shop")}
            className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mb-1 cursor-pointer"
          >
            View All <ArrowRight size={11} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-secondary aspect-[3/4] rounded-sm" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-sm text-destructive py-20">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...products]
              .sort((a, b) => b.id - a.id)
              .slice(0, 3)
              .map((product, i) => {
                const isWish = wishlisted.includes(product.id);
                return (
                  <div
                    key={product.id}
                    className={`group cursor-pointer ${i === 1 ? "md:mt-14" : ""}`}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="relative overflow-hidden bg-secondary aspect-[3/4] mb-5">
                      <img 
                        src={product.image} 
                        alt={product.name} 
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
                    <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-1">{product.category}</p>
                    <h3 className="text-xl text-foreground font-light mb-1" style={serif}>{product.name}</h3>
                    <p className="text-xs text-muted-foreground italic mb-3">{product.tagline}</p>
                    <p className="text-base font-light tracking-wider text-foreground" style={serif}>
                     EGP {product.price} 
                    </p>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* Signature banner */}
      {!loading && !error && signatureProduct && (
        <section className="mx-8 lg:mx-20 mb-28">
          <div className="bg-secondary border border-border p-12 lg:p-20 flex flex-col lg:flex-row items-center gap-14">
            <div className="flex-1 order-2 lg:order-1">
              <p className="text-[11px] tracking-[0.5em] uppercase text-primary mb-5">Signature Accord</p>
              <h2 className="text-4xl lg:text-5xl font-light text-foreground mb-6 leading-tight" style={serif}>
                {signatureProduct.name} <br /><em>{signatureProduct.tagline}</em>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed text-sm max-w-md font-light">
                {signatureProduct.description}
              </p>
              <button
                onClick={() => navigate(`/product/${signatureProduct.id}`)}
                className="group flex items-center gap-4 text-[11px] tracking-[0.25em] uppercase text-primary border border-primary px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-all duration-300 cursor-pointer"
              >
                Discover
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="w-60 h-72 bg-background overflow-hidden flex-shrink-0 order-1 lg:order-2">
              <img src={signatureProduct.image} alt={signatureProduct.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section className="px-8 lg:px-20 py-28 border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <p className="text-[11px] tracking-[0.5em] uppercase text-primary mb-6">The Maison</p>
            <h2 className="text-4xl lg:text-5xl font-light text-foreground mb-8 leading-tight" style={serif}>
              The art of fine fragrance<br /><em>crafted for every moment</em>
            </h2>
            <p className="text-muted-foreground mb-5 leading-relaxed text-sm font-light">
              Nuit was founded on the philosophy that a fragrance is more than just a scent—it is an invisible signature. Every bottle in our collection is meticulously blended to evoke emotions, inspire confidence, and complement your unique character throughout the day.
            </p>
            <p className="text-muted-foreground mb-10 leading-relaxed text-sm font-light">
              We source exceptional raw ingredients and premium oils to create balanced, long-lasting compositions. From vibrant fresh notes to deep, warm undertones, our perfumes are designed to evolve beautifully on your skin.
            </p>
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
              {[["+50","UNIQUE SCENTS"],["24h","Longevity"],["100%","PREMIUM QUALITY"]].map(([num, label]) => (
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
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Est.</p>
              <p className="text-3xl text-foreground font-light" style={serif}>2020</p>
            </div>
          </div>
        </div>
      </section>

      {/* Notes strip — Seamless Infinite Scroll */}
      <section className="border-t border-b border-border py-0 bg-background overflow-hidden relative select-none" style={{ height: "48px" }}>
        <style>{`
          @keyframes notes-ticker {
            from { transform: translateX(0%); }
            to   { transform: translateX(-50%); }
          }
          .notes-track {
            display: flex;
            animation: notes-ticker 22s linear infinite;
            will-change: transform;
          }
          .notes-group {
            display: flex;
            align-items: center;
            flex-shrink: 0;
            height: 48px;
            white-space: nowrap;
            /* NO min-width — content width is the source of truth */
          }
          .notes-item {
            font-size: 10px;
            letter-spacing: 0.35em;
            text-transform: uppercase;
            color: var(--muted-foreground, #9c9c8e);
            padding: 0 1.75rem;
            transition: color 0.3s;
            cursor: default;
          }
          .notes-item:hover { color: var(--primary, #8b7355); }
          .notes-sep {
            font-size: 7px;
            opacity: 0.35;
            flex-shrink: 0;
          }
        `}</style>

        {/* Edge fades */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
          background: "linear-gradient(to right, var(--background,#f8f5f1) 0%, transparent 8%, transparent 92%, var(--background,#f8f5f1) 100%)",
        }} />

        {(() => {
          // 14 notes × 3 = 42 items per group — always wider than any screen
          const baseNotes = ["Vanilla","White Musk","Bergamot","Patchouli","Lavender","Sandalwood","Jasmine","Citrus","Amber","Cedarwood","Mint","Oud","Rose","Neroli"];
          const notes = [...baseNotes, ...baseNotes, ...baseNotes];

          const Group = () => (
            <div className="notes-group">
              {notes.map((note, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center" }}>
                  <span className="notes-item">{note}</span>
                  <span className="notes-sep">◆</span>
                </span>
              ))}
            </div>
          );

          return (
            <div className="notes-track">
              <Group />  {/* group A */}
              <Group />  {/* group B — identical, translateX(-50%) snaps back seamlessly */}
            </div>
          );
        })()}
      </section>

      {/* Newsletter */}
      <section className="py-16 text-center bg-background">
        <div className="max-w-2xl mx-auto px-4">
          <span className="text-xs font-semibold tracking-[0.35em] uppercase text-primary mb-4 block">
            STAY IN THE DARK
          </span>
          
          <h2 className="text-3xl md:text-4xl font-serif text-foreground tracking-wide mb-3">
            Receive exclusive releases
          </h2>
          
          <p className="text-base font-normal text-foreground/70 max-w-md mx-auto mb-8 leading-relaxed">
            New compositions, limited editions, and invitations to private events.
          </p>
          
          <form 
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row max-w-md mx-auto items-stretch justify-center gap-0 border border-border/60 bg-white shadow-sm overflow-hidden rounded-sm"
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-5 py-3.5 text-base bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none flex-grow"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-8 py-3.5 text-sm font-medium tracking-widest uppercase hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
