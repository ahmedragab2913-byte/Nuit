import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, ShoppingBag, Calendar, MapPin, ArrowRight } from "lucide-react";
import { useLanguageStore, formatBilingual, formatPrice } from "../store/languageStore";

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguageStore();
  const isAr = language === "ar";

  const orderData = location.state?.order;

  if (!orderData) {
    return (
      <div
        className="min-h-screen bg-background flex flex-col items-center justify-center pt-24 px-6"
        dir={isAr ? "rtl" : "ltr"}
      >
        <p className="text-sm text-muted-foreground mb-4">{t("noOrderDetails")}</p>
        <button
          onClick={() => navigate("/")}
          className="bg-foreground text-background px-6 py-2 text-xs uppercase tracking-widest font-semibold"
        >
          {t("goToHome")}
        </button>
      </div>
    );
  }

  // ── Core order values ──────────────────────────────────────────────────────
  const orderId      = orderData.order_id || orderData.id;
  const orderNumber  = orderData.order_number || `#NU-${orderId}`;

  const totalPrice      = Number(orderData.total_price || orderData.total || orderData.grand_total || 0);
  const subtotal        = Number(orderData.subtotal || 0);
  const discountAmount  = Number(orderData.discount_amount || orderData.discount || 0);
  const backendShipping = Number(orderData.shipping_cost || orderData.shipping_amount || orderData.shipping_fee || 0);

  const calculatedShipping = totalPrice - subtotal + discountAmount;
  const shippingCost = backendShipping > 0 ? backendShipping : (calculatedShipping > 0 ? calculatedShipping : 0);

  const deliveryDays     = orderData.delivery_days || orderData.estimated_days || orderData.shipping_rate?.delivery_days || "3-5";
  const items            = orderData.items || [];
  const shippingAddress  = orderData.shipping_address;
  const promoCode        = orderData.promo_code || null;

  const renderShippingAddress = () => {
    if (!shippingAddress) return t("yourSavedAddress");
    if (typeof shippingAddress === "object") {
      return `${formatBilingual(shippingAddress.city || "", language)}, Building ${shippingAddress.building || ""}`.trim() || t("deliveryAddress");
    }
    return shippingAddress;
  };

  return (
    <div
      className="pt-32 px-6 lg:px-20 pb-24 min-h-screen bg-background text-foreground"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* ── Hero Confirmation ──────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-6 animate-bounce">
          <CheckCircle2 size={36} strokeWidth={1.5} />
        </div>
        <p className={`text-[11px] uppercase text-primary mb-3 ${isAr ? "tracking-normal" : "tracking-[0.45em]"}`}>
          {t("thankYou")}
        </p>
        <h1 className="premium-display text-4xl md:text-5xl font-light text-foreground mb-4">
          {t("orderConfirmed")}
        </h1>
        <p className="text-xs text-muted-foreground max-w-md mx-auto font-light leading-relaxed">
          {t("orderWelcome")}
        </p>
      </div>

      {/* ── Quick Status Cards ─────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 border border-border/60 bg-secondary/20 p-8 rounded-sm mb-12">
        {/* Order Number */}
        <div className="flex gap-3 items-start text-start">
          <ShoppingBag size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-[10px] tracking-wider uppercase text-muted-foreground font-semibold mb-1">
              {t("orderNumber")}
            </h4>
            <p className="text-xs font-mono font-bold text-foreground">{orderNumber}</p>
          </div>
        </div>

        {/* Delivery Estimate */}
        <div className="flex gap-3 items-start text-start">
          <Calendar size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-[10px] tracking-wider uppercase text-muted-foreground font-semibold mb-1">
              {t("deliveryEstimate")}
            </h4>
            <p className="text-xs text-foreground font-medium">
              {deliveryDays} {t("days")}
            </p>
          </div>
        </div>

        {/* Shipping To */}
        <div className="flex gap-3 items-start text-start">
          <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-[10px] tracking-wider uppercase text-muted-foreground font-semibold mb-1">
              {t("shippingTo")}
            </h4>
            <p
              className="text-xs text-foreground font-medium truncate max-w-[220px]"
              title={renderShippingAddress()}
            >
              {renderShippingAddress()}
            </p>
          </div>
        </div>
      </div>

      {/* ── Order Summary ──────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto border border-border/40 p-6 md:p-8 space-y-6">
        <h3 className={`text-sm uppercase text-foreground border-b border-border/40 pb-4 ${isAr ? "tracking-normal" : "tracking-wider"}`}>
          {t("orderSummaryDetails")}
        </h3>

        {/* Items list */}
        <div className="divide-y divide-border/30">
          {items.map((item: any, idx: number) => {
            const currentQty   = item.quantity || item.qty || 1;
            const currentPrice = item.price || 0;
            const displayName  = formatBilingual(item.name || item.product_name || item.name_ar || item.product_name_ar, language);

            return (
              <div
                key={item.product_id || item.id || idx}
                className="flex justify-between items-center py-4 first:pt-0 last:pb-0 gap-4"
              >
                <div className="flex items-center gap-4">
                  {item.image && (
                    <div className="w-10 h-12 bg-secondary border border-border/30 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="text-start">
                    <p className="text-xs font-semibold text-foreground">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground/70">
                      {t("qty")}: {currentQty}
                    </p>
                  </div>
                </div>
                {/* 👈 تم إجبار الخط والترقيم الإنجليزي الفخم هنا */}
                <span 
                  className="text-l tracking-[0.16em] uppercase font-medium lining-nums"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {formatPrice(currentPrice * currentQty, language)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="border-t border-border pt-6 space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between text-xs font-light text-muted-foreground">
            <span>{t("subtotal")}</span>
            <span className="text-l tracking-[0.16em] uppercase font-medium lining-nums"
                              style={{ fontFamily: "'Playfair Display', serif" }}>
              {formatPrice(subtotal, language)}
            </span>
          </div>

          {/* Discount */}
          {Number(discountAmount) > 0 && (
            <div className="flex justify-between text-xs font-light text-emerald-400">
              <span>
                {t("discount")} {promoCode ? `(${promoCode})` : ""}
              </span>
              <span                               style={{ fontFamily: "'Playfair Display', serif" }}>
                - {formatPrice(discountAmount, language)}
              </span>
            </div>
          )}

          {/* Shipping */}
          <div className="flex justify-between text-xs font-light text-muted-foreground">
            <span>{t("shipping")}</span>
            <span className="text-l tracking-[0.16em] uppercase font-medium lining-nums"
                              style={{ fontFamily: "'Playfair Display', serif" }}>
              {formatPrice(shippingCost, language)}
            </span>
          </div>

          {/* Amount Paid */}
          <div className="border-t border-border/40 pt-4 flex justify-between items-baseline">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              {t("amountPaid")}
            </span>
            <span className="text-l tracking-[0.16em] uppercase font-medium lining-nums"
                              style={{ fontFamily: "'Playfair Display', serif" }}>
              {formatPrice(totalPrice, language)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Continue Shopping ──────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto text-center mt-12">
        <button
          onClick={() => navigate("/shop")}
          className="inline-flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90 px-8 py-4 text-[10px] tracking-[0.2em] uppercase font-semibold transition-all shadow-md cursor-pointer"
        >
          {isAr ? (
            <>
              <ArrowRight size={12} className="rotate-180" />
              {t("continueShopping")}
            </>
          ) : (
            <>
              {t("continueShopping")} <ArrowRight size={12} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}