import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Announcements from "./pages/Announcements";
import { getCsrfCookie } from "./services/api";

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
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a] text-white">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <Topbar />

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
  // Ensure CSRF token is set for admin API calls
  useEffect(() => {
    getCsrfCookie();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Console */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="announcements" element={<Announcements />} />
          </Route>
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
