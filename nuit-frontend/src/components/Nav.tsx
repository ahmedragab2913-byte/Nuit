import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X, Search, ChevronDown, User, Globe, Heart, Sun, Moon } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useLanguageStore } from "../store/languageStore";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [visibleCount, setVisibleCount] = useState(6);

  const navRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null); // ريف لمراقبة كليك برا الـ More
  const location = useLocation();
  const navigate = useNavigate();

  const cart = useCartStore((state) => state.cart);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const wishlisted = useCartStore((state) => state.wishlisted);
  const products = useCartStore((state) => state.products);
  const wishCount = products.length > 0
    ? wishlisted.filter((id) => products.some((p) => p.id === id)).length
    : wishlisted.length;

  const { isAuthenticated, checkAuth } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();

  // 1. إدارة تفضيل الـ Dark Mode عند التحميل والتغيير
  useEffect(() => {
    checkAuth();
    
    const isDark = 
      localStorage.getItem("theme") === "dark" || 
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [checkAuth]);

  // 2. إغلاق الـ More Dropdown عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  const allLinks = [
    { name: t("home"), path: "/" },
    { name: t("allProducts"), path: "/shop" },
    { name: t("newArrivals"), path: "/new-arrivals" },
    { name: t("offers"), path: "/offers" },
    { name: t("bestSellers"), path: "/best-sellers" },
    { name: t("mensPerfumes"), path: "/shop?category=Men%20Perfumes" },
    { name: t("womensPerfumes"), path: "/shop?category=Women%20Perfumes" },
    { name: t("unisex"), path: "/shop?category=Unisex" },
  ];

  const getLinkWidths = () => {
    if (language === "ar") {
      return [60, 95, 110, 75, 95, 120, 120, 80];
    } else {
      return [75, 120, 130, 80, 120, 140, 165, 85];
    }
  };

  useEffect(() => {
    const updateNavigation = () => {
      if (!navRef.current) return;

      const navWidth = navRef.current.offsetWidth;
      const availableWidth = (navWidth / 2) - 180;

      const widths = getLinkWidths();
      let accumulatedWidth = 0;
      let allowedCount = 0;

      for (let i = 0; i < widths.length; i++) {
        accumulatedWidth += widths[i];
        if (accumulatedWidth < availableWidth) {
          allowedCount++;
        } else {
          break;
        }
      }

      if (allowedCount < 4 || (widths.length - allowedCount) >= 5) {
        setVisibleCount(0);
      } else {
        if (allowedCount < widths.length) {
          let reCalcWidth = 0;
          let finalCount = 0;
          for (let i = 0; i < widths.length; i++) {
            reCalcWidth += widths[i];
            if (reCalcWidth + 80 < availableWidth) {
              finalCount++;
            } else {
              break;
            }
          }
          
          if (finalCount < 3) {
            setVisibleCount(0);
          } else {
            setVisibleCount(Math.max(1, finalCount));
          }
        } else {
          setVisibleCount(widths.length);
        }
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updateNavigation();
    });

    if (navRef.current) {
      resizeObserver.observe(navRef.current);
    }

    updateNavigation();

    return () => {
      resizeObserver.disconnect();
    };
  }, [language]); 

  const visibleLinks = allLinks.slice(0, visibleCount);
  const overflowLinks = allLinks.slice(visibleCount);

  const currentFullURL = location.pathname + location.search;
  const isMoreActive = overflowLinks.some(link => currentFullURL === link.path);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setMenuOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        dir={language === "ar" ? "rtl" : "ltr"}
        className="left-0 right-0 z-50 flex items-center justify-between px-6 xl:px-12 py-5 border-b border-border bg-background/90 backdrop-blur-md relative transition-colors duration-300"
        style={sans}
      >
        {/* 1. بلوك القائمة */}
        <div className={`flex items-center flex-1 ${language === "ar" ? "justify-start" : "justify-start"}`}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${
              language === "ar" ? "ml-4" : "mr-4"
            } ${visibleCount === 0 ? "block" : "md:hidden"}`}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {visibleCount > 0 && (
            <div className="hidden md:flex items-center gap-5">
              {visibleLinks.map((link, index) => {
                const isActive = currentFullURL === link.path || (link.path === "/shop" && location.pathname === "/shop" && !location.search);
                return (
                  <Link
                    key={index}
                    to={link.path}
                    className={`transition-colors relative py-1 whitespace-nowrap flex-shrink-0 ${
                      language === "ar" ? "text-[12px] font-medium tracking-normal" : "text-[10px] tracking-[0.2em] uppercase"
                    } ${isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {link.name}
                    {isActive && <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-foreground" />}
                  </Link>
                );
              })}

              {overflowLinks.length > 0 && (
                <div 
                  ref={moreMenuRef}
                  className={`relative cursor-pointer py-1 flex items-center gap-1 transition-colors whitespace-nowrap flex-shrink-0 ${
                    language === "ar" ? "text-[12px] font-medium tracking-normal" : "text-[10px] tracking-[0.2em] uppercase lining-nums"
                  }`}
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                >
                  <span className={isMoreActive || isMoreOpen ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}>
                    {t("more")} ({overflowLinks.length})
                  </span>
                  <ChevronDown size={11} className={`transition-transform duration-300 ${isMoreOpen ? "rotate-180 text-foreground" : "text-muted-foreground/80"}`} />
                  
                  <div 
                    className={`absolute top-full mt-3 w-56 bg-background border border-border shadow-md rounded-sm transition-all duration-300 z-50 font-light ${
                      language === "ar" ? "right-0 text-right" : "left-0 text-left"
                    } ${isMoreOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 pointer-events-none"}`}
                  >
                    <ul className="py-2 text-xs text-muted-foreground">
                      {overflowLinks.map((link, idx) => {
                        const isSubActive = currentFullURL === link.path;
                        return (
                          <li key={idx} onClick={(e) => e.stopPropagation()}>
                            <Link 
                              to={link.path} 
                              onClick={() => setIsMoreOpen(false)} 
                              className={`block px-4 py-2.5 hover:bg-muted hover:text-foreground transition-colors tracking-normal normal-case ${isSubActive ? "text-foreground bg-muted font-medium" : ""}`}
                            >
                              {link.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. اللوجو */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-shrink-0 z-10 pointer-events-none">
          <Link
            to="/"
            dir="ltr"
            className="block pointer-events-auto select-none"
          >
            <span 
              className="text-foreground logo-font text-[16px] tracking-[0.25em] sm:text-[22px] sm:tracking-[0.45em] uppercase transition-all duration-300"
              style={{ 
                fontFamily: "'Playfair Display', serif", 
                fontWeight: 300
              }}
            >
              Nuit
            </span>
          </Link>
        </div>

        {/* 3. بلوك الأيقونات وأدوات التحكم */}
        <div className="flex items-center gap-3 xl:gap-4 z-20 flex-1 justify-end">
          <button
            onClick={toggleTheme}
            className="hidden md:block text-muted-foreground hover:text-foreground p-1.5 transition-colors rounded-sm cursor-pointer focus:outline-none border border-transparent hover:border-border/20"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="hidden md:flex items-center gap-1 text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground font-medium px-2 py-1.5 transition-colors border border-border/20 hover:border-border/60 rounded-sm cursor-pointer focus:outline-none"
            style={sans}
          >
            <Globe size={11} />
            <span>{language === "en" ? "عربي" : "EN"}</span>
          </button>

          <button onClick={() => setIsSearchOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus:outline-none p-1">
            <Search size={17} />
          </button>

          <Link to={isAuthenticated ? "/profile" : "/login"} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <User size={17} />
          </Link>

          <Link to="/wishlist" className="hidden md:block relative text-muted-foreground hover:text-foreground transition-colors p-1">
            <Heart size={17} />
            {wishCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-semibold">
                {wishCount}
              </span>
            )}
          </Link>

          <Link to="/cart" className="relative text-muted-foreground hover:text-foreground transition-colors p-1">
            <ShoppingBag size={17} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-semibold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* الموبايل والـ Overlays */}
      {(menuOpen || visibleCount === 0) && menuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/97 backdrop-blur-xl flex flex-col items-center justify-start gap-4 overflow-y-auto pt-24 pb-8 px-6 transition-colors duration-300"
          dir={language === "ar" ? "rtl" : "ltr"}
        >
          {allLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`text-foreground font-light hover:text-primary transition-colors whitespace-nowrap text-center max-w-full ${
                language === "ar" 
                  ? "text-base font-medium tracking-normal" 
                  : "text-[14px] xs:text-[16px] sm:text-xl tracking-[0.18em] xs:tracking-[0.25em] uppercase"
              }`}
              style={serif}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="mt-4 pt-4 border-t border-border/40 w-full max-w-[200px] flex flex-col items-center gap-4">
            <Link
              to="/wishlist"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground font-medium px-4 py-2 transition-colors border border-border/40 hover:border-border rounded-sm w-full justify-center"
              style={sans}
            >
              <Heart size={14} className={wishCount > 0 ? "fill-primary text-primary" : ""} />
              <span>{language === "en" ? `Wishlist (${wishCount})` : `المفضلة (${wishCount})`}</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground font-medium px-4 py-2 transition-colors border border-border/40 hover:border-border rounded-sm w-full justify-center cursor-pointer focus:outline-none"
              style={sans}
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              <span>
                {darkMode 
                  ? (language === "en" ? "Light Mode" : "الوضع المضيء") 
                  : (language === "en" ? "Dark Mode" : "الوضع المظلم")}
              </span>
            </button>

            <button
              onClick={() => {
                setLanguage(language === "en" ? "ar" : "en");
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground font-medium px-4 py-2 transition-colors border border-border/40 hover:border-border rounded-sm w-full justify-center cursor-pointer focus:outline-none"
              style={sans}
            >
              <Globe size={14} />
              <span>{language === "en" ? "العربية" : "English"}</span>
            </button>
          </div>

          <button onClick={() => setMenuOpen(false)} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground cursor-pointer">
            <X size={24} />
          </button>
        </div>
      )}

      {/* Elegant Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-background/95 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-sm transition-all duration-300">
          <button onClick={() => setIsSearchOpen(false)} className="absolute top-8 right-8 text-muted-foreground hover:text-primary transition-colors cursor-pointer focus:outline-none">
            <X size={24} />
          </button>
          <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl border-b border-border/60 py-4 flex items-center gap-4">
            <Search size={22} className="text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t("searchPlaceholder")} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full bg-transparent text-2xl font-light text-foreground focus:outline-none placeholder:text-muted-foreground/30"
              style={serif}
            />
          </form>
        </div>
      )}
    </>
  );
}