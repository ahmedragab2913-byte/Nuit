import { useState, useEffect } from "react";
import { Search, RefreshCw, Award } from "lucide-react";
import { getCustomers } from "../services/api";
import type { Customer } from "../types";

const statusColor = (s: string) => ({
  vip:        "bg-amber-500/10  text-amber-400  border-amber-500/20",
  regular:    "bg-blue-500/10   text-blue-400   border-blue-500/20",
  new:        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
}[s] ?? "bg-zinc-500/10 text-zinc-400");

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchCustomersList = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomers();
      setCustomers(data);
    } catch (err: any) {
      console.error("Failed to load customers:", err);
      setError("Failed to load customers catalog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomersList();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = statusFilter === "All" || c.status === statusFilter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            placeholder="Search customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/4 border border-white/8 rounded-sm pl-9 pr-4 py-2 text-xs text-white/60 placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Filter Selection */}
        <div className="flex items-center gap-3">
          {["All", "VIP", "Regular", "New"].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 text-[10px] uppercase tracking-wider rounded-sm border transition-all cursor-pointer ${
                statusFilter === filter 
                  ? "bg-white text-black border-white font-medium" 
                  : "text-white/40 border-white/5 hover:text-white/70 hover:border-white/10"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="bg-white/4 border border-white/5 rounded-md p-10 flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <RefreshCw size={24} className="animate-spin text-white/30" />
          <span className="text-xs text-white/30 tracking-wider">Loading customer registry...</span>
        </div>
      ) : error ? (
        <div className="bg-white/4 border border-white/5 rounded-md p-10 text-center min-h-[40vh] flex flex-col items-center justify-center">
          <p className="text-white/40 text-xs mb-4">{error}</p>
          <button onClick={fetchCustomersList} className="border border-white/10 hover:border-white/20 px-5 py-2 text-[10px] uppercase tracking-wider text-white/60 hover:text-white cursor-pointer">Retry</button>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white/4 border border-white/5 rounded-md p-10 text-center min-h-[40vh] flex flex-col items-center justify-center">
          <p className="text-white/30 text-xs">No customers match the active filters.</p>
        </div>
      ) : (
        <div className="bg-white/4 border border-white/5 rounded-md overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/1 text-white/30 uppercase text-[9px] tracking-wider select-none">
                <th className="py-3 px-6 font-medium">Customer ID</th>
                <th className="py-3 px-4 font-medium">Client</th>
                <th className="py-3 px-4 font-medium text-right">Orders</th>
                <th className="py-3 px-4 font-medium text-right">Total Spent</th>
                <th className="py-3 px-4 font-medium text-center">Status</th>
                <th className="py-3 px-6 font-medium text-right">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/1 transition-colors">
                  <td className="py-4 px-6 text-white/45">#{c.id}</td>
                  <td className="py-4 px-4 font-light text-white">{c.name}</td>
                  <td className="py-4 px-4 text-right text-white/70 font-light">{c.orders} orders</td>
                  <td className="py-4 px-4 text-right text-white font-light">EGP {c.spent.toLocaleString()}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider border ${statusColor(c.status)}`}>
                      {c.status === "vip" && <Award size={10} />}
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right text-white/45 font-light">{c.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
