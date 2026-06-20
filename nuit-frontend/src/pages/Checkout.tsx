import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useLanguageStore, formatBilingual, getBilingualValue, formatPrice } from "../store/languageStore";
// استيراد دالة جلب أسعار الشحن العامة النظيفة من ملف الـ api
import { placeOrder, getShippingRatesPublic, validatePromoCode } from "../services/api";
import { Check, MapPin, Plus, AlertCircle } from "lucide-react";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

interface ShippingRate {
  id: number;
  city_name: string;
  rate: number;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated, addresses, fetchAddresses, addAddress } = useAuthStore();
  const { cart, clearCart } = useCartStore();
  const { language, t } = useLanguageStore();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🚚 أسعار الشحن - تعيين القيمة الابتدائية لـ Cost بـ null بدل 50
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [dynamicShippingCost, setDynamicShippingCost] = useState<number | null>(null);

  // Address form state
  const COUNTRY = "egypt";
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // 🎫 Promo Code State
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount_amount: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  // Ref to suppress empty-cart redirect during order placement
  const orderInFlightRef = useRef(false);

  // 1. Guard Protection & Fetch Shipping Rates
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/checkout", { replace: true });
    } else {
      fetchAddresses();
      
      // Shipping rates — getShippingRatesPublic already returns ShippingRate[]
      getShippingRatesPublic()
        .then(data => {
          setShippingRates(Array.isArray(data) ? data : []);
        })
        .catch(err => {
          console.error("Error fetching shipping rates", err);
          setShippingRates([]);
        });
    }
  }, [isAuthenticated, navigate, fetchAddresses]);

  // 2. Set default address
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.is_default);
      setSelectedAddressId(defaultAddr ? defaultAddr.id : addresses[0].id);
    } else {
      setSelectedAddressId(null);
    }
  }, [addresses]);

  // 🔄 3. مراقبة العنوان المختار أو الـ Form المفتوح لحساب الشحن ديناميكياً بدون قيم افتراضية وهمية
  useEffect(() => {
    if (!Array.isArray(shippingRates)) return;

    // الحالة أ: العميل فاتح فورم إضافة عنوان جديد وبيختار مدينة حالياً
    if (showAddressForm && city) {
      const matchedRate = shippingRates.find(r => r.city_name.toLowerCase() === city.toLowerCase());
      setDynamicShippingCost(matchedRate ? matchedRate.rate : null);
      return;
    }

    // الحالة ب: العميل بيختار من عناوينه المحفوظة فوق
    if (selectedAddressId && addresses.length > 0) {
      const currentAddress = addresses.find(a => a.id === selectedAddressId);
      if (currentAddress && currentAddress.city) {
        const matchedRate = shippingRates.find(r => r.city_name.toLowerCase() === currentAddress.city.toLowerCase());
        setDynamicShippingCost(matchedRate ? matchedRate.rate : null);
      } else {
        setDynamicShippingCost(null);
      }
    } else {
      setDynamicShippingCost(null);
    }
  }, [selectedAddressId, addresses, city, showAddressForm, shippingRates]);

  // 4. Redirect if cart is empty (but NOT during order submission)
  useEffect(() => {
    if (cart.length === 0 && !submitting && !orderInFlightRef.current) {
      navigate("/cart");
    }
  }, [cart, navigate, submitting]);

