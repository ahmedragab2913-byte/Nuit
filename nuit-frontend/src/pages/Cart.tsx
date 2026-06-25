import { useNavigate } from "react-router-dom";
import { ShoppingBag, Minus, Plus, Trash2, MapPin } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useLanguageStore, getBilingualValue, formatPrice } from "../store/languageStore";
import { getProductImage } from "../services/api";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQty } = useCartStore();
  const { language, t } = useLanguageStore();

  // 🧮 حساب إجمالي المنتجات فقط بشكل نظيف
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <div className="pt-28 px-8 lg:px-20 pb-24 min-h-screen bg-background text-foreground text-left rtl:text-right" style={sans}>
      <div className="mb-12">
        <p className="text-[11px] tracking-[0.45em] uppercase text-primary mb-3">
          {language === "ar" ? "اختيارك" : "Your Selection"}
        </p>
        <h1 className="text-5xl font-light text-foreground" style={serif}>
          {t("cartTitle")}
        </h1>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <ShoppingBag size={36} className="text-muted-foreground mb-6" />
          <p className="text-muted-foreground mb-8 text-sm font-light">{t("cartEmpty")}</p>
          <button
            onClick={() => navigate("/shop")}
            className="text-[10px] tracking-[0.25em] uppercase text-foreground border border-border px-10 py-4 hover:border-primary hover:text-primary transition-all cursor-pointer font-semibold"
          >
            {t("discoverCollection")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Items List */}
          <div className="lg:col-span-2">
            {cart.map((item, i) => {
              const pName = getBilingualValue(item.product.name, item.product.name_ar, language);
              return (
                <div key={item.product.id} className={`flex gap-6 py-8 ${i < cart.length - 1 ? "border-b border-border" : ""}`}>
                  <div 
                    className="w-24 h-32 bg-secondary overflow-hidden flex-shrink-0 cursor-pointer border border-border/40" 
                    onClick={() => navigate(`/product/${item.product.id}`)}
                  >
                    <img src={getProductImage(item.product.image)} alt={pName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1 gap-4">
                      <div>
                        <h3 className="text-lg font-light text-foreground mb-0.5" style={serif}>{pName}</h3>
                        <p className="text-xs text-muted-foreground italic mb-1">{item.product.tagline}</p>
                        <p className="text-[11px] tracking-widest uppercase text-primary font-medium">{item.product.size} EDP</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product.id)} 
                        className="text-muted-foreground hover:text-foreground transition-colors mt-1 cursor-pointer flex-shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-5">
                      <div className="flex items-center border border-border bg-background">
                        <button 
                          onClick={() => updateQty(item.product.id, item.quantity - 1)} 
                          disabled={item.quantity <= 1}
                          className="px-3 py-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="px-3 text-xs text-foreground font-medium min-w-[20px] text-center" style={sans}>
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQty(item.product.id, item.quantity + 1)} 
                          className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <p className="text-l tracking-[0.16em] uppercase font-medium lining-nums"
                              style={{ fontFamily: "'Playfair Display', serif", color: "#c4a76b" }}>
                        {formatPrice(item.product.price * item.quantity, language)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Box */}
          <div className="lg:col-span-1">
            <div className="bg-secondary/50 border border-border p-8 sticky top-28 backdrop-blur-sm">
              <h3 className="text-xl font-light text-foreground mb-8" style={serif}>{t("orderSummary")}</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-light">{t("subtotal")}</span>
                  <span className="text-l tracking-[0.16em] uppercase font-medium lining-nums" style={{ ...serif, color: "#c4a76b" }}>{formatPrice(cartTotal, language)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-light">{t("shipping")}</span>
                  <span className="text-amber-500/90 text-[10px] tracking-wider font-normal normal-case">
                    {language === "ar" ? "يُحسب عند الدفع" : "Calculated at checkout"}
                  </span>
                </div>
              </div>

              {/* إشعار الشحن بالتفصيل */}
              <div className="mb-6 bg-secondary/80 border border-border/60 p-3 rounded-sm flex items-start gap-2.5">
                <MapPin size={13} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-muted-foreground leading-relaxed font-light">
                  {language === "ar" 
                    ? "تختلف أسعار الشحن حسب المدينة وسيتم حسابها ديناميكياً بمجرد اختيار عنوان التوصيل."
                    : "Shipping rates vary by city and will be calculated dynamically once you select your delivery address."
                  }
                </p>
              </div>
              
              <div className="border-t border-border pt-5 mb-8">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-foreground font-light">{t("estimatedTotal")}</span>
                  <span className="text-l tracking-[0.16em] uppercase font-medium lining-nums" style={{ ...serif, color: "#c4a76b" }}>
                    {formatPrice(cartTotal, language)}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => navigate("/checkout")}
                className="w-full bg-primary text-primary-foreground text-[10px] tracking-[0.25em] uppercase py-4 hover:bg-primary/90 transition-colors mb-3 font-medium shadow-sm cursor-pointer"
              >
                {t("checkout")}
              </button>
              <button 
                onClick={() => navigate("/shop")} 
                className="w-full border border-border bg-background/50 text-[10px] tracking-[0.22em] uppercase py-4 text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors cursor-pointer"
              >
                {t("continueShopping")}
              </button>
              
              <div className="mt-8 pt-6 border-t border-border space-y-2">
                {[
                  language === "ar" ? "دفع آمن ومحمي SSL" : "Secure SSL checkout",
                  language === "ar" ? "إرجاع مجاني خلال 14 يوماً" : "Free returns within 14 days",
                  language === "ar" ? "تغليف هدايا مميز متضمن مع الطلب" : "Signature gift packaging included"
                ].map(s => (
                  <p key={s} className="text-[11px] text-muted-foreground/70 tracking-wide font-light flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40 inline-block"></span>
                    {s}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}