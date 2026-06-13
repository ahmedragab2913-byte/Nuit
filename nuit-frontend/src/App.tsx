import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
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
import BestSellers from "./pages/BestSellersPage"; // 🎯 1. استدعاء الصفحة الجديدة هنا
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Offers from "./pages/Offers"; // تأكد من استدعاء صفحة العروض الجديدة
import OrderConfirmation from "./pages/OrderConfirmation";

// 🔐 1. واقي المسارات المحمية للزبائن (체크 التوكن)
function ProtectedRoute() {
  const token = localStorage.getItem("nuit_auth_token");

  // لو مفيش توكن محفوظ، روت المستخدم لصفحة اللوجين فوراً
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // لو التوكن موجود، خليه يكمل ويشوف الصفحة جوه الـ Layout عادي
  return <Outlet />;
}

// 2. Storefront layout wrapper with Nav and Footer
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
      <Routes>
        {/* 🌍 المسارات العامة المفتوحة لأي زائر */}
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

        {/* 🎯 2. الـ Route السحري اللي هيشغل صفحة الأكثر مبيعاً ويقضي على الـ 404 */}
        <Route path="/best-sellers" element={<StorefrontLayout><BestSellers /></StorefrontLayout>} />
        
        <Route path="/login" element={<StorefrontLayout><Login /></StorefrontLayout>} />

        {/* 🔒 المسارات المحمية (لازم يكون مسجل دخول ومعاه توكن) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<StorefrontLayout><Profile /></StorefrontLayout>} />
          <Route path="/checkout" element={<StorefrontLayout><Checkout /></StorefrontLayout>} />
        </Route>

        {/* 🚫 صفحة الخطأ لأي مسار غريب */}
        <Route path="*" element={<StorefrontLayout><NotFound /></StorefrontLayout>} />
      </Routes>
    </Router>
  );
}

export default App;