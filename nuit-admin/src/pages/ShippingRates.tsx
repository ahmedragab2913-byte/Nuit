import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Plus } from 'lucide-react';
// استيراد الدوال الـ clean من ملف الـ api بتاعك
import { getAdminShippingRates, createShippingRate, updateShippingRate, type ShippingRate } from '../services/api'; 

export default function ShippingRates() {
  const { isAuthenticated } = useAuthStore();
  
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newRate, setNewRate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [addCityName, setAddCityName] = useState<string>('');
  const [addRate, setAddRate] = useState<string>('');
  const [addLoading, setAddLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRates();
    }
  }, [isAuthenticated]);

  const fetchRates = async () => {
    try {
      const data = await getAdminShippingRates();
      setRates(data);
    } catch (error) {
      console.error('Error fetching rates', error);
      setRates([]);
    }
  };

  const handleAddRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRate = parseFloat(addRate);

    if (!addCityName.trim()) {
      alert('Please enter a valid Governorate/City name');
      return;
    }
    if (!addRate || isNaN(parsedRate) || parsedRate < 0) {
      alert('Please enter a valid shipping rate');
      return;
    }

    setAddLoading(true);
    try {
      const responseData = await createShippingRate({
        city_name: addCityName.trim(),
        rate: parsedRate
      });

      // 🛡️ لقط الكائن الجديد بأمان حسب رد الباكيند لوكال
      const createdItem = responseData?.data || responseData;
      
      if (createdItem && typeof createdItem === 'object' && ('id' in createdItem || 'city_name' in createdItem)) {
        setRates(prev => [...prev, createdItem]);
      } else {
        fetchRates(); // Fallback لإعادة جلب البيانات في حال اختلف الـ Structure
      }
      
      setAddCityName('');
      setAddRate('');
    } catch (error: any) {
      console.error(error);
      alert('Failed to add shipping rate. Check server/validation.');
    } finally {
      setAddLoading(false);
    }
  };

  const startEdit = (item: ShippingRate) => {
    setEditingId(item.id);
    setNewRate(item.rate.toString()); 
  };

  const handleSave = async (id: number) => {
    const parsedRate = parseFloat(newRate);

    if (!newRate || isNaN(parsedRate) || parsedRate < 0) {
      alert('Please enter a valid shipping rate');
      return;
    }
    
    setLoading(true);
    try {
      await updateShippingRate(id, { rate: parsedRate });
      setRates(prev => prev.map(item => item.id === id ? { ...item, rate: parsedRate } : item));
      setEditingId(null);
    } catch (error) {
      console.error(error);
      alert('Failed to update shipping rate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#070707] min-h-screen text-white">
      <div className="mb-6">
        <h1 className="text-l text-white/30">Adjust shipping costs for Egypt governorates</h1>
      </div>

      <form onSubmit={handleAddRate} className="mb-6 p-4 border border-white/5 rounded bg-[#0a0a0a] flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Governorate / City</label>
          <input
            type="text"
            placeholder="e.g. Alexandria, Cairo, Giza..."
            value={addCityName}
            onChange={(e) => setAddCityName(e.target.value)}
            className="bg-[#050505] border border-white/10 px-3 py-2 rounded text-xs text-white outline-none focus:border-white/30 placeholder:text-white/20 transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5 w-40">
          <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Rate (EGP)</label>
          <input
            type="number"
            placeholder="50"
            value={addRate}
            onChange={(e) => setAddRate(e.target.value)}
            className="bg-[#050505] border border-white/10 px-3 py-2 rounded text-xs text-white outline-none focus:border-white/30 placeholder:text-white/20 transition-all"
          />
        </div>

        <div className="flex flex-col justify-end h-full pt-5">
          <button
            type="submit"
            disabled={addLoading}
            className="bg-white text-black text-[11px] font-medium tracking-wide uppercase px-4 py-2 rounded flex items-center gap-2 hover:bg-white/90 disabled:opacity-50 transition-all cursor-pointer h-[38px]"
          >
            <Plus size={14} />
            {addLoading ? 'Adding...' : 'Add Rate'}
          </button>
        </div>
      </form>

      <div className="border border-white/10 rounded bg-[#0a0a0a] overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/10 text-[10px] uppercase font-bold text-white/40 tracking-wider">
              <th className="p-3">Governorate (City)</th>
              <th className="p-3">Rate (EGP)</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rates.length > 0 ? (
              rates.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] text-white/90 transition-colors">
                  <td className="p-3 font-medium text-white/70">{item.city_name}</td>
                  <td className="p-3">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={newRate}
                        onChange={(e) => setNewRate(e.target.value)}
                        className="bg-[#050505] border border-white/20 px-2 py-1 rounded w-28 outline-none focus:border-white text-xs text-white"
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold text-white">{item.rate} EGP</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {editingId === item.id ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleSave(item.id)} 
                          disabled={loading}
                          className="bg-white text-black px-3 py-1 rounded font-medium hover:bg-white/90 text-[11px] disabled:opacity-50 transition-all"
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          className="border border-white/10 px-3 py-1 rounded hover:bg-white/[0.05] text-[11px] text-white/60 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => startEdit(item)}
                        className="text-white hover:underline font-medium opacity-80 hover:opacity-100 transition-all"
                      >
                        Edit Rate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-8 text-center text-white/20 tracking-wider text-[11px] uppercase">
                  No shipping rates defined yet. Use the form above to add your first city.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}