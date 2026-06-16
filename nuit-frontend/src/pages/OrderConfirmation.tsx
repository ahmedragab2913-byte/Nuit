import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, ShoppingBag, Calendar, MapPin, ArrowRight } from "lucide-react";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  // استقبال الأوردر من الـ state اللي مبعوتة من الـ Checkout
  const orderData = location.state?.order;

  // لو مفيش داتا (مثلاً دخل الصفحة دايركت من الـ URL) يرجعه للرئيسية
  if (!orderData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-24" style={sans}>
        <p className="text-sm text-muted-foreground mb-4">No order details found.</p>
        <button onClick={() => navigate("/")} className="bg-foreground text-background px-6 py-2 text-xs uppercase tracking-widest font-semibold">
          Go To Home
        </button>
      </div>
    );
  }

// 1. المسميات الأساسية
  const orderId = orderData.order_id || orderData.id;
  const orderNumber = orderData.order_number || `#NU-${orderId}`;
  
  // 2. تحويل وتأمين القيم المالية بالكامل لأرقام صريحة لمنع خداع النصوص "0.00"
  const totalPrice = Number(orderData.total_price || orderData.total || orderData.grand_total || 0);
  const subtotal = Number(orderData.subtotal || 0);
  const discountAmount = Number(orderData.discount_amount || orderData.discount || 0);
  
  // قراءة مباشرة للشحن المحتمل من الباك إيند بعد تحويله لرقم صريح
  const backendShipping = Number(orderData.shipping_cost || orderData.shipping_amount || orderData.shipping_fee || 0);
  
  // 3. الحسبة الديناميكية الذكية كـ خط دفاع أخير
  const calculatedShipping = totalPrice - subtotal + discountAmount;

  // 4. لو الشحن الجاي من الباك إيند صفر، استخدم الحسبة الديناميكية فوراً
  const shippingCost = backendShipping > 0 ? backendShipping : (calculatedShipping > 0 ? calculatedShipping : 0);  
  
  // 5. بقية البيانات
  const deliveryDays = orderData.delivery_days || orderData.estimated_days || orderData.shipping_rate?.delivery_days || "3-5";
  const items = orderData.items || [];
  const shippingAddress = orderData.shipping_address;
  const promoCode = orderData.promo_code || null;
  // دالة ذكية لمعالجة وعرض العنوان بأي شكل يرجع به من الباك إيند
  const renderShippingAddress = () => {
    if (!shippingAddress) return "Your Saved Address";
    
    if (typeof shippingAddress === "object") {
      return `${shippingAddress.city || ""}, Building ${shippingAddress.building || ""}`.trim() || "Delivery Address";
    }
    
    return shippingAddress; // لو راجع كـ String جاهز من الباك إيند
  };

  return (
    <div className="pt-32 px-6 lg:px-20 pb-24 min-h-screen bg-background text-foreground" style={sans}>
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-6 animate-bounce">
          <CheckCircle2 size={36} strokeWidth={1.5} />
        </div>
        <p className="text-[11px] tracking-[0.45em] uppercase text-primary mb-3">Thank you for your order</p>
        <h1 className="text-4xl md:text-5xl font-light text-foreground mb-4" style={serif}>
          Order Confirmed
        </h1>
        <p className="text-xs text-muted-foreground max-w-md mx-auto font-light leading-relaxed">
         Welcome to the world of Nuit. Your order has been successfully received and is currently being prepared to suit your refined taste.
        </p>
      </div>

      {/* تفاصيل حالة الأوردر السريعة */}
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 border border-border/60 bg-secondary/20 p-8 rounded-sm mb-12">
        <div className="flex gap-3 items-start">
          <ShoppingBag size={16} className="text-primary mt-0.5" />
          <div>
            <h4 className="text-[10px] tracking-wider uppercase text-muted-foreground font-semibold mb-1">Order Number</h4>
            <p className="text-xs font-mono font-bold text-foreground">{orderNumber}</p>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <Calendar size={16} className="text-primary mt-0.5" />
          <div>
            <h4 className="text-[10px] tracking-wider uppercase text-muted-foreground font-semibold mb-1">Delivery Estimate</h4>
            <p className="text-xs text-foreground font-medium">{deliveryDays} Days</p>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <MapPin size={16} className="text-primary mt-0.5" />
          <div>
            <h4 className="text-[10px] tracking-wider uppercase text-muted-foreground font-semibold mb-1">Shipping To</h4>
            <p className="text-xs text-foreground font-medium truncate max-w-[220px]" title={renderShippingAddress()}>
              {renderShippingAddress()}
            </p>
          </div>
        </div>
      </div>

      {/* تفاصيل المنتجات وفاتورة الحساب */}
      <div className="max-w-3xl mx-auto border border-border/40 p-6 md:p-8 space-y-6">
        <h3 className="text-sm tracking-wider uppercase text-foreground border-b border-border/40 pb-4">
          Order Summary Details
        </h3>

        <div className="divide-y divide-border/30">
          {items.map((item: any, idx: number) => {
            const currentQty = item.quantity || item.qty || 1;
            const currentPrice = item.price || 0;
            
            return (
              <div key={item.product_id || item.id || idx} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  {item.image && (
                    <div className="w-10 h-12 bg-secondary border border-border/30 flex-shrink-0">
                      <img src={item.image} alt={item.name || "Product"} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-foreground">{item.name || item.product_name || "Nuit Product"}</p>
                    <p className="text-[10px] text-muted-foreground/70">
                      Qty: {currentQty}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-foreground">
                  EGP {(currentPrice * currentQty).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border pt-6 space-y-3">
          <div className="flex justify-between text-xs font-light text-muted-foreground">
            <span>Subtotal</span>
            <span className="text-foreground font-medium">EGP {Number(subtotal).toLocaleString()}</span>
          </div>
          
          {Number(discountAmount) > 0 && (
            <div className="flex justify-between text-xs font-light text-emerald-400">
              <span>Discount {promoCode ? `(${promoCode})` : ""}</span>
              <span>- EGP {Number(discountAmount).toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-xs font-light text-muted-foreground">
            <span>Shipping</span>
            <span className="text-foreground font-medium">EGP {Number(shippingCost).toLocaleString()}</span>
          </div>

          <div className="border-t border-border/40 pt-4 flex justify-between items-baseline">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Amount Paid</span>
            <span className="text-xl font-medium tracking-wide text-primary">
              EGP {Number(totalPrice).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto text-center mt-12">
        <button
          onClick={() => navigate("/shop")}
          className="inline-flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90 px-8 py-4 text-[10px] tracking-[0.2em] uppercase font-semibold transition-all shadow-md cursor-pointer"
        >
          Continue Shopping <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}