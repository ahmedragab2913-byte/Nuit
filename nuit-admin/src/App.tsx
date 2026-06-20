import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Sidebar, { navItems } from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Announcements from "./pages/Announcements";
import ShippingRates from "./pages/ShippingRates";
import PromoCodes from "./pages/PromoCodes";
import SettingsPage from "./pages/Settings";
import { LogOut, Settings, X } from "lucide-react";
import { useAdminStore } from "./store/adminStore";

// Soft luxury chime synthesis using browser Web Audio API
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    
    // Low warm bell note
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    // High chime note (delayed slightly)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.00, now + 0.12);
    gain2.gain.setValueAtTime(0.12, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.8);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.9);
  } catch (e) {
    console.warn("Audio Context blocked or not supported:", e);
  }
};

// 1. Private Route Wrapper
function PrivateRoute() {
  const { isAuthenticated, hasCheckedAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    if (!hasCheckedAuth) {
      checkAuth();
    }
  }, [hasCheckedAuth, checkAuth]);

  if (!hasCheckedAuth) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#050505] text-white gap-3 select-none">
        <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] tracking-[0.25em] uppercase text-white/30">Maison Nuit Console...</span>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

// 2. Dashboard Layout
function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const pollNewOrders = useAdminStore((state) => state.pollNewOrders);

  // Setup desktop notifications permission and order polling interval
  useEffect(() => {
    // Request permission on mount
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    const interval = setInterval(async () => {
      const newOrders = await pollNewOrders();
      if (newOrders && newOrders.length > 0) {
        // Play luxury notification tone
        playNotificationSound();

        // Send a device/desktop notification
        newOrders.forEach((o) => {
          if (
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("New Order Received", {
              body: `Order #${o.id} placed by ${o.customer} (EGP ${o.total.toLocaleString()})`,
              icon: "/favicon.ico",
            });
          }
        });
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [pollNewOrders]);

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await logout();
    navigate("/login");
  };

  const serif = { fontFamily: "'Playfair Display', serif" };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a] text-white relative">
      {/* Sidebar Navigation (Desktop) */}
      <Sidebar />

      {/* Mobile/Tablet Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop blur overlay */}
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Slide-out Drawer */}
          <div 
            className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-white/8 p-6 flex flex-col justify-between shadow-2xl lg:hidden transform transition-transform duration-300 ease-out translate-x-0"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/5">
                <div>
                  <p className="text-[20px] tracking-[0.5em] uppercase text-white font-light" style={serif}>Nuit</p>
                  <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mt-1">Admin Console</p>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white/35 hover:text-white p-2 rounded-xl bg-white/4 border border-white/8 transition-colors cursor-pointer flex items-center justify-center"
                  title="Close Menu"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Navigation links */}
              <nav className="mt-6 space-y-1.5">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-3 px-3 py-2.5 text-left text-[11px] tracking-[0.15em] uppercase transition-all duration-200 rounded-xl cursor-pointer ${
                        isActive ? "bg-white/8 text-white font-medium border border-white/8" : "text-white/35 hover:text-white/70 hover:bg-white/4"
                      }`
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-white/5 pt-4 space-y-1">
              <NavLink
                to="/dashboard/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-[0.15em] uppercase transition-colors cursor-pointer text-left ${
                    isActive ? "text-white" : "text-white/30 hover:text-white/60"
                  }`
                }
              >
                <Settings size={14} /> Settings
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-[0.15em] uppercase text-white/30 hover:text-red-400 transition-colors cursor-pointer text-left flex items-center"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <Topbar 
          isMobileMenuOpen={isMobileMenuOpen} 
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        />

        {/* Dynamic Route View */}
        <main className="flex-1 overflow-y-auto bg-[#070707]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// 3. Main App Router
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Console */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="announcements" element={<Announcements />} />
            
            <Route path="shipping-rates" element={<ShippingRates />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="promo-codes" element={<PromoCodes />} />
          </Route>
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}