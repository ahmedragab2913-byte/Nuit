// import { useState, useEffect } from "react";
// import { TrendingUp, ShoppingCart, Users, Package } from "lucide-react";
// import { getDashboardStats } from "../services/api";
// import type { DashboardStats } from "../types";

// const serif = { fontFamily: "'Playfair Display', serif" };
// const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// export default function Dashboard() {
//   const [stats, setStats] = useState<DashboardStats | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const data = await getDashboardStats();
//         setStats(data);
//       } catch (err: any) {
//         console.error("Failed to load dashboard stats:", err);
//         setError("Failed to load overview data. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchStats();
//   }, []);

//   if (loading) {
//     return (
//       <div className="p-8 space-y-8 animate-pulse">
//         {/* KPI Grid Skeleton */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           {[1, 2, 3, 4].map(i => (
//             <div key={i} className="bg-white/4 border border-white/5 rounded-md p-6 h-28" />
//           ))}
//         </div>
//         {/* Chart Skeleton */}
//         <div className="bg-white/4 border border-white/5 rounded-md p-6 h-64" />
//       </div>
//     );
//   }

//   if (error || !stats) {
//     return (
//       <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-center">
//         <p className="text-white/45 text-sm mb-4">{error || "Something went wrong."}</p>
//         <button 
//           onClick={() => window.location.reload()}
//           className="text-[10px] tracking-[0.2em] uppercase text-white border border-white/10 px-6 py-2.5 hover:border-white/30 transition-all cursor-pointer"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   // Find max value in chart to normalize bar heights
//   const maxRevenue = Math.max(...stats.revenue_chart.map(d => d.total), 1);

//   return (
//     <div className="p-8 space-y-8">
//       {/* 1. KPIs */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         {/* Revenue */}
//         <div className="bg-white/4 border border-white/5 rounded-md p-6 relative overflow-hidden">
//           <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
//           <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-2">Total Revenue</p>
//           <h3 className="text-2xl font-light text-white mb-2" style={serif}>
//             EGP {stats.revenue.toLocaleString()}
//           </h3>
//           <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
//             <TrendingUp size={11} />
//             <span>+12.4% vs last month</span>
//           </div>
//         </div>

//         {/* Orders */}
//         <div className="bg-white/4 border border-white/5 rounded-md p-6 relative overflow-hidden">
//           <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
//           <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-2">Total Orders</p>
//           <h3 className="text-2xl font-light text-white mb-2" style={serif}>
//             {stats.orders}
//           </h3>
//           <div className="flex items-center gap-1.5 text-[10px] text-blue-400">
//             <ShoppingCart size={11} />
//             <span>+8.2% vs last month</span>
//           </div>
//         </div>

//         {/* Products */}
//         <div className="bg-white/4 border border-white/5 rounded-md p-6 relative overflow-hidden">
//           <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
//           <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-2">Catalog Size</p>
//           <h3 className="text-2xl font-light text-white mb-2" style={serif}>
//             {stats.products}
//           </h3>
//           <div className="flex items-center gap-1.5 text-[10px] text-amber-400">
//             <Package size={11} />
//             <span>Active fragrances</span>
//           </div>
//         </div>

//         {/* Customers */}
//         <div className="bg-white/4 border border-white/5 rounded-md p-6 relative overflow-hidden">
//           <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
//           <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-2">Customers CRM</p>
//           <h3 className="text-2xl font-light text-white mb-2" style={serif}>
//             {stats.customers}
//           </h3>
//           <div className="flex items-center gap-1.5 text-[10px] text-indigo-400">
//             <Users size={11} />
//             <span>+5.1% vs last month</span>
//           </div>
//         </div>
//       </div>

//       {/* 2. Charts */}
//       <div className="bg-white/4 border border-white/5 rounded-md p-6">
//         <h3 className="text-xs tracking-wider uppercase text-white/60 mb-8">Monthly Sales Performance</h3>
//         <div className="flex items-end justify-between h-56 pt-6 gap-3">
//           {stats.revenue_chart.map((data) => {
//             const heightPercent = Math.max(5, (data.total / maxRevenue) * 100);
//             return (
//               <div key={data.month} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
//                 {/* Popover value */}
//                 <span className="text-[9px] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 px-2 py-0.5 rounded-sm whitespace-nowrap mb-1">
//                   EGP {data.total.toLocaleString()}
//                 </span>
//                 {/* Bar */}
//                 <div 
//                   className="w-full bg-white/10 group-hover:bg-white/20 transition-all rounded-t-sm"
//                   style={{ height: `${heightPercent}%` }}
//                 />
//                 {/* Label */}
//                 <span className="text-[9px] tracking-wider text-white/30 mt-1 uppercase">
//                   {MONTHS[data.month - 1]}
//                 </span>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* 3. Bottom Grid: Top Products & Recent Orders */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Top Products */}
//         <div className="bg-white/4 border border-white/5 rounded-md p-6 space-y-4">
//           <h3 className="text-xs tracking-wider uppercase text-white/60">Top Compositions</h3>
//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-xs border-collapse">
//               <thead>
//                 <tr className="border-b border-white/5 text-white/30 uppercase text-[9px] tracking-wider">
//                   <th className="py-2.5 font-medium">Product</th>
//                   <th className="py-2.5 font-medium text-right">Category</th>
//                   <th className="py-2.5 font-medium text-right">Sales</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {stats.top_products.map((p) => (
//                   <tr key={p.id} className="border-b border-white/5 hover:bg-white/1">
//                     <td className="py-3 font-light text-white">{p.name}</td>
//                     <td className="py-3 text-right text-white/45">{p.category}</td>
//                     <td className="py-3 text-right font-light text-white/80">{p.sales ?? 0} units</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Recent Orders */}
//         <div className="bg-white/4 border border-white/5 rounded-md p-6 space-y-4">
//           <h3 className="text-xs tracking-wider uppercase text-white/60">Recent Orders</h3>
//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-xs border-collapse">
//               <thead>
//                 <tr className="border-b border-white/5 text-white/30 uppercase text-[9px] tracking-wider">
//                   <th className="py-2.5 font-medium">Order ID</th>
//                   <th className="py-2.5 font-medium">Customer</th>
//                   <th className="py-2.5 font-medium text-right">Amount</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {stats.recent_orders.map((o) => (
//                   <tr key={o.id} className="border-b border-white/5 hover:bg-white/1">
//                     <td className="py-3 font-light text-white">#{o.id}</td>
//                     <td className="py-3 text-white/45">{o.customer}</td>
//                     <td className="py-3 text-right font-light text-white/80">EGP {o.total.toLocaleString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
