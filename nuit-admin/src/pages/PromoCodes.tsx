import React, { useState, useEffect } from "react";
import { Plus, Trash2, Ticket, RefreshCw, AlertCircle } from "lucide-react";
import { useAdminStore } from "../store/adminStore";
import { extractErrorMessage } from "../services/api";

const serif = { fontFamily: "'Playfair Display', serif" };

const defaultForm = {
  code: "",
  type: "percentage",
  value: "",
  min_order_amount: "0",
  max_discount_amount: "",
  usage_limit: "",
  user_usage_limit: "1",
  expires_at: "",
  is_active: true,
};

export default function PromoCodes() {
  const {
    promoCodes,
    promoCodesLoading,
    fetchPromoCodes,
    addPromoCode,
    togglePromoStatus,
    removePromoCode,
  } = useAdminStore();

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) return;
    setFormLoading(true);
    setFormError(null);
    try {
      await addPromoCode({
        ...formData,
        value: Number(formData.value),
        min_order_amount: Number(formData.min_order_amount),
        max_discount_amount: formData.max_discount_amount
          ? Number(formData.max_discount_amount)
          : null,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        user_usage_limit: Number(formData.user_usage_limit),
      });
      setFormData(defaultForm);
    } catch (err: unknown) {
      setFormError(extractErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      await togglePromoStatus(id, currentStatus);
    } catch {
      console.error("Error updating status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this promo code?")) return;
    try {
      await removePromoCode(id);
    } catch {
      console.error("Error deleting promo code");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-wide" style={serif}>
            Storefront Vouchers &amp; Campaigns
          </h1>
          {/* <p className="text-[10px] tracking-[0.2em] uppercase text-white/25 mt-0.5">
            Maison Nuit 
          </p> */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form Panel (Left 1/3) */}
        <div
          className="rounded-3xl border border-white/6 p-5 sm:p-6 lg:sticky lg:top-6"
          style={{ background: "#0d0d0d" }}
        >
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/4">
            <Ticket size={16} className="text-[#d4a853]" />
            <h3
              className="text-sm uppercase tracking-[0.15em] text-white/80 font-medium"
              style={serif}
            >
              Create Coupon
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">
                Coupon Code
              </label>
              <input
                type="text"
                required
                placeholder="E.g., NUIT10"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="bg-[#111111] border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 outline-none focus:border-[#d4a853]/40 transition-colors w-full"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (EGP)</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">
                  Value
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder={formData.type === "percentage" ? "10" : "200"}
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">
                  Min Order (EGP)
                </label>
                <input
                  type="number"
                  value={formData.min_order_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, min_order_amount: e.target.value })
                  }
                  className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full"
                />
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">
                  Max Discount (EGP)
                </label>
                <input
                  type="number"
                  placeholder="Optional"
                  value={formData.max_discount_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, max_discount_amount: e.target.value })
                  }
                  className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">
                  Total Usage Limit
                </label>
                <input
                  type="number"
                  placeholder="∞"
                  value={formData.usage_limit}
                  onChange={(e) =>
                    setFormData({ ...formData, usage_limit: e.target.value })
                  }
                  className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full"
                />
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">
                  Limit Per User
                </label>
                <input
                  type="number"
                  value={formData.user_usage_limit}
                  onChange={(e) =>
                    setFormData({ ...formData, user_usage_limit: e.target.value })
                  }
                  className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 mb-1.5">
                Expiry Date
              </label>
              <input
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="bg-[#111111] border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 outline-none focus:border-[#d4a853]/40 transition-colors w-full"
              />
            </div>

            {/* Inline form error */}
            {formError && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/8 border border-red-500/20 text-[10px] text-red-400">
                <AlertCircle size={12} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={formLoading}
              className="bg-[#d4a853] text-black text-[10px] tracking-[0.2em] uppercase font-semibold px-5 py-2.5 rounded-xl hover:bg-[#e8bb65] transition-colors cursor-pointer flex items-center justify-center gap-2 w-full mt-4 disabled:opacity-50"
            >
              {formLoading ? (
                <RefreshCw size={12} className="animate-spin text-black" />
              ) : (
                <Plus size={14} />
              )}
              Create Coupon
            </button>
          </form>
        </div>

        {/* Coupons List Panel (Right 2/3) */}
        <div
          className="lg:col-span-2 rounded-3xl border border-white/6 p-5 sm:p-6"
          style={{ background: "#0d0d0d" }}
        >
          {promoCodesLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
              <RefreshCw size={24} className="animate-spin text-white/30" />
              <span className="text-[11px] text-white/30 tracking-[0.15em] uppercase">
                Loading coupons...
              </span>
            </div>
          ) : promoCodes.length === 0 ? (
            <div className="text-center min-h-[350px] flex flex-col items-center justify-center">
              <Ticket size={32} className="text-white/10 mb-4" />
              <p className="text-white/30 text-xs">No active campaign coupons found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-white/25 uppercase text-[9px] tracking-wider select-none">
                    <th className="pb-3 px-4 font-medium">Code</th>
                    <th className="pb-3 px-4 font-medium">Reduction</th>
                    <th className="pb-3 px-4 font-medium text-center">Usage Stats</th>
                    <th className="pb-3 px-4 font-medium text-center">Expiry</th>
                    <th className="pb-3 px-4 font-medium text-center">Status</th>
                    <th className="pb-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {promoCodes.map((promo) => (
                    <tr key={promo.id} className="hover:bg-white/2 transition-colors">
                      {/* Code */}
                      <td className="py-4 px-4 font-medium tracking-wider text-white">
                        {promo.code}
                      </td>

                      {/* Value */}
                      <td className="py-4 px-4">
                        {promo.type === "percentage" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                            {promo.value}% Off
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                            {promo.value} EGP Off
                          </span>
                        )}
                        <p className="text-[10px] text-white/30 mt-1">
                          Min Order: {promo.min_order_amount} EGP
                        </p>
                      </td>

                      {/* Usage Stats */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-mono text-white/80">{promo.used_count}</span>{" "}
                        <span className="text-white/25">/ {promo.usage_limit ?? "∞"}</span>
                        <p className="text-[10px] text-white/30 mt-1">
                          Per User Limit: {promo.user_usage_limit}
                        </p>
                      </td>

                      {/* Expiry */}
                      <td className="py-4 px-4 text-center text-white/45 font-light">
                        {promo.expires_at
                          ? new Date(promo.expires_at).toLocaleDateString()
                          : "Never"}
                      </td>

                      {/* Status Button */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggle(promo.id, promo.is_active)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider border font-medium cursor-pointer transition-colors ${
                            promo.is_active
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-white/4 text-white/40 border-white/8 hover:bg-white/10"
                          }`}
                          title="Click to toggle status"
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${promo.is_active ? "bg-emerald-400" : "bg-white/30"}`}
                          />
                          {promo.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDelete(promo.id)}
                          className="inline-flex items-center justify-center p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                        >
                          <Trash2 size={12} />
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