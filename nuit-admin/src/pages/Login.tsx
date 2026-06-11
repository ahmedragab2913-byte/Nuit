import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/authStore";

const serif = { fontFamily: "'Playfair Display', serif" };

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error, clearError, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Clear errors on load
  useEffect(() => {
    clearError();
  }, [clearError]);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    const success = await login({ email, password });
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#050505] text-white">
      <div className="w-full max-w-md p-8 bg-white/4 border border-white/5 shadow-2xl rounded-lg backdrop-blur-xl relative">
        {/* Glow effect */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand logo */}
        <div className="flex flex-col items-center mb-10 text-center">
          <p className="text-4xl tracking-[0.45em] uppercase text-white font-light mb-2" style={serif}>Nuit</p>
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/30">Admin Console</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-md p-4 text-xs text-red-400">
            <AlertCircle size={14} className="flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2 font-medium">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@maison-nuit.com"
              className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3.5 text-sm placeholder:text-white/20 outline-none focus:border-white/30 focus:bg-white/8 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2 font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3.5 text-sm placeholder:text-white/20 outline-none focus:border-white/30 focus:bg-white/8 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black text-[10px] tracking-[0.25em] uppercase py-4 rounded-md font-semibold hover:bg-white/90 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LayoutDashboard size={13} />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