function translatePromoError(msg: string, lang: "en" | "ar"): string {
  if (lang !== "ar") return msg;
  if (!msg) return "";
  const lowerMsg = msg.toLowerCase();
  
  if (lowerMsg.includes("invalid or inactive")) {
    return "كود الخصم غير صحيح أو غير مفعل.";
  }
  if (lowerMsg.includes("has expired")) {
    return "لقد انتهت صلاحية كود الخصم هذا.";
  }
  if (lowerMsg.includes("reached its usage limit")) {
    return "وصل كود الخصم هذا إلى الحد الأقصى للاستخدام.";
  }
  if (lowerMsg.includes("minimum order amount")) {
    const match = msg.match(/EGP\s*([\d,.]+)/i);
    const amount = match ? match[1] : "";
    return amount 
      ? `الحد الأدنى لقيمة الطلب لتطبيق هذا الكود هو ${amount} ج.م.`
      : "لم يتم استيفاء الحد الأدنى لقيمة الطلب لتطبيق هذا الكود.";
  }
  if (lowerMsg.includes("reached the usage limit for this promo code")) {
    return "لقد وصلت إلى الحد الأقصى المسموح به لاستخدام هذا الكود.";
  }
  if (lowerMsg.includes("failed to validate")) {
    return "فشل التحقق من كود الخصم.";
  }
  return msg;
}

