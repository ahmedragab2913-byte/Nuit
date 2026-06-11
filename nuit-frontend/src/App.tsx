import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";


// Storefront layout wrapper with Nav and Footer
function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/*
        ── HEADER SHELL (fixed) ──────────────────────────────────────
        AnnouncementBar + Nav live inside ONE fixed container.
        Bar shrinks to height:0 when empty → Nav moves up seamlessly.
        No race-condition, no gap, ever.
      */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AnnouncementBar />
        <Nav />
      </div>

      {/*
        ── CONTENT OFFSET ──────────────────────────────────────────
        A non-fixed spacer pushes page content below the fixed header.
        AnnouncementBar passes its current height via CSS var so this
        stays in sync automatically.
      */}
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
        {/* Storefront pages */}
        <Route path="/" element={<StorefrontLayout><Home /></StorefrontLayout>} />
        <Route path="/shop" element={<StorefrontLayout><Shop /></StorefrontLayout>} />
        <Route path="/product/:id" element={<StorefrontLayout><Product /></StorefrontLayout>} />
        <Route path="/cart" element={<StorefrontLayout><Cart /></StorefrontLayout>} />
        <Route path="/about" element={<StorefrontLayout><About /></StorefrontLayout>} />
        {/* Catch-all NotFound page */}
        <Route path="*" element={<StorefrontLayout><NotFound /></StorefrontLayout>} />
        <Route path="/privacy-policy" element={<StorefrontLayout><PrivacyPolicy /></StorefrontLayout>} />
        <Route path="/terms-conditions" element={<StorefrontLayout><TermsConditions /></StorefrontLayout>} />
        <Route path="/new-arrivals" element={<StorefrontLayout><NewArrivals /></StorefrontLayout>} />

        {/* Auth & User Pages (with layout) */}
        <Route path="/login" element={<StorefrontLayout><Login /></StorefrontLayout>} />
        <Route path="/profile" element={<StorefrontLayout><Profile /></StorefrontLayout>} />

        {/* Checkout (with layout) */}
        <Route path="/checkout" element={<StorefrontLayout><Checkout /></StorefrontLayout>} />

      </Routes>
    </Router>
  );
}

export default App;