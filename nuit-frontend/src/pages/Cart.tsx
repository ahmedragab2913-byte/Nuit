import { useNavigate } from "react-router-dom";
import { ShoppingBag, Minus, Plus, Trash2, MapPin } from "lucide-react";
import { useCartStore } from "../store/cartStore";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQty } = useCartStore();

  // 🧮 حساب إجمالي المنتجات فقط بشكل نظيف
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <div className="pt-28 px-8 lg:px-20 pb-24 min-h-screen bg-background text-foreground" style={sans}>
      <div className="mb-12">
        <p className="text-[11px] tracking-[0.45em] uppercase text-primary mb-3">Your Selection</p>
        <h1 className="text-5xl font-light text-foreground" style={serif}>Shopping Bag</h1>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <ShoppingBag size={36} className="text-muted-foreground mb-6" />
          <p className="text-muted-foreground mb-8 text-sm font-light">Your bag is empty</p>
          <button
            onClick={() => navigate("/shop")}
            className="text-[10px] tracking-[0.25em] uppercase text-foreground border border-border px-10 py-4 hover:border-primary hover:text-primary transition-all cursor-pointer"
          >
            Discover the Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Items List */}
          <div className="lg:col-span-2">
            {cart.map((item, i) => (
              <div key={item.product.id} className={`flex gap-6 py-8 ${i < cart.length - 1 ? "border-b border-border" : ""}`}>
                <div 
                  className="w-24 h-32 bg-secondary overflow-hidden flex-shrink-0 cursor-pointer border border-border/40" 
                  onClick={() => navigate(`/product/${item.product.id}`)}
                >
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="text-lg font-light text-foreground mb-0.5" style={serif}>{item.product.name}</h3>
                      <p className="text-xs text-muted-foreground italic mb-1">{item.product.tagline}</p>
                      <p className="text-[11px] tracking-widest uppercase text-primary font-medium">{item.product.size} EDP</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product.id)} 
                      className="text-muted-foreground hover:text-foreground transition-colors mt-1 cursor-pointer"
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
                    <p className="text-sm text-foreground/90 font-medium" style={sans}>
                      EGP {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Box */}
          <div className="lg:col-span-1">
            <div className="bg-secondary/50 border border-border p-8 sticky top-28 backdrop-blur-sm">
              <h3 className="text-xl font-light text-foreground mb-8" style={serif}>Order Summary</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-light">Subtotal</span>
                  <span className="text-foreground font-medium" style={sans}>EGP {cartTotal.toLocaleString()}</span>
                </div>
                
                {/* 🚚 عزل منطق الحسابات الثابتة لتجنب الاختلاف مع صفحة الـ Checkout */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-light">Shipping</span>
                  <span className="text-amber-500/90 text-[10px] tracking-wider font-normal normal-case">
                    Calculated at checkout
                  </span>
                </div>
              </div>

              {/* إشعار ذكي يوضح للعميل إن الشحن هيتحسب بناءً على عنوانه */}
              <div className="mb-6 bg-secondary/80 border border-border/60 p-3 rounded-sm flex items-start gap-2.5">
                <MapPin size={13} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-muted-foreground leading-relaxed font-light">
                  Shipping rates vary by city and will be calculated dynamically once you select your delivery address.
                </p>
              </div>
              
              <div className="border-t border-border pt-5 mb-8">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-foreground font-light">Estimated Total</span>
                  <span className="text-2xl font-light text-foreground tracking-wide" style={sans}>
                    EGP {cartTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* <div className="flex mb-6">
                <input 
                  type="text" 
                  placeholder="Promo code" 
                  className="flex-1 bg-background border border-border border-r-0 px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors" 
                />
                <button className="border border-border bg-background px-5 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer">
                  Apply
                </button>
              </div> */}

              <button 
                onClick={() => navigate("/checkout")}
                className="w-full bg-primary text-primary-foreground text-[10px] tracking-[0.25em] uppercase py-4 hover:bg-primary/90 transition-colors mb-3 font-medium shadow-sm cursor-pointer"
              >
                Proceed to Checkout
              </button>
              <button 
                onClick={() => navigate("/shop")} 
                className="w-full border border-border bg-background/50 text-[10px] tracking-[0.22em] uppercase py-4 text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
              
              <div className="mt-8 pt-6 border-t border-border space-y-2">
                {["Secure SSL checkout", "Free returns within 14 days", "Signature gift packaging included"].map(s => (
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