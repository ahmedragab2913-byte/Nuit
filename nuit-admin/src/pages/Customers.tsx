import { useEffect, useState, useRef } from "react";
import { Search, Award, Users, X, Mail, Phone, MapPin, Calendar, DollarSign, ShoppingBag, Clock } from "lucide-react";
import { useAdminStore } from "../store/adminStore";
import { getCustomerDetail } from "../services/api";

const serif = { fontFamily: "'Playfair Display', serif" };

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (name[0] || "").toUpperCase();
};

const statusColor = (s: string) => {
  switch (s) {
    case "vip":
      return "bg-[#d4a853]/10 text-[#d4a853] border-[#d4a853]/20";
    case "regular":
      return "bg-violet-500/10 text-violet-400 border-violet-500/20";
    case "new":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    default:
      return "bg-white/4 text-white/40 border-white/8";
  }
};

const avatarColor = (s: string) => {
  switch (s) {
    case "vip":
      return "bg-[#d4a853]/10 text-[#d4a853] border border-[#d4a853]/20";
    case "regular":
      return "bg-violet-500/10 text-violet-400 border border-violet-500/20";
    case "new":
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    default:
      return "bg-white/4 text-white/40 border border-white/8";
  }
};

const orderStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "processing":
      return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    case "pending":
      return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    case "confirmed":
      return "text-violet-400 bg-violet-400/10 border-violet-400/20";
    case "preparing":
      return "text-orange-400 bg-orange-400/10 border-orange-400/20";
    case "shipped":
      return "text-cyan-400 bg-cyan-400/10 border-cyan-400/20";
    case "cancelled":
      return "text-red-400 bg-red-400/10 border-red-400/20";
    default:
      return "text-white/40 bg-white/4 border-white/8";
  }
};

