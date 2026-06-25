import { useState, useEffect, useRef } from 'react';
import { Plus, Edit3, Save, X, RefreshCw, Landmark } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';

const serif = { fontFamily: "'Playfair Display', serif" };

const parseCityName = (cityName: string) => {
  if (!cityName) return { en: "", ar: "" };
  if (cityName.includes(" || ")) {
    const parts = cityName.split(" || ");
    return {
      en: (parts[0] || "").trim(),
      ar: (parts[1] || "").trim(),
    };
  }
  const hasArabic = /[\u0600-\u06FF]/.test(cityName);
  if (hasArabic) {
    return { en: "", ar: cityName.trim() };
  }
  return { en: cityName.trim(), ar: "" };
};

export default function ShippingRates() {
  const shippingRates = useAdminStore((state) => state.shippingRates);
  const shippingRatesLoading = useAdminStore((state) => state.shippingRatesLoading);
  const shippingRatesError = useAdminStore((state) => state.shippingRatesError);
  const fetchShippingRates = useAdminStore((state) => state.fetchShippingRates);
  const addShippingRate = useAdminStore((state) => state.addShippingRate);
  const editShippingRate = useAdminStore((state) => state.editShippingRate);
  const removeShippingRate = useAdminStore((state) => state.removeShippingRate);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [newRate, setNewRate] = useState<string>('');
  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  const [addCityNameEn, setAddCityNameEn] = useState<string>('');
  const [addCityNameAr, setAddCityNameAr] = useState<string>('');
  const [addRate, setAddRate] = useState<string>('');
  const [addLoading, setAddLoading] = useState<boolean>(false);

  const fetchShippingRatesRef = useRef(fetchShippingRates);
  useEffect(() => {
    fetchShippingRatesRef.current = fetchShippingRates;
  }, [fetchShippingRates]);

  useEffect(() => {
    fetchShippingRatesRef.current();
  }, []); // intentionally empty: fetch once on mount

  const handleAddRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRate = parseFloat(addRate);
    if (!addCityNameEn.trim()) {
      alert('Please enter a valid English Governorate/City name');
      return;
    }
    if (!addRate || isNaN(parsedRate) || parsedRate < 0) {
      alert('Please enter a valid shipping rate');
      return;
    }
    const combinedCityName = addCityNameAr.trim()
      ? `${addCityNameEn.trim()} || ${addCityNameAr.trim()}`
      : addCityNameEn.trim();

    setAddLoading(true);
    try {
      await addShippingRate({ city_name: combinedCityName, rate: parsedRate });
      setAddCityNameEn('');
      setAddCityNameAr('');
      setAddRate('');
    } catch {
      alert('Failed to add shipping rate. Check server/validation.');
    } finally {
      setAddLoading(false);
    }
  };

  const startEdit = (id: number, rate: number) => {
    setEditingId(id);
    setNewRate(rate.toString());
  };

  const handleSave = async (id: number) => {
    const parsedRate = parseFloat(newRate);
    if (!newRate || isNaN(parsedRate) || parsedRate < 0) {
      alert('Please enter a valid shipping rate');
      return;
    }
    setSaveLoading(true);
    try {
      await editShippingRate(id, { rate: parsedRate });
      setEditingId(null);
    } catch {
      alert('Failed to update shipping rate');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this shipping rate?')) return;
    try {
      await removeShippingRate(id);
    } catch {
      alert('Failed to delete shipping rate');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-wide" style={serif}>
            Logistics &amp; Fulfillment Costs · Egypt Governorate Ledger
          </h1>
          {/* <p className="text-[10px] tracking-[0.2em] uppercase text-white/25 mt-0.5">
            Logistics &amp; Fulfillment Costs · Egypt Governorate Ledger
          </p> */}
        </div>
      </div>

      {/* Add Rate Form Card */}
      <div
        className="rounded-3xl border border-white/6 p-5 sm:p-6"
        style={{ background: '#0d0d0d' }}
      >
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/4">
          <Landmark size={15} className="text-[#d4a853]" />
          <span className="text-xs uppercase tracking-[0.15em] text-white/80 font-medium" style={serif}>
            Add Governorate Rate
          </span>
        </div>

        <form onSubmit={handleAddRate} className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
            <label className="text-[9px] tracking-[0.15em] uppercase text-white/35">
              Governorate / City (EN)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cairo"
              value={addCityNameEn}
              onChange={(e) => setAddCityNameEn(e.target.value)}
              className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
            <label className="text-[9px] tracking-[0.15em] uppercase text-white/35">
              Governorate / City (AR - Optional)
            </label>
            <input
              type="text"
              placeholder="مثال: القاهرة"
              value={addCityNameAr}
              onChange={(e) => setAddCityNameAr(e.target.value)}
              dir="rtl"
              className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full text-right font-serif"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:w-48">
            <label className="text-[9px] tracking-[0.15em] uppercase text-white/35">
              Rate (EGP)
            </label>
            <input
              type="number"
              placeholder="50"
              value={addRate}
              onChange={(e) => setAddRate(e.target.value)}
              className="bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors w-full"
            />
          </div>

          <button
            type="submit"
            disabled={addLoading}
            className="bg-[#d4a853] text-black text-[10px] tracking-[0.2em] uppercase font-semibold px-5 py-2.5 rounded-xl hover:bg-[#e8bb65] transition-colors cursor-pointer flex items-center justify-center gap-2 h-[38px] disabled:opacity-50"
          >
            {addLoading ? (
              <RefreshCw size={12} className="animate-spin text-black" />
            ) : (
              <Plus size={12} />
            )}
            Add Rate
          </button>
        </form>
      </div>

      {/* Shipping Rates Ledger Table Card */}
      <div
        className="rounded-3xl border border-white/6 p-5 sm:p-6"
        style={{ background: '#0d0d0d' }}
      >
        {shippingRatesLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
            <RefreshCw size={24} className="animate-spin text-white/30" />
            <span className="text-[11px] text-white/30 tracking-[0.15em] uppercase">
              Loading logistics ledger...
            </span>
          </div>
        ) : shippingRatesError ? (
          <div className="text-center min-h-[300px] flex flex-col items-center justify-center">
            <p className="text-white/40 text-xs mb-4">{shippingRatesError}</p>
            <button
              onClick={fetchShippingRates}
              className="bg-white/4 border border-white/8 text-[10px] tracking-[0.15em] uppercase text-white/50 hover:text-white/80 hover:border-white/20 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : shippingRates.length === 0 ? (
          <div className="text-center min-h-[300px] flex flex-col items-center justify-center">
            <Landmark size={32} className="text-white/10 mb-4" />
            <p className="text-white/30 text-xs">No logistics rates configured yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-white/25 uppercase text-[9px] tracking-wider select-none">
                  <th className="pb-3 px-4 font-medium">Governorate / Region</th>
                  <th className="pb-3 px-4 font-medium">Delivery Cost</th>
                  <th className="pb-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {shippingRates.map((item) => (
                  <tr key={item.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-4 font-light text-white/80 text-[13px]">
                      {(() => {
                        const { en, ar } = parseCityName(item.city_name);
                        return (
                          <div className="space-y-1">
                            <span className="text-white/80">{en}</span>
                            {ar && (
                              <span className="block text-[10px] text-white/35 font-serif" dir="rtl">
                                {ar}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-2 max-w-[150px]">
                          <input
                            type="number"
                            value={newRate}
                            onChange={(e) => setNewRate(e.target.value)}
                            className="bg-white/4 border border-white/8 rounded-xl px-2 py-1.5 text-[11px] text-white outline-none focus:border-[#d4a853]/40 w-24"
                            autoFocus
                          />
                          <span className="text-[11px] text-white/40">EGP</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium tracking-wider bg-white/4 text-white/70 border border-white/8 uppercase">
                          {item.rate} EGP
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {editingId === item.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSave(item.id)}
                            disabled={saveLoading}
                            className="bg-[#d4a853] text-black text-[9px] tracking-[0.15em] uppercase font-semibold px-3 py-1.5 rounded-lg hover:bg-[#e8bb65] transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                          >
                            {saveLoading ? (
                              <RefreshCw size={10} className="animate-spin text-black" />
                            ) : (
                              <Save size={10} />
                            )}
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-white/4 border border-white/8 text-[9px] tracking-[0.1em] uppercase text-white/50 hover:text-white/80 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <X size={10} />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEdit(item.id, item.rate)}
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-white/4 border border-white/8 text-white/50 hover:text-white hover:border-white/20 transition-all cursor-pointer gap-1.5 text-[9px] uppercase tracking-wider font-medium"
                          >
                            <Edit3 size={11} />
                            Edit Cost
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}