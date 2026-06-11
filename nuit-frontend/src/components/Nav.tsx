import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Search, ChevronDown, User } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  const cart = useCartStore((state) => state.cart);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 1. الروابط الأساسية في الـ Navbar
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "All Products", path: "/shop" },
    { name: "New Arrivals", path: "/new-arrivals" },
    { name: "Offers", path: "/sales" },
    { name: "Best Sellers", path: "/best-sellers" },
    { name: "Men's Perfumes", path: "/shop?category=Men%20Perfumes" },
  ];

  // 2. روابط الـ Dropdown (More) لحماية المساحة والـ Layout
  const moreLinks = [
    { name: "Women's Perfumes", path: "/shop?category=Women%20Perfumes" },
    { name: "Unisex", path: "/shop?category=Unisex" },
  ];

  const currentFullURL = location.pathname + location.search;
  const isMoreActive = moreLinks.some(link => currentFullURL === link.path);

  return (
    <>
      <nav
        className="left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-16 py-5 border-b border-border bg-background/90 backdrop-blur-md relative"
        style={sans}
      >
        <div className="flex items-center gap-8">
          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-muted-foreground hover:text-foreground transition-colors lg:hidden cursor-pointer"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link, index) => {
              const isActive = currentFullURL === link.path || (link.path === "/shop" && location.pathname === "/shop" && !location.search);
              return (
                <Link
                  key={index}
                  to={link.path}
                  className={`text-[10px] tracking-[0.22em] uppercase transition-colors relative py-1 whitespace-nowrap ${
                    isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-foreground" />
                  )}
                </Link>
              );
            })}

            {/* Dropdown System (More) */}
            <div className="relative group cursor-pointer text-[10px] tracking-[0.22em] uppercase py-1 flex items-center gap-1 transition-colors">
              <span className={isMoreActive ? "text-foreground font-semibold" : "text-muted-foreground group-hover:text-foreground"}>
                More
              </span>
              <ChevronDown size={11} className={`transition-transform duration-300 group-hover:rotate-180 ${isMoreActive ? "text-foreground" : "text-muted-foreground/80"}`} />
              
              <div className="absolute top-full left-0 mt-3 w-48 bg-background border border-border shadow-md rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 normal-case tracking-normal font-light">
                <ul className="py-2 text-left text-xs text-muted-foreground">
                  {moreLinks.map((link, idx) => {
                    const isSubActive = currentFullURL === link.path;
                    return (
                      <li key={idx}>
                        <Link 
                          to={link.path} 
                          className={`block px-4 py-2.5 hover:bg-muted hover:text-foreground transition-colors ${isSubActive ? "text-foreground bg-muted font-medium" : ""}`}
                        >
                          {link.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Center Identity */}
        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2 text-[22px] tracking-[0.45em] uppercase text-foreground font-light"
          style={serif}
        >
          Nuit
        </Link>

        {/* Right Actions Interface */}
        <div className="flex items-center gap-5">
          <button className="text-muted-foreground hover:text-foreground transition-colors hidden lg:block cursor-pointer">
            <Search size={17} />
          </button>
          <Link
            to={isAuthenticated ? "/profile" : "/login"}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <User size={17} />
          </Link>
          <Link
            to="/cart"
            className="relative text-muted-foreground hover:text-foreground transition-colors"
          >
            <ShoppingBag size={17} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[11px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Synchronized Mobile Navigation Overlay Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-background/97 backdrop-blur-xl flex flex-col items-center justify-center gap-5 overflow-y-auto pt-24 pb-8">
          {[...navLinks, ...moreLinks].map((link, index) => (
            <Link
              key={index}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className="text-xl tracking-[0.25em] uppercase text-foreground font-light hover:text-primary transition-colors"
              style={serif}
            >
              {link.name}
            </Link>
          ))}
          
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-6 right-6 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>
      )}
    </>
  );
}