import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { placeOrder } from "../services/api";
import { Check, MapPin, Plus, AlertCircle } from "lucide-react";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated, addresses, fetchAddresses, addAddress, loading: authLoading } = useAuthStore();
  const { cart, clearCart } = useCartStore();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [country] = useState("egypt");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);

  // 1. Guard Protection: Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/checkout", { replace: true });
    } else {
      fetchAddresses();
    }
  }, [isAuthenticated, navigate, fetchAddresses]);

  // 2. Set default address as selected when addresses load
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else {
        setSelectedAddressId(addresses[0].id);
      }
    } else {
      setSelectedAddressId(null);
    }
  }, [addresses]);

  // If cart is empty, redirect to cart page
  useEffect(() => {
    if (cart.length === 0 && !submitting) {
      navigate("/cart");
    }
  }, [cart, navigate, submitting]);

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping  = cartTotal >= 1500 ? 0 : 50;
  const grandTotal = cartTotal + shipping;

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !street || !building) return;
    try {
      setSavingAddress(true);
      setError(null);
      const success = await addAddress({
        country,
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
      } else {
        setError("Failed to save address.");
      }
    } catch (err) {
      setError("An error occurred while saving the address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError("Please select a delivery address.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const itemsPayload = cart.map(i => ({
        product_id: i.product.id,
        quantity: i.quantity,
      }));

      const res = await placeOrder({
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        items: itemsPayload,
      });

      if (res.status === "success") {
        // Clear local cart
        clearCart();
        // Redirect to profile page (which holds order history)
        navigate("/profile?order_success=true");
      } else {
        setError(res.message || "Failed to place order.");
      }

    } catch (err: any) {
      console.error("Checkout failed:", err);
      setError(err.response?.data?.message || err.message || "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated || cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-28 px-6 lg:px-20 pb-24 min-h-screen bg-background text-foreground" style={sans}>
      <div className="mb-12">
        <p className="text-[11px] tracking-[0.45em] uppercase text-primary mb-3">Secure Payment</p>
        <h1 className="text-5xl font-light text-foreground" style={serif}>Checkout</h1>
      </div>

      {error && (
        <div className="mb-8 max-w-5xl bg-red-500/5 border border-red-500/15 p-4 rounded-sm flex items-start gap-3 text-xs text-red-400">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <p className="font-light">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Left Columns: Delivery Details & Payment */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Address selection Section */}
          <div className="border-b border-border/40 pb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light text-foreground uppercase tracking-wider" style={serif}>1. Delivery Address</h2>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-1 text-[10px] tracking-wider uppercase text-primary hover:text-primary-foreground transition-colors cursor-pointer"
                >
                  <Plus size={11} /> Add New Address
                </button>
              )}
            </div>

            {/* Address List */}
            {!showAddressForm && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-5 border cursor-pointer transition-all relative ${
                        isSelected 
                          ? "border-primary bg-secondary/30" 
                          : "border-border/50 bg-background hover:border-border"
                      }`}
                    >
                      <MapPin size={14} className="text-muted-foreground mb-3" />
                      <p className="text-xs text-foreground font-semibold mb-1">
                        {country}, {addr.city}
                      </p>
                      <p className="text-[11px] text-muted-foreground/80 leading-relaxed font-light mb-1">
                        {addr.street}, Building {addr.building}
                      </p>
                      {addr.floor && (
                        <p className="text-[10px] text-muted-foreground/60">
                          Floor {addr.floor}, Apt {addr.apartment}
                        </p>
                      )}
                      {addr.is_default && (
                        <span className="absolute top-4 right-4 bg-primary/10 text-primary text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-semibold">
                          Default
                        </span>
                      )}
                      {isSelected && (
                        <span className="absolute bottom-4 right-4 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center text-background">
                          <Check size={8} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  );
                })}

                {addresses.length === 0 && (
                  <div className="md:col-span-2 border border-border/40 border-dashed p-8 text-center flex flex-col items-center justify-center">
                    <p className="text-xs text-muted-foreground font-light mb-4">No delivery addresses saved in your profile yet.</p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="border border-border/80 hover:border-primary hover:text-primary transition-all px-6 py-2.5 text-[9px] uppercase tracking-widest text-foreground font-medium cursor-pointer"
                    >
                      Add Address to Profile
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Add Address Form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="bg-secondary/20 border border-border/50 p-6 md:p-8 space-y-4">
                <h3 className="text-xs tracking-wider uppercase text-foreground mb-2">New Address Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase text-muted-foreground/80 mb-1">Country</label>
                    <input
                      type="text"
                      disabled
                      value={country}
                      className="w-full bg-background border border-border/50 px-3 py-2 text-xs text-muted-foreground outline-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase text-muted-foreground/80 mb-1">City / Region *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Cairo / Giza"
                      className="w-full bg-background border border-border px-3 py-2 text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase text-muted-foreground/80 mb-1">Street / Address Details *</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="El-Nasr St, Maadi"
                    className="w-full bg-background border border-border px-3 py-2 text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/40"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase text-muted-foreground/80 mb-1">Building *</label>
                    <input
                      type="text"
                      required
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      placeholder="No. 12"
                      className="w-full bg-background border border-border px-3 py-2 text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase text-muted-foreground/80 mb-1">Floor</label>
                    <input
                      type="text"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      placeholder="4th"
                      className="w-full bg-background border border-border px-3 py-2 text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase text-muted-foreground/80 mb-1">Apartment</label>
                    <input
                      type="text"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder="Apt 42"
                      className="w-full bg-background border border-border px-3 py-2 text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/40"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="border border-border/80 hover:border-foreground/20 px-4 py-2 text-[9px] uppercase tracking-wider text-muted-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="bg-foreground text-background hover:bg-foreground/90 px-6 py-2 text-[9px] uppercase tracking-wider font-semibold disabled:opacity-40 cursor-pointer"
                  >
                    {savingAddress ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Payment Method section */}
          <div>
            <h2 className="text-xl font-light text-foreground uppercase tracking-wider mb-6" style={serif}>2. Payment Method</h2>
            
            <div className="space-y-4">
              <div 
                onClick={() => setPaymentMethod("cash_on_delivery")}
                className={`p-5 border cursor-pointer flex justify-between items-center transition-all ${
                  paymentMethod === "cash_on_delivery"
                    ? "border-primary bg-secondary/30"
                    : "border-border/50 bg-background hover:border-border"
                }`}
              >
                <div>
                  <p className="text-xs text-foreground font-semibold mb-0.5">Cash on Delivery (COD)</p>
                  <p className="text-[10px] text-muted-foreground font-light">Pay with cash upon package receipt.</p>
                </div>
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  paymentMethod === "cash_on_delivery" ? "border-primary bg-primary" : "border-border/80"
                }`}>
                  {paymentMethod === "cash_on_delivery" && <span className="w-1.5 h-1.5 bg-background rounded-full" />}
                </span>
              </div>

              {/* Disabled future payment options */}
              {["card", "paypal", "stripe"].map((payOption) => (
                <div 
                  key={payOption}
                  className="p-5 border border-border/30 bg-secondary/5 opacity-55 flex justify-between items-center select-none"
                >
                  <div>
                    <p className="text-xs text-muted-foreground/85 font-semibold capitalize mb-0.5">
                      {payOption === "card" ? "Credit / Debit Card" : payOption}
                    </p>
                    <p className="text-[9px] text-primary tracking-wider uppercase font-semibold">Coming Soon</p>
                  </div>
                  <span className="w-3.5 h-3.5 rounded-full border border-border/40" />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Place Order CTA */}
        <div className="lg:col-span-1">
          <div className="bg-secondary/50 border border-border p-8 sticky top-28 backdrop-blur-sm">
            <h3 className="text-xl font-light text-foreground mb-6" style={serif}>Cart Summary</h3>
            
            {/* Cart Items list */}
            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 mb-6 border-b border-border/40 pb-6">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-4 items-center">
                  <div className="w-10 h-12 bg-secondary border border-border/30 flex-shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{item.product.name}</p>
                    <p className="text-[10px] text-muted-foreground/80 font-light">
                      Qty: {item.quantity} × EGP {item.product.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-xs font-light text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground font-medium">EGP {cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-light text-muted-foreground">
                <span>Shipping</span>
                <span className="text-foreground font-medium">
                  {shipping === 0 ? "Free" : `EGP ${shipping}`}
                </span>
              </div>
              {shipping === 0 ? (
                <p className="text-[9px] tracking-widest uppercase text-primary font-medium bg-primary/5 py-1 px-2.5 inline-block">
                  Free shipping applied
                </p>
              ) : (
                <p className="text-[10px] text-muted-foreground/60 font-light">
                  Free shipping starts at EGP 1,500
                </p>
              )}
            </div>

            <div className="border-t border-border pt-4 mb-8">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-light text-foreground">Total</span>
                <span className="text-xl font-medium text-foreground tracking-wide">
                  EGP {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={submitting || !selectedAddressId}
              className="w-full bg-primary text-primary-foreground text-[10px] tracking-[0.25em] uppercase py-4 font-semibold hover:bg-primary/95 disabled:opacity-40 transition-colors shadow-md cursor-pointer flex justify-center items-center gap-2"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                "Confirm & Place Order"
              )}
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="w-full text-center text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mt-4 block"
            >
              Modify Shopping Bag
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
