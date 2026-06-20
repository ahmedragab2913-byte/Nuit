import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Eye,
  ShoppingBag,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { useAdminStore } from "../store/adminStore";

// ─── Font tokens ────────────────────────────────────────────────
const serif = { fontFamily: "'Playfair Display', serif" };

// ─── Static month labels (Jan–Dec) ──────────────────────────────
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Customer ring colours ───────────────────────────────────────
const RING_CFG = [
  { label: "VIP",       color: "#d4a853", track: "#d4a85330" },
  { label: "Regular",   color: "#7c6fcd", track: "#7c6fcd30" },
  { label: "New",       color: "#4db3a4", track: "#4db3a430" },
] as const;


// ─── Sub-components ─────────────────────────────────────────────

/** Circular SVG ring for customer cohorts */
function CustomerRing({
  pct,
  color,
  track,
  label,
}: {
  pct: number;
  color: string;
  track: string;
  label: string;
}) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-[76px] h-[76px]">
        <svg viewBox="0 0 76 76" className="w-full h-full -rotate-90">
          <circle cx="38" cy="38" r={r} fill="none" stroke={track} strokeWidth="6" />
          <circle
            cx="38"
            cy="38"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold"
          style={{ color }}
        >
          {pct}%
        </span>
      </div>
      <span className="text-[9px] tracking-[0.18em] uppercase text-white/35">{label}</span>
    </div>
  );
}

