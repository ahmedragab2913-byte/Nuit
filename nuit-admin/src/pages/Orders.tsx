import { useState, useEffect } from "react";
import { Search, RefreshCw, Phone, MapPin, X, ArrowRight } from "lucide-react";
import { useAdminStore } from "../store/adminStore";
import type { Order } from "../types";

const serif = { fontFamily: "'Playfair Display', serif" };

const statusColor = (s: string) => {
  switch (s) {
    case "delivered":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "processing":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "pending":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "confirmed":
      return "bg-violet-500/10 text-violet-400 border-violet-500/20";
    case "preparing":
      return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    case "shipped":
      return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-white/4 text-white/40 border-white/8";
  }
};

const paymentStatusColor = (s: string) => {
  switch (s) {
    case "paid":
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "pending":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "failed":
      return "text-red-400 bg-red-500/10 border-red-500/20";
    default:
      return "text-white/40 bg-white/4 border-white/8";
  }
};

export default function Orders() {
  const {
    orders,
    ordersLoading: loading,
    ordersError: error,
    ordersSearchQuery,
    ordersStatusFilter,
    setOrdersFilter,
    fetchOrders,
    updateStatus
  } = useAdminStore();

  // Initialise from store so input matches persisted filter on re-mount
  const [search, setSearch] = useState(ordersSearchQuery);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Sync search input with Zustand store filter with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setOrdersFilter(search, ordersStatusFilter);
    }, 400);

    return () => clearTimeout(handler);
  }, [search, ordersStatusFilter, setOrdersFilter]);

  const handleStatusChange = async (id: string, newStatus: Order["status"]) => {
    try {
      setUpdatingId(id);
      await updateStatus(id, newStatus);
      // Sync selected order view if open
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus,
          payment_status:
            newStatus === "delivered"
              ? "paid"
              : newStatus === "cancelled"
              ? "failed"
              : selectedOrder.payment_status,
        });
      }
    } catch (err: unknown) {
      console.error(err);
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.customer.toLowerCase().includes(ordersSearchQuery.toLowerCase()) ||
      o.id.toString().includes(ordersSearchQuery) ||
      o.products.toLowerCase().includes(ordersSearchQuery.toLowerCase()) ||
      (o.phone && o.phone.includes(ordersSearchQuery));

    const matchesFilter = ordersStatusFilter === "All" || o.status === ordersStatusFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-wide" style={serif}>
            Customer Fulfillment Ledger
          </h1>
          {/* <p className="text-[10px] tracking-[0.2em] uppercase text-white/25 mt-0.5">
             · Maison Nuit
          </p> */}
        </div>
        <button
          onClick={fetchOrders}
          className="bg-white/4 border border-white/8 text-[10px] tracking-[0.15em] uppercase text-white/50 hover:text-white/80 hover:border-white/20 px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh Registry
        </button>
      </div>

      {/* Filter Tabs & Search Row */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 xl:pb-0 scrollbar-thin">
          {["All", "Pending", "Confirmed", "Preparing", "Shipped", "Delivered", "Cancelled"].map(filter => (
            <button
              key={filter}
              onClick={() => setOrdersFilter(search, filter)}
              className={`px-4 py-2.5 text-[9px] tracking-[0.15em] uppercase rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                ordersStatusFilter === filter
                  ? "bg-[#d4a853] text-black font-semibold"
                  : "bg-white/4 border border-white/8 text-white/50 hover:text-white hover:border-white/20"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full xl:max-w-sm">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            placeholder="Search orders, clients, phone, items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/4 border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div 
        className="rounded-3xl border border-white/6 p-5 sm:p-6"
        style={{ background: "#0d0d0d" }}
      >
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white/4 rounded-2xl h-14" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center min-h-[300px] flex flex-col items-center justify-center">
            <p className="text-white/40 text-xs mb-4">{error}</p>
            <button 
              onClick={fetchOrders} 
              className="bg-white/4 border border-white/8 text-[10px] tracking-[0.15em] uppercase text-white/50 hover:text-white/80 hover:border-white/20 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center min-h-[300px] flex flex-col items-center justify-center">
            <p className="text-white/30 text-xs">No orders match the active filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs min-w-[900px]">
              <thead>
                <tr className="border-b border-white/5 text-white/25 uppercase text-[9px] tracking-wider select-none">
                  <th className="pb-3 px-4 font-medium">Order ID</th>
                  <th className="pb-3 px-4 font-medium">Customer</th>
                  <th className="pb-3 px-4 font-medium">Fulfillment Date</th>
                  <th className="pb-3 px-4 font-medium text-right">Amount</th>
                  <th className="pb-3 px-4 font-medium">Payment Status</th>
                  <th className="pb-3 px-4 font-medium text-center">Fulfillment Status</th>
                  <th className="pb-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {filteredOrders.map((o) => (
                  <tr 
                    key={o.id} 
                    className="hover:bg-white/2 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(o)}
                  >
                    <td className="py-4 px-4">
                      <span className="text-white font-mono text-[11px] font-medium">
                        {o.order_number || `#NU-${o.id}`}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-white/80 font-light text-[12px]">{o.customer}</div>
                      <div className="text-[10px] text-white/30">{o.email}</div>
                    </td>
                    <td className="py-4 px-4 text-white/45 font-light">
                      {o.date}
                    </td>
                    <td className="py-4 px-4 text-right text-white font-light font-mono">
                      EGP {o.total.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-[10px] text-white/40 uppercase tracking-wide">
                          {(o.payment_method || "cod").replace("_", " ")}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-medium border uppercase tracking-wider ${paymentStatusColor(o.payment_status || "pending")}`}>
                          {o.payment_status || "pending"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider border font-medium ${statusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as Order["status"])}
                        className="bg-[#111111] border border-white/8 rounded-xl px-2.5 py-1.5 text-[10px] text-white/70 outline-none focus:border-[#d4a853]/40 transition-colors cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Drawer for Order Detail */}
      {selectedOrder && (
        <>
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />
          {/* Drawer container */}
          <div 
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0a0a0a] border-l border-white/8 shadow-2xl flex flex-col transition-transform duration-300 ease-out transform translate-x-0"
          >
            {/* Drawer — scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/4">
                <div>
                  <span className="text-[10px] tracking-[0.18em] uppercase text-[#d4a853] font-semibold">
                    Order Ledger Details
                  </span>
                  <h3 className="text-lg font-light text-white tracking-wide font-mono mt-0.5">
                    {selectedOrder.order_number || `#NU-${selectedOrder.id}`}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-white/30 hover:text-white p-2 rounded-xl bg-white/4 border border-white/8 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Status Update Control */}
              <div className="bg-white/4 border border-white/8 rounded-2xl p-4 space-y-3">
                <label className="block text-[9px] tracking-[0.15em] uppercase text-white/35 font-medium">
                  Update Fulfillment Status
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as Order["status"])}
                    disabled={updatingId !== null}
                    className="bg-[#111111] border border-white/8 rounded-xl px-3 py-2 text-[11px] text-white/80 outline-none focus:border-[#d4a853]/40 transition-colors w-full cursor-pointer disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {updatingId && (
                    <RefreshCw size={14} className="animate-spin text-[#d4a853]" />
                  )}
                </div>
              </div>

              {/* Customer Details section */}
              <div className="space-y-3.5 pt-2">
                <div>
                  <h4 className="text-[9px] tracking-[0.15em] uppercase text-white/35">Client Account</h4>
                  <p className="text-sm font-medium text-white/90 mt-1" style={serif}>{selectedOrder.customer}</p>
                  <p className="text-xs text-white/45">{selectedOrder.email}</p>
                  {selectedOrder.phone && (
                    <a 
                      href={`tel:${selectedOrder.phone}`}
                      className="inline-flex items-center gap-1.5 text-xs text-[#d4a853] hover:underline mt-1"
                    >
                      <Phone size={12} />
                      {selectedOrder.phone}
                    </a>
                  )}
                </div>

                <hr className="border-white/4" />

                <div>
                  <h4 className="text-[9px] tracking-[0.15em] uppercase text-white/35">Delivery Address</h4>
                  {selectedOrder.address ? (
                    <div className="flex items-start gap-2 text-xs text-white/60 font-light mt-1.5 leading-relaxed">
                      <MapPin size={13} className="text-[#d4a853] mt-0.5 flex-shrink-0" />
                      <div>{selectedOrder.address}</div>
                    </div>
                  ) : (
                    <p className="text-xs text-white/20 italic mt-1">No address supplied</p>
                  )}
                </div>

                <hr className="border-white/4" />

                {/* Items Purchased List */}
                <div>
                  <h4 className="text-[9px] tracking-[0.15em] uppercase text-white/35">Manifest Details</h4>
                  <div className="mt-2 bg-white/3 rounded-2xl border border-white/6 p-3.5 space-y-2.5">
                    {selectedOrder.products.split(",").map((p, idx) => (
                      <div key={idx} className="flex items-start gap-2 justify-between text-xs font-light text-white/80">
                        <div className="flex gap-2">
                          <span className="text-[#d4a853] font-semibold">•</span>
                          <span>{p.trim()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer: Pricing Breakdown — always visible */}
            <div className="p-6 pt-4 border-t border-white/4 space-y-3.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/35 uppercase tracking-wider">Payment Method</span>
                <span className="text-white/70 uppercase tracking-wider font-mono">
                  {(selectedOrder.payment_method || "cod").replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/35 uppercase tracking-wider">Payment Status</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-medium border uppercase tracking-wider ${paymentStatusColor(selectedOrder.payment_status || "pending")}`}>
                  {selectedOrder.payment_status || "pending"}
                </span>
              </div>
              <hr className="border-white/4" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">Total Invoice</span>
                <span className="text-lg font-light text-[#d4a853] font-mono">
                  EGP {selectedOrder.total.toLocaleString()}
                </span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-[#d4a853] text-black text-[10px] tracking-[0.2em] uppercase font-semibold py-3 rounded-xl hover:bg-[#e8bb65] transition-colors cursor-pointer mt-2 flex items-center justify-center gap-1.5"
              >
                Close Drawer
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