// 🎫 Promo Code Handlers
  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    try {
      setValidatingPromo(true);
      setPromoError(null);
      const res = await validatePromoCode(promoCode.trim(), cartTotal);
      if (res.status === "success" && res.data) {
        setAppliedPromo({
          code: res.data.code,
          discount_amount: res.data.discount_amount,
        });
        setPromoCode("");
      } else {
        const rawMsg = res.message || "Failed to apply promo code.";
        setPromoError(translatePromoError(rawMsg, language));
      }
    } catch (err: any) {
      const rawMsg = err.response?.data?.message || err.message || "Failed to validate promo code.";
      setPromoError(translatePromoError(rawMsg, language));
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  // 🧮 الحسابات المالية بعد تعديل الحساب الديناميكي وإلغاء الـ Free Shipping
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  
  // الشحن يعتمد بالكامل على القيمة القادمة من الداتا أو صفر لو لسه لم يتم الاختيار (لمنع ضرب الـ Total)
  const shipping   = dynamicShippingCost !== null ? dynamicShippingCost : 0;
  const discount   = appliedPromo ? appliedPromo.discount_amount : 0;
  const grandTotal = Math.max(0, cartTotal + shipping - discount);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !street || !building) return;
    try {
      setSavingAddress(true);
      setError(null);
      const success = await addAddress({
        country: COUNTRY,
        city,
        street,
        building,
        floor,
        apartment,
        is_default: addresses.length === 0,
      });

      if (success) {
        setShowAddressForm(false);
        setCity("");
        setStreet("");
        setBuilding("");
        setFloor("");
        setApartment("");
      }
    } catch (err) {
      setError(language === "ar" ? "حدث خطأ أثناء حفظ العنوان." : "An error occurred while saving the address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    // 🎯 حماية QA: منع إرسال الطلب نهائيًا لو الشحن لسه بيتحسب أو قيمته null
    if (!selectedAddressId || dynamicShippingCost === null) {
      setError(language === "ar" ? "يرجى اختيار عنوان توصيل صحيح لحساب الشحن." : "Please select a valid delivery address to calculate shipping.");
      return;
    }

    let isSuccess = false;

    try {
      setSubmitting(true);
      orderInFlightRef.current = true;
      setError(null);

      const itemsPayload = cart.map(i => ({
        product_id: i.product.id,
        quantity: i.quantity,
      }));

      // 🎯 تمرير البيانات المالية كاملة وجاهزة للباك إيند لمطابقتها في الـ Validation
      const res = await placeOrder({
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        items: itemsPayload,
        promo_code: appliedPromo ? appliedPromo.code : undefined,
        shipping_cost: shipping,      // القيمة الحقيقية (مثال: 100)
        discount_amount: discount,    // قيمة الخصم (مثال: 600)
        total_price: grandTotal,      // الإجمالي الصافي النهائي (مثال: 1900)
      });

      if (res.status === "success" && res.data) {
        isSuccess = true;

        // Clear cart BEFORE navigating — orderInFlightRef prevents the redirect
        clearCart();

        navigate("/order-confirmation", { 
          state: { order: res.data } 
        });
      } else {
        setError(res.message || (language === "ar" ? "فشل إرسال الطلب." : "Failed to place order."));
      }

    } catch (err: unknown) {
      console.error("Checkout failed:", err);
      const message = err instanceof Error ? err.message : (language === "ar" ? "فشلت عملية إتمام الشراء. يرجى المحاولة مرة أخرى." : "Checkout failed. Please try again.");
      setError(message);
    } finally {
      if (!isSuccess) {
        setSubmitting(false);
        orderInFlightRef.current = false;
      }
    }
  };

  if (!isAuthenticated || (cart.length === 0 && !submitting)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-28 px-6 lg:px-20 pb-24 min-h-screen bg-background text-foreground text-left rtl:text-right" style={sans}>
      <div className="mb-12 text-left rtl:text-right">
        <p className="text-[11px] tracking-[0.45em] uppercase text-primary mb-3">
          {language === "ar" ? "الدفع الآمن" : "Secure Payment"}
        </p>
        <h1 className="text-5xl font-light text-foreground" style={serif}>
          {language === "ar" ? "إتمام الشراء" : "Checkout"}
        </h1>
      </div>

      {error && (
        <div className="mb-8 max-w-5xl bg-red-500/5 border border-red-500/15 p-4 rounded-sm flex items-start gap-3 text-xs text-red-400 text-left rtl:text-right">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <p className="font-light">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Delivery Details & Payment */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Address Section */}
          <div className="border-b border-border/40 pb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light text-foreground uppercase tracking-wider" style={serif}>
                {language === "ar" ? "1. عنوان التوصيل" : "1. Delivery Address"}
              </h2>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-1 text-[10px] tracking-wider uppercase text-primary hover:text-primary-foreground transition-colors cursor-pointer font-semibold"
                >
                  <Plus size={11} /> {t("addNewAddress")}
                </button>
              )}
            </div>

            {!showAddressForm && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-5 border cursor-pointer transition-all relative text-left rtl:text-right ${
                        isSelected 
                          ? "border-primary bg-secondary/30" 
                          : "border-border/50 bg-background hover:border-border"
                      }`}
                    >
                      <MapPin size={14} className="text-muted-foreground mb-3" />
                      <p className="text-xs text-foreground font-semibold mb-1">
                        {COUNTRY.toUpperCase()}, {formatBilingual(addr.city, language)}
                      </p>
                      <p className="text-[11px] text-muted-foreground/80 leading-relaxed font-light mb-1">
                        {addr.street}, {language === "ar" ? "مبنى" : "Building"} {addr.building}
                      </p>
                      {addr.floor && (
                        <p className="text-[10px] text-muted-foreground/60">
                          {language === "ar" ? `الطابق ${addr.floor}، شقة ${addr.apartment}` : `Floor ${addr.floor}, Apt ${addr.apartment}`}
                        </p>
                      )}
                      {addr.is_default && (
                        <span className="absolute top-4 right-4 rtl:right-auto rtl:left-4 bg-primary/10 text-primary text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-semibold">
                          {language === "ar" ? "الافتراضي" : "Default"}
                        </span>
                      )}
                      {isSelected && (
                        <span className="absolute bottom-4 right-4 rtl:right-auto rtl:left-4 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center text-background">
                          <Check size={8} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  );
                })}

                {addresses.length === 0 && (
                  <div className="md:col-span-2 border border-border/40 border-dashed p-8 text-center flex flex-col items-center justify-center">
                    <p className="text-xs text-muted-foreground font-light mb-4">
                      {language === "ar" ? "لا توجد عناوين توصيل محفوظة بعد." : "No delivery addresses saved yet."}
                    </p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="border border-border/80 hover:border-primary hover:text-primary transition-all px-6 py-2.5 text-[9px] uppercase tracking-widest text-foreground font-semibold cursor-pointer"
                    >
                      {language === "ar" ? "إضافة عنوان" : "Add Address"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="bg-secondary/20 border border-border/50 p-6 md:p-8 space-y-4 text-left rtl:text-right">
                <h3 className="text-xs tracking-wider uppercase text-foreground mb-2">
                  {language === "ar" ? "تفاصيل العنوان الجديد" : "New Address Details"}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase text-muted-foreground/80 mb-1">{language === "ar" ? "البلد" : "Country"}</label>
                    <input type="text" disabled value={COUNTRY} className="w-full bg-background border border-border/50 px-3 py-2 text-xs text-muted-foreground outline-none cursor-not-allowed uppercase" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase text-muted-foreground/80 mb-1">{language === "ar" ? "المدينة *" : "City *"}</label>
                    <select
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-background border border-border px-3 py-2 text-xs text-foreground outline-none focus:border-primary appearance-none cursor-pointer"
                    >
                      <option value="" disabled>{language === "ar" ? "اختر مدينتك" : "Select your city"}</option>
                      {Array.isArray(shippingRates) && shippingRates.map((rate) => (
                        <option key={rate.id} value={rate.city_name}>
                          {formatBilingual(rate.city_name, language)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-muted-foreground/80 mb-1">{language === "ar" ? "عنوان الشارع *" : "Street Address *"}</label>
                  <input type="text" required value={street} onChange={(e) => setStreet(e.target.value)} placeholder="El-Nasr St." className="w-full bg-background border border-border px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase text-muted-foreground/80 mb-1">{language === "ar" ? "المبنى *" : "Building *"}</label>
                    <input type="text" required value={building} onChange={(e) => setBuilding(e.target.value)} placeholder="12" className="w-full bg-background border border-border px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase text-muted-foreground/80 mb-1">{language === "ar" ? "الطابق" : "Floor"}</label>
                    <input type="text" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="4" className="w-full bg-background border border-border px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase text-muted-foreground/80 mb-1">{language === "ar" ? "الشقة" : "Apartment"}</label>
                    <input type="text" value={apartment} onChange={(e) => setApartment(e.target.value)} placeholder="42" className="w-full bg-background border border-border px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-3">
                  <button type="button" onClick={() => setShowAddressForm(false)} className="border border-border/80 px-4 py-2 text-[9px] uppercase tracking-wider text-muted-foreground cursor-pointer font-semibold">{t("cancel")}</button>
                  <button type="submit" disabled={savingAddress} className="bg-foreground text-background px-6 py-2 text-[9px] uppercase tracking-wider font-semibold disabled:opacity-40 cursor-pointer">
                    {savingAddress ? (language === "ar" ? "جاري الحفظ..." : "Saving...") : (language === "ar" ? "حفظ العنوان" : "Save Address")}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="text-xl font-light text-foreground uppercase tracking-wider mb-6" style={serif}>
              {language === "ar" ? "2. طريقة الدفع" : "2. Payment Method"}
            </h2>
            <div className="space-y-4">
              <div 
                onClick={() => setPaymentMethod("cash_on_delivery")}
                className={`p-5 border cursor-pointer flex justify-between items-center transition-all text-left rtl:text-right ${
                  paymentMethod === "cash_on_delivery" ? "border-primary bg-secondary/30" : "border-border/50 bg-background hover:border-border"
                }`}
              >
                <div>
                  <p className="text-xs text-foreground font-semibold mb-0.5">{t("cod")}</p>
                  <p className="text-[10px] text-muted-foreground font-light">{language === "ar" ? "الدفع نقداً عند استلام الشحنة." : "Pay with cash upon package receipt."}</p>
                </div>
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === "cash_on_delivery" ? "border-primary bg-primary" : "border-border/80"}`}>
                  {paymentMethod === "cash_on_delivery" && <span className="w-1.5 h-1.5 bg-background rounded-full" />}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Order Summary & CTA */}
        <div className="lg:col-span-1">
          <div className="bg-secondary/50 border border-border p-8 sticky top-28 backdrop-blur-sm">
            <h3 className="text-xl font-light text-foreground mb-6" style={serif}>{t("orderSummary")}</h3>
            
            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 mb-6 border-b border-border/40 pb-6">
              {cart.map((item) => {
                const pName = getBilingualValue(item.product.name, item.product.name_ar, language);
                return (
                  <div key={item.product.id} className="flex gap-4 items-center">
                    <div className="w-10 h-12 bg-secondary border border-border/30 flex-shrink-0">
                      <img src={item.product.image} alt={pName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 text-left rtl:text-right">
                      <p className="text-xs font-semibold text-foreground truncate">{pName}</p>
                      <p className="text-[10px] text-muted-foreground/80 font-light">
                        {language === "ar" 
                          ? `الكمية: ${item.quantity} × ${formatPrice(item.product.price, language)}` 
                          : `Qty: ${item.quantity} × ${formatPrice(item.product.price, language)}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Promo Code Input / Display */}
            <div className="mb-6 pb-6 border-b border-border/40">
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 px-3 py-2.5 rounded-sm text-xs text-emerald-400">
                  <span className="font-medium tracking-wide">{language === "ar" ? `تم تطبيق الكود: ${appliedPromo.code}` : `Code applied: ${appliedPromo.code}`}</span>
                  <button 
                    type="button" 
                    onClick={handleRemovePromo}
                    className="text-[10px] underline uppercase tracking-wider hover:text-emerald-300 cursor-pointer font-semibold"
                  >
                    {t("remove")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t("promoCode")}
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-background border border-border px-3 py-2 text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/45 placeholder:text-[10px] placeholder:tracking-wider uppercase"
                    />
                    <button
                      type="submit"
                      disabled={validatingPromo || !promoCode.trim()}
                      className="border border-foreground bg-foreground text-background px-4 text-[10px] tracking-widest uppercase hover:bg-transparent hover:text-foreground transition-all disabled:opacity-40 cursor-pointer font-semibold"
                    >
                      {validatingPromo ? "..." : t("apply")}
                    </button>
                  </div>
                  {promoError && <p className="text-[10px] text-red-400 font-light mt-1">{promoError}</p>}
                </form>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-xs font-light text-muted-foreground">
                <span>{t("subtotal")}</span>
                <span className="text-l tracking-[0.16em] uppercase font-medium lining-nums"
                              style={{ fontFamily: "'Playfair Display', serif", color: "#313c45" }}>{formatPrice(cartTotal, language)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-xs font-light text-emerald-400">
                  <span>{t("discount")}</span>
                  <span className="text-emerald-400 text-l tracking-[0.16em] uppercase font-medium lining-nums" style={serif}>- {formatPrice(discount, language)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-light text-muted-foreground">
                <span>{t("shipping")}</span>
                <span className="text-l tracking-[0.16em] uppercase font-medium lining-nums" style={{ ...serif, color: "#313c45" }}>
                  {dynamicShippingCost !== null ? (
                    formatPrice(dynamicShippingCost, language)
                  ) : (
                    <span className="text-amber-500/90 text-[10px] tracking-wider font-normal normal-case">
                      {language === "ar" ? "اختر العنوان لحساب الشحن" : "Select address to calculate"}
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-4 mb-8">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-light text-foreground">{language === "ar" ? "الإجمالي النهائي" : "Total"}</span>
                <span className="text-l tracking-[0.16em] uppercase font-medium lining-nums" style={{ ...serif, color: "#313c45" }}>{formatPrice(grandTotal, language)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={submitting || !selectedAddressId || dynamicShippingCost === null}
              className="w-full bg-primary text-primary-foreground text-[10px] tracking-[0.25em] uppercase py-4 font-semibold hover:bg-primary/95 disabled:opacity-40 transition-colors cursor-pointer flex justify-center items-center gap-2"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                language === "ar" ? "تأكيد وإرسال الطلب" : "Confirm & Place Order"
              )}
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="w-full text-center text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mt-4 block cursor-pointer font-semibold"
            >
              {language === "ar" ? "تعديل سلة التسوق" : "Modify Shopping Bag"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}