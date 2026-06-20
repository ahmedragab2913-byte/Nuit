import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useLanguageStore, formatBilingual, getBilingualValue, formatPrice } from "../store/languageStore";
import { getShippingRatesPublic } from "../services/api";
import {
  MapPin,
  Trash2,
  Plus,
  LogOut,
  Save,
  CheckCircle,
  FileText
} from "lucide-react";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showOrderSuccess = searchParams.get("order_success") === "true";

  const { t, language } = useLanguageStore();
  const isAr = language === "ar";

  const {
    user,
    isAuthenticated,
    logout,
    updateName,
    addresses,
    fetchAddresses,
    addAddress,
    removeAddress,
    makeAddressDefault,
    orders,
    fetchOrders,
    loading
  } = useAuthStore();

  const [editName, setEditName] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [shippingRates, setShippingRates] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      setEditName(user?.name || "");
      fetchAddresses();
      fetchOrders();
      getShippingRatesPublic()
        .then((res) => setShippingRates(Array.isArray(res) ? res : []))
        .catch(() => {});
    }
  }, [isAuthenticated, navigate, user, fetchAddresses, fetchOrders]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    try {
      setUpdatingProfile(true);
      setProfileSuccess(false);
      const success = await updateName(editName);
      if (success) {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !street || !building) return;
    try {
      setSavingAddress(true);
      const success = await addAddress({
        country: "Egypt",
        city,
        street,
        building,
        floor,
        apartment,
        is_default: addresses.length === 0
      });
      if (success) {
        setShowAddForm(false);
        setCity(""); setStreet(""); setBuilding(""); setFloor(""); setApartment("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAddress(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="pt-32 px-6 lg:px-20 pb-24 min-h-screen bg-background text-foreground"
      style={sans}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* ── Order Success Banner ────────────────────────────────── */}
      {showOrderSuccess && (
        <div className="mb-10 max-w-5xl bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-sm flex items-center gap-3 text-xs text-emerald-400">
          <CheckCircle size={16} className="flex-shrink-0" />
          <p className="font-light">{t("orderSuccessMsg")}</p>
        </div>
      )}

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <p className={`text-[11px] uppercase text-primary mb-3 ${isAr ? "" : "tracking-[0.45em]"}`}>{t("maisonClub")}</p>
          <h1 className="text-5xl font-light text-foreground" style={serif}>{t("myAccount")}</h1>
        </div>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 border border-border/80 hover:border-red-500/30 hover:text-red-400 px-5 py-3 text-[10px] uppercase transition-all cursor-pointer font-medium ${isAr ? "" : "tracking-widest"}`}
        >
          <LogOut size={12} /> {t("logout")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

        {/* ── Left: Profile Info & Addresses ──────────────────────── */}
        <div className="lg:col-span-2 space-y-12">

          {/* Profile Form */}
          <div className="border-b border-border/40 pb-10">
            <h2 className={`text-lg font-light text-foreground uppercase mb-6 ${isAr ? "tracking-normal" : "tracking-widest"}`} style={serif}>
              {t("profileInformation")}
            </h2>

            <form onSubmit={handleUpdateName} className="max-w-xl space-y-5">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-muted-foreground/80 mb-2">
                  {t("displayName")}
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={t("displayName")}
                    className="flex-1 bg-secondary/15 border border-border px-4 py-3 text-xs text-foreground outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={updatingProfile || editName === user?.name}
                    className={`bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 px-5 text-[10px] uppercase font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${isAr ? "" : "tracking-wider"}`}
                  >
                    <Save size={12} /> {t("save")}
                  </button>
                </div>
                {profileSuccess && (
                  <p className="text-[10px] text-emerald-400 font-light mt-1.5 flex items-center gap-1">
                    <CheckCircle size={10} /> {t("nameUpdated")}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-muted-foreground/50 mb-2">
                    {t("emailReadOnly")}
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full bg-secondary/10 border border-border/30 px-4 py-3 text-xs text-muted-foreground/70 cursor-not-allowed outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-muted-foreground/50 mb-2">
                    {t("phoneReadOnly")}
                  </label>
                  <input
                    type="tel"
                    disabled
                    value={user?.phone || ""}
                    className="w-full bg-secondary/10 border border-border/30 px-4 py-3 text-xs text-muted-foreground/70 cursor-not-allowed outline-none"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Address Management */}
          <div className="border-b border-border/40 pb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-lg font-light text-foreground uppercase ${isAr ? "tracking-normal" : "tracking-widest"}`} style={serif}>
                {t("addressRegistry")}
              </h2>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase text-primary hover:text-primary/70 transition-colors cursor-pointer"
                >
                  <Plus size={12} /> {t("addNewAddress")}
                </button>
              )}
            </div>

            {/* Add Address Form */}
            {showAddForm && (
              <form onSubmit={handleAddAddress} className="bg-secondary/15 border border-border/60 p-6 space-y-4 mb-6">
                <h3 className={`text-xs uppercase text-foreground mb-2 ${isAr ? "tracking-normal" : "tracking-wider"}`}>
                  {t("newAddressDetails")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase text-muted-foreground/85 mb-1">{t("country")}</label>
                    <input
                      type="text"
                      disabled
                      value="Egypt"
                      className="w-full bg-background/50 border border-border/50 px-3 py-2 text-xs text-muted-foreground outline-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase text-muted-foreground/85 mb-1">{t("cityRegion")}</label>
                    <select
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-background border border-border px-3 py-2 text-xs text-foreground outline-none focus:border-primary appearance-none cursor-pointer"
                    >
                      <option value="" disabled>{isAr ? "اختر مدينتك" : "Select your city"}</option>
                      {shippingRates.map((rate) => (
                        <option key={rate.id} value={rate.city_name}>
                          {formatBilingual(rate.city_name, language)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase text-muted-foreground/85 mb-1">{t("streetAddress")}</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder={isAr ? "شارع 90، التجمع الخامس" : "90th Street, Fifth Settlement"}
                    className="w-full bg-background border border-border px-3 py-2 text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/35"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase text-muted-foreground/85 mb-1">{t("building")}</label>
                    <input
                      type="text"
                      required
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      placeholder="15B"
                      className="w-full bg-background border border-border px-3 py-2 text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/35"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase text-muted-foreground/85 mb-1">{t("floor")}</label>
                    <input
                      type="text"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      placeholder={isAr ? "الدور الثاني" : "2nd"}
                      className="w-full bg-background border border-border px-3 py-2 text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/35"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase text-muted-foreground/85 mb-1">{t("apartment")}</label>
                    <input
                      type="text"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder={isAr ? "شقة 3" : "Apt 3"}
                      className="w-full bg-background border border-border px-3 py-2 text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/35"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="border border-border/80 hover:border-foreground/20 px-4 py-2 text-[9px] uppercase tracking-wider text-muted-foreground cursor-pointer"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="bg-foreground text-background hover:bg-foreground/90 px-6 py-2 text-[9px] uppercase tracking-wider font-semibold disabled:opacity-40 cursor-pointer"
                  >
                    {savingAddress ? t("saving") : t("save")}
                  </button>
                </div>
              </form>
            )}

            {/* Saved Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="p-5 border border-border/60 bg-secondary/15 flex flex-col justify-between relative">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <MapPin size={13} className="text-muted-foreground" />
                      {addr.is_default ? (
                        <span className="bg-primary/10 text-primary text-[8px] uppercase tracking-widest px-2 py-0.5 font-bold rounded-sm">
                          {t("default")}
                        </span>
                      ) : (
                        <button
                          onClick={() => makeAddressDefault(addr.id)}
                          className="text-[8px] uppercase tracking-widest text-muted-foreground hover:text-foreground underline cursor-pointer"
                        >
                          {t("setDefault")}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-foreground font-semibold mb-1">
                      Egypt, {formatBilingual(addr.city, language)}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-light mb-1">
                      {addr.street}, Building {addr.building}
                    </p>
                    {addr.floor && (
                      <p className="text-[10px] text-muted-foreground/60">
                        Floor {addr.floor}, Apt {addr.apartment}
                      </p>
                    )}
                  </div>
                  <div className="flex mt-4 pt-4 border-t border-border/30 justify-end">
                    <button
                      onClick={() => removeAddress(addr.id)}
                      className="text-muted-foreground hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1 text-[9px] uppercase tracking-wider"
                    >
                      <Trash2 size={11} /> {t("delete")}
                    </button>
                  </div>
                </div>
              ))}

              {addresses.length === 0 && (
                <div className="md:col-span-2 border border-border/30 border-dashed p-10 text-center flex flex-col items-center justify-center">
                  <p className="text-xs text-muted-foreground/70 font-light mb-1">{t("noAddresses")}</p>
                  <p className="text-[10px] text-muted-foreground/50 font-light mb-4">{t("noAddressesHint")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Order History ────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className={`text-lg font-light text-foreground uppercase ${isAr ? "tracking-normal" : "tracking-widest"}`} style={serif}>
            {t("orderHistory")}
          </h2>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {orders.map((ord) => (
              <div key={ord.id} className="border border-border/60 bg-secondary/15 p-5 space-y-4">
                {/* Order header */}
                <div className="flex justify-between items-center pb-3 border-b border-border/30">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{ord.date}</p>
                    <p className="text-xs font-semibold text-foreground">{ord.order_number}</p>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] uppercase tracking-widest font-semibold border ${
                    ord.status === "delivered"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
                      : ord.status === "cancelled"
                      ? "bg-red-500/10 text-red-400 border-red-500/15"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/15"
                  }`}>
                    {ord.status}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {ord.items.map((it: any, idx: number) => {
                    const itemName = formatBilingual(it.name || it.name_ar, language);
                    return (
                      <div key={idx} className="flex gap-3 items-center">
                        <div className="w-8 h-10 bg-secondary border border-border/20 flex-shrink-0">
                          {it.image && <img src={it.image} alt={itemName} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-foreground font-medium truncate">{itemName}</p>
                          <p className="text-[10px] text-muted-foreground/70">
                            {it.qty} × <span className="text-l tracking-[0.16em] uppercase font-medium lining-nums"
                              style={{ fontFamily: "'Playfair Display', serif" }}>{formatPrice(it.price, language)}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Shipping address */}
                {ord.address && (
                  <div className="pt-2 border-t border-border/30 text-[10px] text-muted-foreground/80 font-light leading-relaxed">
                    <p className="uppercase tracking-wider text-[8px] text-muted-foreground/50 mb-0.5">{t("shippingLocation")}</p>
                    <p>{ord.address.building}, {ord.address.street}, {formatBilingual(ord.address.city, language)}</p>
                  </div>
                )}

                {/* Total */}
                <div className="pt-3 border-t border-border/30 flex justify-between items-baseline">
                  <span className="text-[10px] text-muted-foreground font-light">{t("totalPaid")}</span>
                  <span className="text-l tracking-[0.16em] uppercase font-medium lining-nums" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {formatPrice(ord.grand_total, language)}
                  </span>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <div className="border border-border/30 border-dashed p-8 text-center flex flex-col items-center justify-center">
                <FileText size={20} className="text-muted-foreground/40 mb-3" />
                <p className="text-xs text-muted-foreground/75 font-light">{t("noOrdersYet")}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
