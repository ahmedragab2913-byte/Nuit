import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Bell, ChevronDown, Menu, X } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useAdminStore } from "../store/adminStore";

interface TopbarProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export default function Topbar({ isMobileMenuOpen, onToggleMobileMenu }: TopbarProps) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const { notifications, unreadCount, markAllNotificationsRead, clearNotifications } = useAdminStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Derive page title from active path
  const getPageTitle = (path: string) => {
    if (path.includes("/dashboard/products")) return "Products";
    if (path.includes("/dashboard/orders")) return "Orders";
    if (path.includes("/dashboard/customers")) return "Customers";
    if (path.includes("/dashboard/announcements")) return "Announcements";
    if (path.includes("/dashboard/shipping-rates")) return "Shipping Rates";
    if (path.includes("/dashboard/promo-codes")) return "Promo Codes";
    return "Overview";
  };

  return (
    <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 bg-[#0d0d0d]">
      {/* Title & Mobile Nav Trigger */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onToggleMobileMenu} 
          className="lg:hidden p-2 -ml-2 text-white/50 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
          title="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <h1 className="text-sm tracking-[0.2em] uppercase text-white/60">{getPageTitle(location.pathname)}</h1>
      </div>
      
      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-white/35 hover:text-white/70 relative cursor-pointer p-1.5 rounded-lg hover:bg-white/4 transition-colors flex items-center justify-center"
            title="Notifications"
          >
            <Bell size={14} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#d4a853] text-black text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0d0d0d] border border-white/8 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/1">
                <span className="text-[10px] tracking-[0.15em] uppercase text-white/50 font-medium">Notifications</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => markAllNotificationsRead()}
                    className="text-[9px] text-[#d4a853] hover:text-[#e8bb65] font-semibold cursor-pointer transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-64 overflow-y-auto divide-y divide-white/4">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-white/25 text-[10px]">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`px-4 py-3 hover:bg-white/2 transition-colors flex flex-col gap-0.5 text-left ${!n.read ? "bg-white/1" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${n.type === 'success' ? 'text-[#4db3a4]' : n.type === 'warning' ? 'text-red-400' : 'text-white/65'}`}>
                          {n.title}
                        </span>
                        <span className="text-[8px] text-white/20">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/45 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2 bg-white/1 border-t border-white/5 text-center">
                  <button 
                    onClick={() => clearNotifications()}
                    className="text-[9px] text-white/30 hover:text-white/60 cursor-pointer transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-white/10" />

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white font-medium">
            {user?.name?.slice(0, 2).toUpperCase() || "AD"}
          </div>
          <span className="text-[10px] tracking-wider text-white/60 group-hover:text-white transition-colors hidden sm:inline">
            {user?.name || "Admin"}
          </span>
          <ChevronDown size={11} className="text-white/25 group-hover:text-white/50 transition-colors" />
        </div>
      </div>
    </header>
  );
}