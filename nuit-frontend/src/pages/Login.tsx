import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useLanguageStore } from "../store/languageStore";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/shop"; // Default redirect path if none is provided

  // 🛠️ تم إزالة setError من هنا لمنع خطأ التايب سكريبت
  const { register, login, loginWithGoogle, loading, error, clearError, isAuthenticated } = useAuthStore();
  const { cart, loadFromDB, loadWishlistFromDB } = useCartStore();
  const { t, language } = useLanguageStore();
  const isAr = language === "ar";

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [localError, setLocalError] = useState<string | null>(null); // الستيت المحلية لتهندل الـ Validation

  useEffect(() => { 
    clearError(); 
    setLocalError(null);
  }, [isSignUp, clearError]);

  // 🌐 Google Sign-in — stable ref so the callback is always fresh without re-initializing
  const googleCallbackRef = useRef<(response: any) => void>(async () => {});

  // Keep the ref up to date on every render (no re-init needed)
  const stableCartRef = useRef(cart);
  stableCartRef.current = cart;

  const stableNavigate = useRef(navigate);
  stableNavigate.current = navigate;

  // Build a stable callback that reads the latest values via refs
  useEffect(() => {
    googleCallbackRef.current = async (response: any) => {
      if (!response.credential) return;
      clearError();
      setLocalError(null);
      const guestItems = stableCartRef.current.map(i => ({ product_id: i.product.id, quantity: i.quantity }));
      const success = await loginWithGoogle(response.credential, guestItems);
      if (success) {
        await Promise.all([loadFromDB(), loadWishlistFromDB()]);
        stableNavigate.current(redirect, { replace: true });
      }
    };
  }, [loginWithGoogle, loadFromDB, loadWishlistFromDB, redirect, clearError]);

  // Initialize Google GSI exactly once on mount — avoids repeated init that triggers blocked popups
  const initGoogleRef = useRef<(() => boolean) | null>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
    if (!clientId) {
      console.warn("[Google Sign-In] VITE_GOOGLE_CLIENT_ID is not set.");
    }

    const initGoogle = (locale: string) => {
      const g = (window as any).google;
      if (!g?.accounts) return false;

      g.accounts.id.initialize({
        client_id: clientId,
        // Route all callbacks through the ref — always calls the latest version
        callback: (response: any) => googleCallbackRef.current(response),
        // Disable One-Tap / automatic popup prompt — these get blocked by the browser
        // Users click the rendered button instead (explicit user gesture = no block)
        cancel_on_tap_outside: true,
        auto_select: false,
        use_fedcm_for_prompt: false,
      });

      const container = document.getElementById("google-login-btn");
      if (container) {
        // Clear previous button before re-rendering with new locale
        container.innerHTML = "";
        g.accounts.id.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "square",
          width: 340,
          locale,          // ← renders button in Arabic or English
        });
      }
      return true;
    };

    // Store initGoogle in a ref so the language-change effect can call it too
    initGoogleRef.current = () => initGoogle(useLanguageStore.getState().language === "ar" ? "ar" : "en");

    if (initGoogleRef.current()) return; // SDK already loaded — done

    // SDK not yet loaded — poll until it arrives (max 2 seconds)
    let count = 0;
    const interval = setInterval(() => {
      if (initGoogleRef.current?.() || ++count > 20) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, []); // ← runs ONCE on mount only

  // Re-render Google button when language changes so it shows in the correct language
  useEffect(() => {
    initGoogleRef.current?.();
  }, [language]);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([loadFromDB(), loadWishlistFromDB()]).then(() =>
        navigate(redirect, { replace: true })
      );
    }
  }, [isAuthenticated, navigate, redirect, loadFromDB, loadWishlistFromDB]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    const guestItems = cart.map(i => ({ product_id: i.product.id, quantity: i.quantity }));
    
    if (isSignUp) {
      // 🔐 الفحص الصارم لتطابق كلمتي المرور قبل إرسال البيانات للسيرفر
      if (password !== passwordConfirm) {
        const errorMsg = isAr 
          ? "كلمتا المرور غير متطابقتين، يرجى التحقق مرة أخرى." 
          : "Passwords do not match. Please try again.";
        
        setLocalError(errorMsg);
        return; // إيقاف العملية فوراً
      }

      const success = await register({ name, email, phone, password, password_confirmation: passwordConfirm }, guestItems);
      if (success) Promise.all([loadFromDB(), loadWishlistFromDB()]).then(() => navigate(redirect, { replace: true }));
    } else {
      const success = await login({ email, password }, guestItems);
      if (success) Promise.all([loadFromDB(), loadWishlistFromDB()]).then(() => navigate(redirect, { replace: true }));
    }
  };

  // Translate the error key stored in authStore — store holds translation keys, not raw strings
  const displayError = error ? (t(error as any) || error) : localError;

  return (
    <div
      className="pt-32 pb-24 px-6 md:px-12 min-h-screen bg-background flex flex-col justify-center items-center"
      style={sans}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-[420px] bg-secondary/35 border border-border/60 p-8 md:p-10 backdrop-blur-md relative select-none">

        {/* Brand */}
        <div className="text-center mb-8">
          <p className="text-3xl tracking-[0.45em] uppercase text-foreground mb-1" style={serif}>Nuit</p>
          <span className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground">Maison de Parfum</span>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-border/40 mb-8">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 pb-3 text-[10px] ${isAr ? "" : "tracking-[0.25em]"} uppercase transition-colors relative cursor-pointer ${!isSignUp ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t("signInBtn")}
            {!isSignUp && <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary animate-pulse" />}
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 pb-3 text-[10px] ${isAr ? "" : "tracking-[0.25em]"} uppercase transition-colors relative cursor-pointer ${isSignUp ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t("register")}
            {isSignUp && <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary animate-pulse" />}
          </button>
        </div>

        {/* Error Container */}
        {displayError && (
          <div className="mb-6 bg-red-500/5 border border-red-500/15 p-3 rounded-sm flex items-start gap-2.5 text-xs text-red-400">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <p>{displayError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div>
              <label className={`block text-[9px] uppercase text-muted-foreground/80 mb-2 ${isAr ? "" : "tracking-widest"}`}>{t("fullName")}</label>
              <input
                type="text" required value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isAr ? "محمد أحمد" : "Alexander Wright"}
                className={`w-full bg-background border border-border/80 px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/45 outline-none focus:border-primary transition-colors ${isAr ? "text-right" : ""}`}
              />
            </div>
          )}

          <div>
            <label className={`block text-[9px] uppercase text-muted-foreground/80 mb-2 ${isAr ? "" : "tracking-widest"}`}>{t("emailAddress")}</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alexander@nuit.com"
              className={`w-full bg-background border border-border/80 px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/45 outline-none focus:border-primary transition-colors ${isAr ? "text-right" : ""}`}
            />
          </div>

          {isSignUp && (
            <div>
              <label className={`block text-[9px] uppercase text-muted-foreground/80 mb-2 ${isAr ? "" : "tracking-widest"}`}>{t("phoneNumber")}</label>
              <input
                type="tel" required value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 100 123 4567"
                className={`w-full bg-background border border-border/80 px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/45 outline-none focus:border-primary transition-colors ${isAr ? "text-right" : ""}`}
              />
            </div>
          )}

          <div>
            <label className={`block text-[9px] uppercase text-muted-foreground/80 mb-2 ${isAr ? "" : "tracking-widest"}`}>{t("password")}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-background border border-border/80 py-3 text-xs text-foreground placeholder:text-muted-foreground/45 outline-none focus:border-primary transition-colors ${isAr ? "pr-4 pl-10 text-right" : "pl-4 pr-10"}`}
              />
              <button
                type="button" onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer ${isAr ? "left-3" : "right-3"}`}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className={`block text-[9px] uppercase text-muted-foreground/80 mb-2 ${isAr ? "" : "tracking-widest"}`}>{t("confirmPassword")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} required value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-background border border-border/80 py-3 text-xs text-foreground placeholder:text-muted-foreground/45 outline-none focus:border-primary transition-colors ${isAr ? "pr-4 pl-10 text-right" : "pl-4 pr-10"}`}
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer ${isAr ? "left-3" : "right-3"}`}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className={`w-full bg-foreground text-background text-[10px] ${isAr ? "" : "tracking-[0.25em]"} uppercase py-4 font-semibold hover:bg-foreground/90 disabled:opacity-40 transition-colors cursor-pointer mt-3 shadow-md`}
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : isSignUp ? t("createAccountBtn") : t("signInBtn")}
          </button>
        </form>

        {/* Google Sign-in Separator & Button */}
        <div className="my-6 flex items-center justify-between gap-4 select-none">
          <span className="h-[1px] bg-border/40 flex-1" />
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60">
            {t("orContinueWithGoogle")}
          </span>
          <span className="h-[1px] bg-border/40 flex-1" />
        </div>

        <div className="flex justify-center w-full min-h-[44px] mb-4">
          <div id="google-login-btn" className="w-full flex justify-center hover:opacity-90 transition-opacity" />
        </div>

        <p className="mt-8 text-center text-[10px] text-muted-foreground/60 leading-relaxed font-light">
          {t("termsLine")}{" "}
          <span onClick={() => navigate("/terms-conditions")} className="underline hover:text-foreground cursor-pointer">{t("termsOfService")}</span>
          {" "}{t("and")}{" "}
          <span onClick={() => navigate("/privacy-policy")} className="underline hover:text-foreground cursor-pointer">{t("privacyPolicyLink")}</span>.
        </p>
      </div>
    </div>
  );
}