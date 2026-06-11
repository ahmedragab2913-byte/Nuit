import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Users, Megaphone, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";

const serif = { fontFamily: "'Playfair Display', serif" };

export default function Sidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const navItems = [
    { to: "/dashboard", label: "Overview", icon: <LayoutDashboard size={16} />, end: true },
    { to: "/dashboard/products", label: "Products", icon: <Package size={16} /> },
    { to: "/dashboard/orders", label: "Orders", icon: <ShoppingCart size={16} /> },
    { to: "/dashboard/customers", label: "Customers", icon: <Users size={16} /> },
    { to: "/dashboard/announcements", label: "Announcements", icon: <Megaphone size={16} /> },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-56 flex-shrink-0 border-r border-white/5 flex flex-col h-screen sticky top-0" style={{ background: "#0a0a0a" }}>
      {/* Brand logo */}
      <div className="px-6 py-7 border-b border-white/5">
        <p className="text-[20px] tracking-[0.5em] uppercase text-white font-light" style={serif}>Nuit</p>
        <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mt-1">Admin Console</p>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 text-left text-[11px] tracking-[0.15em] uppercase transition-all duration-200 rounded-sm cursor-pointer ${
                isActive ? "bg-white/8 text-white font-medium" : "text-white/35 hover:text-white/70 hover:bg-white/4"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Settings & Sign Out */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-[0.15em] uppercase text-white/30 hover:text-white/60 transition-colors cursor-pointer">
          <Settings size={14} /> Settings
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-[0.15em] uppercase text-white/30 hover:text-red-400 transition-colors cursor-pointer"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