/** Single horizontal progress bar row */
function ProgressRow({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] tracking-[0.15em] uppercase text-white/45">{label}</span>
        <span className="text-[10px] font-medium" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-[3px] rounded-full bg-white/6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

/** Custom Recharts tooltip */
function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const curr = payload.find((p: any) => p.dataKey === "current");
  const prev = payload.find((p: any) => p.dataKey === "prev");
  return (
    <div className="bg-[#111] border border-white/8 rounded-md px-3.5 py-2.5 text-[11px] shadow-xl">
      <p className="text-white/40 uppercase tracking-wider mb-1.5">{label}</p>
      {curr && (
        <p className="text-[#d4a853]">
          This year: <span className="font-semibold">EGP {Number(curr.value).toLocaleString()}</span>
        </p>
      )}
      {prev && (
        <p className="text-white/35">
          Reference: <span>EGP {Number(prev.value).toLocaleString()}</span>
        </p>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export default function Overview() {
  const navigate = useNavigate();
  const {
    dashboardStats: stats,
    dashboardLoading: loading,
    dashboardError,
    fetchDashboardStats,
    customers,
    fetchCustomers,
  } = useAdminStore();

  const [activeBar, setActiveBar] = useState<number | null>(null);

  useEffect(() => {
    fetchDashboardStats();
    fetchCustomers();
  }, [fetchDashboardStats, fetchCustomers]);

  // ── Derived KPI values ────────────────────────────────────────
  const totalRevenue  = stats?.revenue   ?? 0;
  const totalOrders   = stats?.orders    ?? 0;
  const totalProducts = stats?.products  ?? 0;
  const totalCustomers= stats?.customers ?? 0;

  // Completed ≈ delivered orders; not directly in the stats shape,
  // so we use the revenue as a proxy for "completed" display.
  // The recent_orders list lets us count delivered items.
  const completedOrders = useMemo(() => {
    if (!stats?.recent_orders) return 0;
    return stats.recent_orders.filter((o) => o.status === "delivered").length;
  }, [stats?.recent_orders]);

  // ── Revenue chart data ────────────────────────────────────────
  // Backend returns { month: 1-12, total: number }.
  // We build a full 12-month array; months with no data get 0.
  const chartData = useMemo(() => {
    const byMonth: Record<number, number> = {};
    (stats?.revenue_chart ?? []).forEach((p) => {
      byMonth[p.month] = p.total;
    });

    // Build prev as 80% of current (best available estimate without historical data)
    return MONTH_LABELS.map((label, i) => {
      const month = i + 1;
      const current = byMonth[month] ?? 0;
      return {
        month: label,
        current,
        prev: Math.round(current * 0.8),
      };
    });
  }, [stats?.revenue_chart]);

  // Total chart revenue for the "revenue growth" badge
  const chartTotal = chartData.reduce((s, d) => s + d.current, 0);
  const chartPrevTotal = chartData.reduce((s, d) => s + d.prev, 0);
  const revenueGrowthPct =
    chartPrevTotal > 0
      ? Math.round(((chartTotal - chartPrevTotal) / chartPrevTotal) * 100)
      : 0;

  // ── Top products ─────────────────────────────────────────────
  // API returns: id, name, price, image, sales
  // subtitle = sales count (safe, no undefined fields used)
  const topProducts = useMemo(
    () =>
      (stats?.top_products ?? []).map((p) => ({
        id:        p.id,
        name:      p.name ?? "—",
        subtitle:  p.sales != null ? `${p.sales} units sold` : "No sales data",
        image:     p.image ?? null,
        sales:     p.sales ?? 0,
        price:     p.price ?? 0,
        revenue:   Math.round((p.sales ?? 0) * (p.price ?? 0)),
      })),
    [stats?.top_products]
  );

  // ── Customer cohort rings ────────────────────────────────────
  // Dynamically compute cohort percentage from the live customers list
  const customerRings = useMemo(() => {
    const total = customers.length;
    if (total === 0) {
      return RING_CFG.map((c) => ({ ...c, pct: 0 }));
    }
    const vipCount = customers.filter(c => c.status === 'vip').length;
    const regularCount = customers.filter(c => c.status === 'regular').length;
    const newCount = customers.filter(c => c.status === 'new').length;

    return [
      { ...RING_CFG[0], pct: Math.round((vipCount / total) * 100) },
      { ...RING_CFG[1], pct: Math.round((regularCount / total) * 100) },
      { ...RING_CFG[2], pct: Math.round((newCount / total) * 100) },
    ];
  }, [customers]);

  // ── Stats overview bars ──────────────────────────────────────
  // Driven by category_stats from the backend dashboard stats endpoint
  const statsRows = useMemo(() => {
    if (!stats?.category_stats) {
      // Safe fallback while data is loading
      return [
        { label: "Women Perfumes", color: "#d4a853", pct: 0 },
        { label: "Men Perfumes",   color: "#7c6fcd", pct: 0 },
        { label: "Unisex",         color: "#4db3a4", pct: 0 },
      ];
    }

    return [
      {
        label: "Women Perfumes",
        color: "#d4a853",
        pct: stats.category_stats.women_pct || 0,
      },
      {
        label: "Men Perfumes",
        color: "#7c6fcd",
        pct: stats.category_stats.men_pct || 0,
      },
      {
        label: "Unisex",
        color: "#4db3a4",
        pct: stats.category_stats.unisex_pct || 0,
      },
    ];
  }, [stats?.category_stats]);

  // ── KPI card definitions ─────────────────────────────────────
  const kpiCards = [
    {
      label:  "Total Sales",
      value:  totalOrders.toLocaleString(),
      change: 8.7,
      icon:   ShoppingBag,
      accent: "#7c6fcd",
      bg:     "rgba(124,111,205,0.07)",
    },
    {
      label:  "Total Made",
      value:  `EGP ${totalRevenue >= 1000 ? (totalRevenue / 1000).toFixed(0) + "k" : totalRevenue.toLocaleString()}`,
      change: revenueGrowthPct,
      icon:   DollarSign,
      accent: "#4db3a4",
      bg:     "rgba(77,179,164,0.07)",
    },
    {
      label:  "Total Products",
      value:  totalProducts.toLocaleString(),
      change: 0,
      icon:   Eye,
      accent: "#d4a853",
      bg:     "rgba(212,168,83,0.07)",
    },
    {
      label:  "Total Customers",
      value:  totalCustomers.toLocaleString(),
      change: completedOrders > 0 ? completedOrders : 0,
      icon:   CheckCircle2,
      accent: "#e06b6b",
      bg:     "rgba(224,107,107,0.07)",
    },
  ];

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-full">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* <h1 className="text-2xl font-light text-white tracking-wide" style={serif}>
            Overview
          </h1> */}
          <h1  className="text-2xl font-light text-white tracking-wide" style={serif}>
            Admin Console
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardStats()}
            disabled={loading}
            title="Refresh dashboard"
            className="p-2 bg-white/4 border border-white/6 rounded-md text-white/40 hover:text-white/70 transition-colors cursor-pointer disabled:opacity-40"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── Error banner ────────────────────────────────────── */}
      {dashboardError && !loading && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-[11px] text-red-400">{dashboardError}</p>
          <button
            onClick={() => fetchDashboardStats()}
            className="text-[10px] tracking-[0.1em] uppercase text-red-400/70 hover:text-red-400 border border-red-500/20 px-3 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── KPI Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.map((stat) => {
          const Icon = stat.icon;
          const isUp = stat.change >= 0;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/6 p-4 sm:p-5 relative overflow-hidden"
              style={{ background: "#0d0d0d" }}
            >
              {/* Ambient glow */}
              <div
                className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl pointer-events-none"
                style={{ background: stat.bg }}
              />
              <div className="flex items-start justify-between gap-2 relative">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: stat.bg }}
                >
                  <Icon size={15} style={{ color: stat.accent }} />
                </div>
                {stat.change !== 0 && (
                  <div
                    className={`flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                      isUp
                        ? "text-emerald-400 bg-emerald-400/10"
                        : "text-red-400 bg-red-400/10"
                    }`}
                  >
                    {isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
              {loading ? (
                <div className="mt-3 h-7 w-24 rounded-lg bg-white/6 animate-pulse" />
              ) : (
                <p className="text-lg sm:text-xl font-light text-white mt-3" style={serif}>
                  {stat.value}
                </p>
              )}
              <p className="text-[9px] tracking-[0.18em] uppercase text-white/30 mt-0.5">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Main 3-col grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        {/* ── Left 2/3 ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">

          {/* Revenue Bar Chart */}
          <div
            className="rounded-3xl border border-white/6 p-5 sm:p-6"
            style={{ background: "#0d0d0d" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-light text-white" style={serif}>
                  Total Revenue
                </h2>
                <div className="flex items-baseline gap-2 mt-0.5">
                  {loading ? (
                    <div className="h-7 w-32 rounded-lg bg-white/6 animate-pulse" />
                  ) : (
                    <>
                      <span className="text-2xl font-light text-white" style={serif}>
                        EGP {totalRevenue >= 1000
                          ? `${(totalRevenue / 1000).toFixed(0)}k`
                          : totalRevenue.toLocaleString()}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-[10px] ${
                          revenueGrowthPct >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {revenueGrowthPct >= 0 ? (
                          <TrendingUp size={10} />
                        ) : (
                          <TrendingDown size={10} />
                        )}
                        {revenueGrowthPct >= 0 ? "+" : ""}
                        {revenueGrowthPct}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 self-start sm:self-auto">
                {/* Legend */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-1.5 rounded-full bg-[#d4a853]" />
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-1.5 rounded-full bg-white/15" />
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">Estimate</span>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="h-[220px] w-full rounded-2xl bg-white/4 animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={chartData}
                  barGap={2}
                  barCategoryGap="28%"
                  margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
                  onMouseLeave={() => setActiveBar(null)}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: "rgba(255,255,255,0.28)", letterSpacing: "0.1em" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: "rgba(255,255,255,0.28)" }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={<RevenueTooltip />}
                    cursor={{ fill: "rgba(255,255,255,0.03)", radius: 6 }}
                  />
                  {/* Estimate bars (muted) */}
                  <Bar dataKey="prev" radius={[4, 4, 0, 0]} maxBarSize={18}>
                    {chartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={activeBar === i ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.09)"}
                        onMouseEnter={() => setActiveBar(i)}
                      />
                    ))}
                  </Bar>
                  {/* Current period — gold accent bars */}
                  <Bar dataKey="current" radius={[4, 4, 0, 0]} maxBarSize={18}>
                    {chartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={activeBar === i ? "#e8bb65" : "#d4a853"}
                        onMouseEnter={() => setActiveBar(i)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Products */}
          <div
            className="rounded-3xl border border-white/6 p-5 sm:p-6"
            style={{ background: "#0d0d0d" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[11px] tracking-[0.2em] uppercase text-white/50">Top Products</h2>
              <button
                onClick={() => navigate("/dashboard/products")}
                className="flex items-center gap-1 text-[9px] tracking-[0.15em] uppercase text-[#d4a853] hover:text-[#e8bb65] transition-colors cursor-pointer font-medium"
              >
                View all <ArrowUpRight size={10} />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-white/4 animate-pulse" />
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[180px]">
                <p className="text-[11px] text-white/25">No product data available yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-left min-w-[480px]">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Product", "Sales", "Price", "Revenue"].map((h) => (
                        <th
                          key={h}
                          className={`pb-3 text-[9px] tracking-[0.15em] uppercase font-medium text-white/25 ${
                            h === "Product" ? "" : "text-right"
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/4">
                    {topProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-white/2 transition-colors group">
                        {/* Product cell */}
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white/6 border border-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                              {p.image ? (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white/20 text-[8px]" style={serif}>N</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] text-white font-light truncate">{p.name}</p>
                              <p className="text-[9px] text-white/30 truncate">{p.subtitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 text-right text-[11px] text-white/70">
                          {p.sales.toLocaleString()}
                        </td>
                        <td className="py-3.5 text-right text-[11px] text-white/70">
                          EGP {p.price.toLocaleString()}
                        </td>
                        <td className="py-3.5 text-right">
                          <span className="text-[11px] font-medium text-[#d4a853]">
                            EGP {p.revenue.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Right 1/3 sidebar ────────────────────────────── */}
        <div className="space-y-4 sm:space-y-6">

          {/* Snapshot */}
          <div
            className="rounded-3xl border border-white/6 p-5"
            style={{ background: "#0d0d0d" }}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[11px] tracking-[0.2em] uppercase text-white/50">Snapshot</h2>
              <span className="text-[9px] text-white/20 tracking-wider">Live</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                {
                  label: "Orders",
                  value: loading ? "—" : totalOrders.toLocaleString(),
                  color: "#d4a853",
                },
                {
                  label: "Revenue",
                  value: loading
                    ? "—"
                    : totalRevenue >= 1000
                    ? `${(totalRevenue / 1000).toFixed(0)}k`
                    : totalRevenue.toLocaleString(),
                  color: "#7c6fcd",
                },
                {
                  label: "Customers",
                  value: loading ? "—" : totalCustomers.toLocaleString(),
                  color: "#4db3a4",
                },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/3 p-3 text-center">
                  <p className="text-base font-light" style={{ ...serif, color: s.color }}>
                    {s.value}
                  </p>
                  <p className="text-[8px] tracking-[0.12em] uppercase text-white/25 mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Cohort Rings */}
          <div
            className="rounded-3xl border border-white/6 p-5 sm:p-6"
            style={{ background: "#0d0d0d" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[11px] tracking-[0.2em] uppercase text-white/50">Customers</h2>
              <button 
                onClick={() => navigate("/dashboard/customers")}
                className="text-[9px] text-[#d4a853] hover:text-[#e8bb65] cursor-pointer transition-colors font-medium tracking-wider"
              >
                View all
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-3 gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl bg-white/4 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {customerRings.map((ring) => (
                  <div
                    key={ring.label}
                    className="flex flex-col items-center gap-2 bg-white/3 rounded-2xl py-4"
                  >
                    <CustomerRing
                      pct={ring.pct}
                      color={ring.color}
                      track={ring.track}
                      label={ring.label}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats Overview — progress bars */}
          <div
            className="rounded-3xl border border-white/6 p-5 sm:p-6"
            style={{ background: "#0d0d0d" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[11px] tracking-[0.2em] uppercase text-white/50">Stats Overview</h2>
              <span className="flex items-center gap-1 text-[9px] text-emerald-400">
                <TrendingUp size={9} /> +8.4%
              </span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-6 rounded-lg bg-white/4 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {statsRows.map((row) => (
                    <ProgressRow key={row.label} label={row.label} pct={row.pct} color={row.color} />
                  ))}
                </div>
                {/* Stacked demographic bar */}
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">Demographics</p>
                  <div className="flex items-center gap-0.5 h-2 w-32 rounded-full overflow-hidden">
                    {statsRows.map((row) => (
                      <div
                        key={row.label}
                        className="h-full"
                        style={{ width: `${row.pct}%`, background: row.color }}
                        title={`${row.label}: ${row.pct}%`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Recent Orders Activity Feed */}
          <div
            className="rounded-3xl border border-white/6 p-5"
            style={{ background: "#0d0d0d" }}
          >
            <h2 className="text-[11px] tracking-[0.2em] uppercase text-white/50 mb-4">
              Recent Activity
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 rounded-lg bg-white/4 animate-pulse" />
                ))}
              </div>
            ) : (stats?.recent_orders ?? []).length === 0 ? (
              <p className="text-[10px] text-white/25 text-center py-6">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {(stats?.recent_orders ?? []).map((order, i) => {
                  const dotColor =
                    order.status === "delivered"
                      ? "#4db3a4"
                      : order.status === "cancelled"
                      ? "#e06b6b"
                      : order.status === "processing" || order.status === "preparing"
                      ? "#d4a853"
                      : "#7c6fcd";

                  return (
                    <div key={order.id ?? i} className="flex items-start gap-3">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: dotColor }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-white/55 leading-relaxed">
                          Order {order.id} · {order.customer}
                        </p>
                        <p className="text-[9px] text-white/20 mt-0.5 flex items-center gap-2">
                          <span className="uppercase tracking-wider">{order.status}</span>
                          <span>·</span>
                          <span>EGP {Number(order.total).toLocaleString()}</span>
                          <span>·</span>
                          <span>{order.date}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Loading overlay ─────────────────────────────────── */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-[#0d0d0d] border border-white/8 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-2xl">
            <span className="w-4 h-4 border-2 border-[#d4a853] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/40">
              Loading overview…
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
