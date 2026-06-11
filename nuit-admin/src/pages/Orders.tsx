import { useState, useEffect } from "react";
import { Search, RefreshCw, Phone, MapPin } from "lucide-react";
import { getOrders, updateOrderStatus } from "../services/api";
import type { Order } from "../types";

const statusColor = (s: string) => ({
  delivered:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  processing: "bg-amber-500/10  text-amber-400  border-amber-500/20",
  pending:    "bg-blue-500/10   text-blue-400   border-blue-500/20",
  confirmed:  "bg-violet-500/10 text-violet-400 border-violet-500/20",
  preparing:  "bg-orange-500/10 text-orange-400 border-orange-500/20",
  shipped:    "bg-cyan-500/10   text-cyan-400   border-cyan-500/20",
  cancelled:  "bg-red-500/10    text-red-400    border-red-500/20",
}[s] ?? "bg-zinc-500/10 text-zinc-400");

const paymentStatusColor = (s: string) => ({
  paid:    "text-emerald-400",
  pending: "text-amber-400",
  failed:  "text-red-400",
}[s] ?? "text-zinc-400");

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchOrdersList = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrders();
      setOrders(data);
    } catch (err: any) {
      console.error("Failed to load orders:", err);
      setError("Failed to load orders data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersList();
  }, []);

  const handleStatusChange = async (id: string, newStatus: Order["status"]) => {
    try {
      await updateOrderStatus(id, newStatus);
      setOrders(prev =>
        prev.map(o =>
          o.id === id
            ? {
                ...o,
                status: newStatus,
                // Sync payment status: if order is delivered, mark as paid; if cancelled, mark as failed
                payment_status:
                  newStatus === "delivered"
                    ? "paid"
                    : newStatus === "cancelled"
                    ? "failed"
                    : o.payment_status,
              }
            : o
        )
      );
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toString().includes(search) ||
      o.products.toLowerCase().includes(search.toLowerCase()) ||
      (o.phone && o.phone.includes(search));

    const matchesFilter = statusFilter === "All" || o.status === statusFilter.toLowerCase();

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
            placeholder="Search orders, clients, phone, items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/4 border border-white/8 rounded-sm pl-9 pr-4 py-2 text-xs text-white/60 placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Filter Selection */}
        <div className="flex flex-wrap items-center gap-2">
          {["All", "Pending", "Confirmed", "Preparing", "Shipped", "Delivered", "Cancelled"].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 text-[9px] uppercase tracking-wider rounded-sm border transition-all cursor-pointer ${
                statusFilter === filter
                  ? "bg-white text-black border-white font-medium"
                  : "text-white/40 border-white/5 hover:text-white/70 hover:border-white/10"
              }`}
            >
              {filter}
            </button>
          ))}
          <button
            onClick={fetchOrdersList}
            className="p-1.5 text-white/30 hover:text-white transition-colors border border-white/5 hover:border-white/15 rounded-sm cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="bg-white/4 border border-white/5 rounded-md p-10 flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <RefreshCw size={24} className="animate-spin text-white/30" />
          <span className="text-xs text-white/30 tracking-wider">Loading orders CRM...</span>
        </div>
      ) : error ? (
        <div className="bg-white/4 border border-white/5 rounded-md p-10 text-center min-h-[40vh] flex flex-col items-center justify-center">
          <p className="text-white/40 text-xs mb-4">{error}</p>
          <button onClick={fetchOrdersList} className="border border-white/10 hover:border-white/20 px-5 py-2 text-[10px] uppercase tracking-wider text-white/60 hover:text-white cursor-pointer">Retry</button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white/4 border border-white/5 rounded-md p-10 text-center min-h-[40vh] flex flex-col items-center justify-center">
          <p className="text-white/30 text-xs">No orders match the active filters.</p>
        </div>
      ) : (
        <div className="bg-white/4 border border-white/5 rounded-md overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/1 text-white/30 uppercase text-[9px] tracking-wider select-none">
                <th className="py-3 px-4 font-medium">Order #</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Items</th>
                <th className="py-3 px-4 font-medium">Delivery Address</th>
                <th className="py-3 px-4 font-medium text-right">Total</th>
                <th className="py-3 px-4 font-medium">Payment</th>
                <th className="py-3 px-4 font-medium text-center">Status</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium text-right">Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/1 transition-colors">
                  <td className="py-4 px-4">
                    <span className="text-white font-mono text-[10px]">{o.order_number || `#NU-${o.id}`}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-white/80 font-light text-[11px]">{o.customer}</div>
                    <div className="text-[10px] text-white/30">{o.email}</div>
                    {o.phone && (
                      <div className="text-[10px] text-white/30 flex items-center gap-1 mt-0.5">
                        <Phone size={8} /> {o.phone}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-white/55 font-light max-w-[160px] truncate" title={o.products}>
                    {o.products}
                  </td>
                  <td className="py-4 px-4">
                    {o.address ? (
                      <div className="flex flex-col gap-0.5 text-[10px] text-white/40 font-light max-w-[140px]">
                        <MapPin size={9} className="flex-shrink-0 text-white/20" />
                        {o.address.split(',').map((part, idx) => (
                          <span key={idx} className="truncate">{part.trim()}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-white/20 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right text-white font-light">EGP {o.total.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <div className="text-[10px] text-white/50 capitalize">{(o.payment_method || "cod").replace("_", " ")}</div>
                    <div className={`text-[10px] font-semibold ${paymentStatusColor(o.payment_status || "pending")}`}>
                      {o.payment_status || "pending"}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider border ${statusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-white/45 font-light whitespace-nowrap">{o.date}</td>
                  <td className="py-4 px-4 text-right">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value as Order["status"])}
                      className="bg-white/5 border border-white/10 rounded-sm text-[10px] text-white/60 px-2 py-1 outline-none focus:border-white/20 transition-all cursor-pointer"
                    >
                      <option value="pending" className="bg-[#0c0c0c] text-white">Pending</option>
                      <option value="confirmed" className="bg-[#0c0c0c] text-white">Confirmed</option>
                      <option value="preparing" className="bg-[#0c0c0c] text-white">Preparing</option>
                      <option value="shipped" className="bg-[#0c0c0c] text-white">Shipped</option>
                      <option value="delivered" className="bg-[#0c0c0c] text-white">Delivered</option>
                      <option value="cancelled" className="bg-[#0c0c0c] text-white">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
