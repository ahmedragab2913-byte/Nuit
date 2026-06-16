import React, { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle, XCircle } from "lucide-react";
// 🤝 الـ Imports النظيفة من الـ api service بتاعك
import { 
  getPromoCodes, 
  createPromoCode, 
  togglePromoCodeStatus, 
  deletePromoCode, 
  type PromoCode 
} from "../services/api";

export default function PromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    min_order_amount: "0",
    max_discount_amount: "",
    usage_limit: "",
    user_usage_limit: "1",
    expires_at: "",
    is_active: true,
  });

  const fetchPromoCodes = async () => {
    try {
      const data = await getPromoCodes();
      setPromoCodes(data);
    } catch (err) {
      console.error("Error fetching promo codes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPromoCode({
        ...formData,
        value: Number(formData.value),
        min_order_amount: Number(formData.min_order_amount),
        max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        user_usage_limit: Number(formData.user_usage_limit),
      });
      
      fetchPromoCodes();
      setFormData({
        code: "", type: "percentage", value: "", min_order_amount: "0",
        max_discount_amount: "", usage_limit: "", user_usage_limit: "1",
        expires_at: "", is_active: true
      });
    } catch (err) {
      alert("Error creating promo code. Check validation.");
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await togglePromoCodeStatus(id, currentStatus);
      setPromoCodes(promoCodes.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this promo code?")) return;
    try {
      await deletePromoCode(id);
      setPromoCodes(promoCodes.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error deleting promo code", err);
    }
  };

  // باقي الـ Return (الـ UI) زي ما هو بالظبط بدون أي تغيير...
  return (
    <div className="p-6 max-w-7xl mx-auto text-foreground">
      {/* Header */}
      {/* <div className="flex items-center gap-3 mb-8">
        <Ticket className="text-primary w-8 h-8" />
        <div>
          <h1 className="text-2xl font-light tracking-wide">Promo Codes</h1>
          <p className="text-xs text-muted-foreground">Manage storefront discount coupons and limits</p>
        </div>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* 🟥 الـ Form (1 Column) */}
        <div className="bg-secondary/30 border border-border p-6 rounded-sm sticky top-6">
          <h3 className="text-sm font-medium tracking-wider uppercase mb-4 text-primary">Create New Coupon</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Coupon Code</label>
              <input
                type="text"
                required
                placeholder="e.g. NUIT10"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full bg-background border border-border px-3 py-2 text-xs outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-xs outline-none focus:border-primary transition-colors"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (EGP)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Value</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder={formData.type === "percentage" ? "10" : "200"}
                  value={formData.value}
                  onChange={e => setFormData({ ...formData, value: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-xs outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Min Order (EGP)</label>
                <input
                  type="number"
                  value={formData.min_order_amount}
                  onChange={e => setFormData({ ...formData, min_order_amount: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-xs outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Max Discount (EGP)</label>
                <input
                  type="number"
                  placeholder="Optional"
                  value={formData.max_discount_amount}
                  onChange={e => setFormData({ ...formData, max_discount_amount: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-xs outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Total Usage Limit</label>
                <input
                  type="number"
                  placeholder="Unlimited"
                  value={formData.usage_limit}
                  onChange={e => setFormData({ ...formData, usage_limit: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-xs outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Limit Per User</label>
                <input
                  type="number"
                  value={formData.user_usage_limit}
                  onChange={e => setFormData({ ...formData, user_usage_limit: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-xs outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Expiry Date</label>
              <input
                type="datetime-local"
                value={formData.expires_at}
                onChange={e => setFormData({ ...formData, expires_at: e.target.value })}
                className="w-full bg-background border border-border px-3 py-2 text-xs outline-none focus:border-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground text-[10px] tracking-widest uppercase py-3 hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={14} /> Create Coupon
            </button>
          </form>
        </div>

        {/* 📊 الجدول لعرض الأكواد الحالية (2 Columns) */}
        <div className="lg:col-span-2 border border-border bg-background rounded-sm overflow-hidden">
          {loading ? (
            <p className="p-6 text-xs text-muted-foreground text-center">Loading coupons...</p>
          ) : promoCodes.length === 0 ? (
            <p className="p-6 text-xs text-muted-foreground text-center">No promo codes created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/20 text-[10px] tracking-wider uppercase text-muted-foreground">
                    <th className="p-4 font-light">Code</th>
                    <th className="p-4 font-light">Type/Value</th>
                    <th className="p-4 font-light">Usage Stats</th>
                    <th className="p-4 font-light">Expires At</th>
                    <th className="p-4 font-light">Status</th>
                    <th className="p-4 font-light text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-light">
                  {promoCodes.map(promo => (
                    <tr key={promo.id} className="border-b border-border/60 hover:bg-secondary/10 transition-colors">
                      {/* Code */}
                      <td className="p-4 font-medium tracking-wider text-foreground">{promo.code}</td>
                      
                      {/* Value */}
                      <td className="p-4">
                        {promo.type === "percentage" ? (
                          <span className="bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-sm text-[11px]">
                            {promo.value}% Off
                          </span>
                        ) : (
                          <span className="bg-blue-500/10 text-blue-600 px-2 py-1 rounded-sm text-[11px]">
                            {promo.value} EGP Off
                          </span>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">Min Order: {promo.min_order_amount} EGP</p>
                      </td>

                      {/* Usage Stats */}
                      <td className="p-4">
                        <span className="font-mono text-foreground">{promo.used_count}</span> 
                        <span className="text-muted-foreground"> / {promo.usage_limit ?? "∞"}</span>
                        <p className="text-[10px] text-muted-foreground">Per User max: {promo.user_usage_limit}</p>
                      </td>

                      {/* Expiry */}
                      <td className="p-4 text-muted-foreground">
                        {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString() : "Never"}
                      </td>

                      {/* Status Button */}
                      <td className="p-4">
                        <button
                          onClick={() => toggleStatus(promo.id, promo.is_active)}
                          className="flex items-center gap-1.5 cursor-pointer outline-none"
                          title="Click to toggle status"
                        >
                          {promo.is_active ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <CheckCircle size={14} /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-500">
                              <XCircle size={14} /> Inactive
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(promo.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors cursor-pointer p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}