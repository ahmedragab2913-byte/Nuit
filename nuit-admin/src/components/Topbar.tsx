import { useLocation } from "react-router-dom";
import { Search, Bell, ChevronDown } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function Topbar() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  // Derive page title from active path
  const getPageTitle = (path: string) => {
    if (path.includes("/dashboard/products")) return "Products";
    if (path.includes("/dashboard/orders")) return "Orders";
    if (path.includes("/dashboard/customers")) return "Customers";
    return "Overview";
  };

  return (
    <header className="h-14 border-b border-white/5 flex items-center justify-between px-8 flex-shrink-0" style={{ background: "#0d0d0d" }}>
      {/* Title */}
      <h1 className="text-sm tracking-[0.2em] uppercase text-white/60">{getPageTitle(location.pathname)}</h1>
      
      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input 
            placeholder="Search..." 
            className="bg-white/4 border border-white/8 rounded-sm pl-9 pr-4 py-1.5 text-xs text-white/60 placeholder:text-white/20 outline-none focus:border-white/20 transition-colors w-48" 
          />
        </div>

        {/* Notifications */}
        <button className="text-white/35 hover:text-white/70 relative cursor-pointer">
          <Bell size={14} />
          <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-white/10" />

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white font-medium">
            {user?.name?.slice(0, 2).toUpperCase() || "AD"}
          </div>
          <span className="text-[10px] tracking-wider text-white/60 group-hover:text-white transition-colors">
            {user?.name || "Admin"}
          </span>
          <ChevronDown size={11} className="text-white/25 group-hover:text-white/50 transition-colors" />
        </div>
      </div>
    </header>
  );
}
