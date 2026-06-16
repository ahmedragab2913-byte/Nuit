import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import About from "./pages/About";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import Nav from "./components/Nav";
import AnnouncementBar from "./components/AnnouncementBar";
import Footer from "./components/Footer";
import NotFound from "./pages/NotFound";
import NewArrivals from "./pages/NewArrivals";
import BestSellers from "./pages/BestSellersPage";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Offers from "./pages/Offers";
import OrderConfirmation from "./pages/OrderConfirmation";
import { useAuthStore } from "./store/authStore";

// 🔐 Protected route guard — validates auth state, not just token existence
function ProtectedRoute() {
  const { isAuthenticated, hasCheckedAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    if (!hasCheckedAuth) {
      checkAuth();
    }
  }, [hasCheckedAuth, checkAuth]);

  // Show spinner while verifying token with the backend
  if (!hasCheckedAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Storefront layout wrapper with Nav and Footer
function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* ── HEADER SHELL (fixed) ── */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AnnouncementBar />
        <Nav />
      </div>

      {/* ── CONTENT OFFSET ── */}
      <div id="header-spacer" style={{ height: "var(--header-h, 68px)", flexShrink: 0 }} />

      <main className="flex-grow">
        {children}
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<StorefrontLayout><Home /></StorefrontLayout>} />
        <Route path="/shop" element={<StorefrontLayout><Shop /></StorefrontLayout>} />
        <Route path="/product/:id" element={<StorefrontLayout><Product /></StorefrontLayout>} />
        <Route path="/cart" element={<StorefrontLayout><Cart /></StorefrontLayout>} />
        <Route path="/about" element={<StorefrontLayout><About /></StorefrontLayout>} />
        <Route path="/privacy-policy" element={<StorefrontLayout><PrivacyPolicy /></StorefrontLayout>} />
        <Route path="/terms-conditions" element={<StorefrontLayout><TermsConditions /></StorefrontLayout>} />
        <Route path="/new-arrivals" element={<StorefrontLayout><NewArrivals /></StorefrontLayout>} />
        <Route path="/offers" element={<StorefrontLayout><Offers /></StorefrontLayout>} />
        <Route path="/order-confirmation" element={<StorefrontLayout><OrderConfirmation /></StorefrontLayout>} />
        <Route path="/best-sellers" element={<StorefrontLayout><BestSellers /></StorefrontLayout>} />
        <Route path="/login" element={<StorefrontLayout><Login /></StorefrontLayout>} />

        {/* Protected routes (requires valid auth) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<StorefrontLayout><Profile /></StorefrontLayout>} />
          <Route path="/checkout" element={<StorefrontLayout><Checkout /></StorefrontLayout>} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<StorefrontLayout><NotFound /></StorefrontLayout>} />
      </Routes>
    </Router>
  );
}

export default App;