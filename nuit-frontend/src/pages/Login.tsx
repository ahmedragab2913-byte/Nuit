import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { Eye, EyeOff , AlertCircle } from "lucide-react";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/profile";

  const { register, login, loading, error, clearError, isAuthenticated } = useAuthStore();
  const { cart, loadFromDB } = useCartStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    clearError();
  }, [isSignUp, clearError]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFromDB().then(() => {
        navigate(redirect, { replace: true });
      });
    }
  }, [isAuthenticated, navigate, redirect, loadFromDB]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare guest cart item references to merge automatically
    const guestItems = cart.map(i => ({
      product_id: i.product.id,
      quantity: i.quantity
    }));

    if (isSignUp) {
      const success = await register({ name, email, phone, password }, guestItems);
      if (success) {
        loadFromDB().then(() => {
          navigate(redirect, { replace: true });
        });
      }
    } else {
      const success = await login({ email, password }, guestItems);
      if (success) {
        loadFromDB().then(() => {
          navigate(redirect, { replace: true });
        });
      }
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 min-h-screen bg-background flex flex-col justify-center items-center" style={sans}>
      <div className="w-full max-w-[420px] bg-secondary/35 border border-border/60 p-8 md:p-10 backdrop-blur-md relative select-none">
        
        {/* Brand identity */}
        <div className="text-center mb-8">
          <p className="text-3xl tracking-[0.45em] uppercase text-foreground mb-1" style={serif}>Nuit</p>
          <span className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground">Maison de Parfum</span>
        </div>

        {/* Action Toggle Switch */}
        <div className="flex border-b border-border/40 mb-8">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 pb-3 text-[10px] tracking-[0.25em] uppercase transition-colors relative cursor-pointer ${
              !isSignUp ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
            {!isSignUp && <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary animate-pulse" />}
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 pb-3 text-[10px] tracking-[0.25em] uppercase transition-colors relative cursor-pointer ${
              isSignUp ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Register
            {isSignUp && <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary animate-pulse" />}
          </button>
        </div>

        {/* Error alerting */}
        {error && (
          <div className="mb-6 bg-red-500/5 border border-red-500/15 p-3 rounded-sm flex items-start gap-2.5 text-xs text-red-400">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Input fields form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div>
              <label className="block text-[9px] tracking-widest uppercase text-muted-foreground/80 mb-2">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alexander Wright"
                className="w-full bg-background border border-border/80 px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/45 outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[9px] tracking-widest uppercase text-muted-foreground/80 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alexander@nuit.com"
              className="w-full bg-background border border-border/80 px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/45 outline-none focus:border-primary transition-colors"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-[9px] tracking-widest uppercase text-muted-foreground/80 mb-2">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 100 123 4567"
                className="w-full bg-background border border-border/80 px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/45 outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[9px] tracking-widest uppercase text-muted-foreground/80 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-border/80 pl-4 pr-10 py-3 text-xs text-foreground placeholder:text-muted-foreground/45 outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background text-[10px] tracking-[0.25em] uppercase py-4 font-semibold hover:bg-foreground/90 disabled:opacity-40 transition-colors cursor-pointer mt-3 shadow-md"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-muted-foreground/60 leading-relaxed font-light">
          By continuing, you agree to Nuit's <br />
          <span className="underline hover:text-foreground cursor-pointer">Terms of Service</span> and <span className="underline hover:text-foreground cursor-pointer">Privacy Policy</span>.
        </p>

      </div>
    </div>
  );
}