export default function Customers() {
  const customers = useAdminStore((state) => state.customers);
  const customersLoading = useAdminStore((state) => state.customersLoading);
  const customersError = useAdminStore((state) => state.customersError);
  const customersSearchQuery = useAdminStore((state) => state.customersSearchQuery);
  const customersStatusFilter = useAdminStore((state) => state.customersStatusFilter);
  const fetchCustomers = useAdminStore((state) => state.fetchCustomers);
  const setCustomersFilter = useAdminStore((state) => state.setCustomersFilter);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [customerDetail, setCustomerDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const fetchCustomersRef = useRef(fetchCustomers);
  useEffect(() => {
    fetchCustomersRef.current = fetchCustomers;
  }, [fetchCustomers]);

  useEffect(() => {
    fetchCustomersRef.current();
  }, []); // intentionally empty: fetch once on mount

  const handleCustomerClick = async (id: number) => {
    setSelectedCustomerId(id);
    setLoadingDetail(true);
    setDetailError(null);
    setCustomerDetail(null);
    try {
      const data = await getCustomerDetail(id);
      setCustomerDetail(data);
    } catch (err: unknown) {
      setDetailError("Failed to load customer profile history.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(customersSearchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(customersSearchQuery.toLowerCase());
    const matchesFilter =
      customersStatusFilter === "All" ||
      c.status === customersStatusFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-wide" style={serif}>
            Client Directory &amp; Analytics 
          </h1>
        </div>
      </div>

      {/* Summary Stat Row */}
      <div
        className="flex flex-wrap items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-3xl border border-white/6"
        style={{ background: "#0d0d0d" }}
      >
        <div className="flex items-center gap-3 px-4 py-2 bg-white/4 rounded-2xl border border-white/4">
          <span className="text-[9px] tracking-[0.15em] uppercase text-white/35">Total Customers</span>
          <span className="text-sm font-semibold text-white">{customers.length}</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white/4 rounded-2xl border border-white/4">
          <span className="text-[9px] tracking-[0.15em] uppercase text-white/35">VIP Clients</span>
          <span className="text-sm font-semibold text-[#d4a853]">
            {customers.filter((c) => c.status === "vip").length}
          </span>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white/4 rounded-2xl border border-white/4">
          <span className="text-[9px] tracking-[0.15em] uppercase text-white/35">New This Month</span>
          <span className="text-sm font-semibold text-emerald-400">
            {customers.filter((c) => c.status === "new").length}
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            placeholder="Search customer name, email..."
            value={customersSearchQuery}
            onChange={(e) => setCustomersFilter(e.target.value, customersStatusFilter)}
            className="w-full bg-white/4 border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#d4a853]/40 transition-colors"
          />
        </div>

        {/* Filter Selection */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {["All", "VIP", "Regular", "New"].map((filter) => (
            <button
              key={filter}
              onClick={() => setCustomersFilter(customersSearchQuery, filter)}
              className={`px-4 py-2.5 text-[10px] tracking-[0.15em] uppercase rounded-xl transition-all cursor-pointer ${
                customersStatusFilter === filter
                  ? "bg-[#d4a853] text-black font-semibold"
                  : "bg-white/4 border border-white/8 text-white/50 hover:text-white hover:border-white/20"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {customersLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/4 rounded-3xl h-44" />
          ))}
        </div>
      ) : customersError ? (
        <div
          className="rounded-3xl border border-white/6 p-10 text-center min-h-[300px] flex flex-col items-center justify-center"
          style={{ background: "#0d0d0d" }}
        >
          <p className="text-white/40 text-xs mb-4">{customersError}</p>
          <button
            onClick={fetchCustomers}
            className="bg-white/4 border border-white/8 text-[10px] tracking-[0.15em] uppercase text-white/50 hover:text-white/80 hover:border-white/20 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div
          className="rounded-3xl border border-white/6 p-10 text-center min-h-[300px] flex flex-col items-center justify-center"
          style={{ background: "#0d0d0d" }}
        >
          <Users size={32} className="text-white/10 mb-4" />
          <p className="text-white/30 text-xs">No customers match the active filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCustomers.map((c) => {
            const initials = getInitials(c.name);
            const isVip = c.status === "vip";
            const phone = (c as { phone?: string }).phone;

            return (
              <div
                key={c.id}
                onClick={() => handleCustomerClick(c.id)}
                className="rounded-3xl border border-white/6 p-5 relative overflow-hidden flex flex-col justify-between h-44 cursor-pointer hover:border-white/20 transition-all hover:scale-[1.01] group"
                style={{ background: "#0d0d0d" }}
              >
                {/* Top Row: Avatar & Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold uppercase transition-colors group-hover:bg-white/10 ${avatarColor(c.status)}`}
                  >
                    {initials}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider border font-medium ${statusColor(c.status)}`}
                  >
                    {isVip && <Award size={10} />}
                    {c.status}
                  </span>
                </div>

                {/* Middle Row: Client Name, Email, Phone */}
                <div className="mt-3">
                  <h3
                    className="text-base font-light text-white tracking-wide truncate group-hover:text-[#d4a853] transition-colors"
                    style={serif}
                  >
                    {c.name}
                  </h3>
                  <p className="text-[10px] text-white/40 truncate mt-0.5">{c.email}</p>
                  {phone && (
                    <p className="text-[10px] text-white/30 truncate mt-0.5">{phone}</p>
                  )}
                </div>

                {/* Bottom Row: Spent, Orders count, Joined */}
                <div className="mt-4 pt-3 border-t border-white/4 flex items-center justify-between text-[10px] text-white/40">
                  <div>
                    <span className="font-mono text-white/80">{c.orders}</span> orders ·{" "}
                    <span className="font-semibold text-white/80">EGP {c.spent.toLocaleString()}</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-white/25">
                    Joined {c.joined}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Right Slide-over Drawer for Customer Profile Details & Order History ── */}
      {selectedCustomerId !== null && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
          {/* Backdrop Blur Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setSelectedCustomerId(null)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md h-full bg-[#0a0a0a] border-l border-white/8 shadow-2xl flex flex-col z-10 animate-slide-in">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-light text-white tracking-wide" style={serif}>
                  Client Profile
                </h2>
                <p className="text-[9px] tracking-wider uppercase text-white/25 mt-0.5">
                  Order fulfillment &amp; ledger history
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="text-white/35 hover:text-white p-2 rounded-xl bg-white/4 border border-white/8 transition-colors cursor-pointer"
                title="Close profile history"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetail ? (
                // Skeleton loading inside drawer
                <div className="space-y-6">
                  <div className="flex items-center gap-4 animate-pulse">
                    <div className="w-14 h-14 bg-white/4 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-white/4 rounded w-1/2" />
                      <div className="h-3 bg-white/4 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="space-y-3 animate-pulse">
                    <div className="h-8 bg-white/4 rounded-xl" />
                    <div className="h-8 bg-white/4 rounded-xl" />
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="space-y-3">
                    <div className="h-3 bg-white/4 rounded w-1/4" />
                    <div className="h-12 bg-white/4 rounded-2xl" />
                    <div className="h-12 bg-white/4 rounded-2xl" />
                  </div>
                </div>
              ) : detailError ? (
                <div className="text-center py-10 space-y-4">
                  <p className="text-xs text-red-400">{detailError}</p>
                  <button
                    onClick={() => handleCustomerClick(selectedCustomerId)}
                    className="bg-white/4 border border-white/8 text-[10px] uppercase text-white/50 px-4 py-2 rounded-xl hover:text-white"
                  >
                    Retry
                  </button>
                </div>
              ) : customerDetail ? (
                <>
                  {/* Customer Card Overview */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold uppercase ${avatarColor(customerDetail.status)}`}
                    >
                      {getInitials(customerDetail.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-light text-white tracking-wide truncate" style={serif}>
                        {customerDetail.name}
                      </h3>
                      <span
                        className={`mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider border font-medium ${statusColor(customerDetail.status)}`}
                      >
                        {customerDetail.status === "vip" && <Award size={10} />}
                        {customerDetail.status}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-white/5" />

                  {/* Contact & Address Ledger */}
                  <div className="space-y-3 bg-white/2 border border-white/4 p-4 rounded-2xl text-xs">
                    <div className="flex items-center gap-3 text-white/50">
                      <Mail size={13} className="text-white/20" />
                      <span className="truncate">{customerDetail.email}</span>
                    </div>
                    {customerDetail.phone && (
                      <div className="flex items-center gap-3 text-white/50">
                        <Phone size={13} className="text-white/20" />
                        <span>{customerDetail.phone}</span>
                      </div>
                    )}
                    {customerDetail.address && (
                      <div className="flex items-start gap-3 text-white/50">
                        <MapPin size={13} className="text-white/20 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">{customerDetail.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-white/50 border-t border-white/4 pt-3 mt-3">
                      <Calendar size={13} className="text-white/20" />
                      <span>Registered {new Date(customerDetail.created_at).toLocaleDateString([], { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Financial Stats Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/3 border border-white/5 rounded-2xl p-4 text-center">
                      <p className="text-[9px] uppercase tracking-wider text-white/25 flex items-center justify-center gap-1">
                        <ShoppingBag size={10} /> Orders placed
                      </p>
                      <p className="text-lg font-light text-white mt-1" style={serif}>
                        {customerDetail.orders?.length ?? 0}
                      </p>
                    </div>
                    <div className="bg-white/3 border border-white/5 rounded-2xl p-4 text-center">
                      <p className="text-[9px] uppercase tracking-wider text-white/25 flex items-center justify-center gap-1">
                        <DollarSign size={10} /> Total Spent
                      </p>
                      <p className="text-lg font-light text-[#d4a853] mt-1" style={serif}>
                        EGP {Number(customerDetail.orders?.reduce((sum: number, o: any) => sum + (o.status === 'delivered' ? Number(o.total) : 0), 0) ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-white/5" />

                  {/* Order History Timeline */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold flex items-center gap-2">
                      <Clock size={12} /> Purchase History Ledger
                    </h4>

                    {(!customerDetail.orders || customerDetail.orders.length === 0) ? (
                      <div className="text-center py-8 bg-white/1 rounded-2xl border border-dashed border-white/5">
                        <p className="text-[10px] text-white/25">This client hasn't placed any orders yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {customerDetail.orders.map((order: any) => (
                          <div
                            key={order.id}
                            className="bg-white/3 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 hover:border-white/10 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[11px] font-semibold text-white font-mono">
                                #ORD-{new Date(order.created_at).toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '')}-{order.id}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[8px] uppercase tracking-wider border font-medium ${orderStatusColor(order.status)}`}
                              >
                                {order.status}
                              </span>
                            </div>

                            {/* Item details summary */}
                            <p className="text-[10px] text-white/45 truncate">
                              {order.products_summary || (Array.isArray(order.items) ? order.items.map((i: any) => `${i.name} ×${i.qty}`).join(", ") : "Product order composition")}
                            </p>

                            <div className="flex items-center justify-between text-[10px] text-white/30 border-t border-white/4 pt-2.5 mt-1 font-mono">
                              <span>
                                {new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="font-semibold text-white/80">
                                EGP {Number(order.total_price ?? order.total ?? 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
