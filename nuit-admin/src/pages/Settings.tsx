import { useState, useEffect, useCallback } from "react";
import { User, Lock, Eye, EyeOff, Save, ShieldCheck, AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { updateAdminProfile, updateAdminPassword, extractErrorMessage, apiGetMe } from "../services/api";

const serif = { fontFamily: "'Playfair Display', serif" };

// ─── Small reusable components ──────────────────────────────────────────────

function StatusMessage({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs tracking-wide border ${
        type === "success"
          ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-400"
          : "bg-red-500/8 border-red-500/20 text-red-400"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 size={14} className="shrink-0" />
      ) : (
        <AlertCircle size={14} className="shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[10px] uppercase tracking-[0.15em] text-white/30 mb-2 font-medium"
    >
      {children}
    </label>
  );
}

function InputField({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  rightElement,
}: {
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed pr-10"
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
      )}
    </div>
  );
}

// ─── Main Settings Page ────────────────────────────────────────────────────

export default function Settings() {
  const { user, checkAuth } = useAuthStore();

  // ── Profile State ──────────────────────────────────
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Password State ─────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Populate profile form from auth user
  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const data = await apiGetMe();
      const u = data.user ?? data;
      setProfileName(u.name ?? "");
      setProfileEmail(u.email ?? "");
      setProfilePhone(u.phone ?? "");
    } catch {
      // Fall back to store user
      if (user) {
        setProfileName(user.name ?? "");
        setProfileEmail(user.email ?? "");
      }
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ── Handlers ───────────────────────────────────────

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) {
      setProfileStatus({ type: "error", message: "Name and email are required." });
      return;
    }
    setProfileSaving(true);
    setProfileStatus(null);
    try {
      await updateAdminProfile({ name: profileName.trim(), email: profileEmail.trim(), phone: profilePhone.trim() || undefined });
      await checkAuth(); // Refresh store with updated user
      setProfileStatus({ type: "success", message: "Profile updated successfully." });
    } catch (err) {
      setProfileStatus({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileStatus(null), 5000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({ type: "error", message: "All password fields are required." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus({ type: "error", message: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "New passwords do not match." });
      return;
    }
    setPasswordSaving(true);
    setPasswordStatus(null);
    try {
      await updateAdminPassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setPasswordStatus({ type: "success", message: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordStatus({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setPasswordSaving(false);
      setTimeout(() => setPasswordStatus(null), 5000);
    }
  };

  const EyeToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className="text-white/25 hover:text-white/50 transition-colors cursor-pointer"
      tabIndex={-1}
    >
      {show ? <EyeOff size={14} /> : <Eye size={14} />}
    </button>
  );

  return (
    <div className="min-h-full bg-[#070707] px-6 py-10 lg:px-10 lg:py-12">
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/25 mb-2">Console</p>
          <h1
            className="text-[28px] font-light text-white/90 leading-none tracking-wide"
            style={serif}
          >
            Account Settings
          </h1>
          <p className="mt-2 text-xs text-white/30 tracking-wide">
            Manage your admin profile and security credentials
          </p>
        </div>

        <button
          onClick={loadProfile}
          disabled={profileLoading}
          className="flex items-center gap-2 border border-white/8 hover:border-white/18 rounded-lg px-4 py-2.5 text-[10px] tracking-[0.15em] uppercase text-white/40 hover:text-white/70 transition-all cursor-pointer disabled:opacity-40"
        >
          <RefreshCw size={12} className={profileLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Admin Badge ───────────────────────────────────── */}
      <div className="mb-8 flex items-center gap-4 p-5 rounded-2xl bg-white/3 border border-white/6">
        <div className="w-12 h-12 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center">
          <User size={20} className="text-white/40" />
        </div>
        <div>
          <p className="text-sm font-medium text-white/80" style={serif}>
            {user?.name || "—"}
          </p>
          <p className="text-xs text-white/35 mt-0.5">{user?.email || "—"}</p>
        </div>
        <div className="ml-auto">
          <span className="px-3 py-1 rounded-full text-[9px] uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-400/80">
            Administrator
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ════════════════════════════════════════════════════
            Profile Information
        ════════════════════════════════════════════════════ */}
        <div className="rounded-2xl bg-white/3 border border-white/6 p-7">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-7 pb-5 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center">
              <User size={14} className="text-white/40" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-medium">
                Profile Information
              </p>
              <p className="text-[10px] text-white/25 mt-0.5">
                معلومات الحساب · Account Details
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleProfileSave} className="space-y-5">
            {/* Full Name */}
            <div>
              <FieldLabel htmlFor="profileName">Full Name · الاسم الكامل</FieldLabel>
              <InputField
                id="profileName"
                value={profileName}
                onChange={setProfileName}
                placeholder="Your full name"
                disabled={profileLoading}
              />
            </div>

            {/* Email */}
            <div>
              <FieldLabel htmlFor="profileEmail">Email Address · البريد الإلكتروني</FieldLabel>
              <InputField
                id="profileEmail"
                type="email"
                value={profileEmail}
                onChange={setProfileEmail}
                placeholder="admin@example.com"
                disabled={profileLoading}
              />
            </div>

            {/* Phone */}
            <div>
              <FieldLabel htmlFor="profilePhone">Phone Number · رقم الهاتف</FieldLabel>
              <InputField
                id="profilePhone"
                type="tel"
                value={profilePhone}
                onChange={setProfilePhone}
                placeholder="+20 1XX XXX XXXX"
                disabled={profileLoading}
              />
            </div>

            {/* Status */}
            {profileStatus && (
              <StatusMessage type={profileStatus.type} message={profileStatus.message} />
            )}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={profileSaving || profileLoading}
                className="flex items-center gap-2.5 bg-white text-black hover:bg-white/90 transition-colors rounded-lg px-6 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {profileSaving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                {profileSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* ════════════════════════════════════════════════════
            Password & Security
        ════════════════════════════════════════════════════ */}
        <div className="rounded-2xl bg-white/3 border border-white/6 p-7">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-7 pb-5 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center">
              <Lock size={14} className="text-white/40" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-medium">
                Security & Password
              </p>
              <p className="text-[10px] text-white/25 mt-0.5">
                الأمان وكلمة المرور · Credentials
              </p>
            </div>
          </div>

          {/* Security rules callout */}
          <div className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-lg bg-white/2 border border-white/5 text-[10px] tracking-wide text-white/30">
            <ShieldCheck size={13} className="shrink-0 mt-0.5 text-white/25" />
            <span>
              New password must be at least 8 characters. Use a strong mix of letters, numbers and symbols for best protection.
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handlePasswordChange} className="space-y-5">
            {/* Current Password */}
            <div>
              <FieldLabel htmlFor="currentPwd">Current Password · كلمة المرور الحالية</FieldLabel>
              <InputField
                id="currentPwd"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="Enter current password"
                rightElement={<EyeToggle show={showCurrent} onToggle={() => setShowCurrent((p) => !p)} />}
              />
            </div>

            {/* New Password */}
            <div>
              <FieldLabel htmlFor="newPwd">New Password · كلمة المرور الجديدة</FieldLabel>
              <InputField
                id="newPwd"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={setNewPassword}
                placeholder="At least 8 characters"
                rightElement={<EyeToggle show={showNew} onToggle={() => setShowNew((p) => !p)} />}
              />
              {/* Strength indicator */}
              {newPassword.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                        newPassword.length > i * 3
                          ? newPassword.length < 6
                            ? "bg-red-500/60"
                            : newPassword.length < 10
                            ? "bg-amber-500/60"
                            : "bg-emerald-500/60"
                          : "bg-white/8"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <FieldLabel htmlFor="confirmPwd">Confirm Password · تأكيد كلمة المرور</FieldLabel>
              <InputField
                id="confirmPwd"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter new password"
                rightElement={<EyeToggle show={showConfirm} onToggle={() => setShowConfirm((p) => !p)} />}
              />
              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <p
                  className={`mt-1.5 text-[10px] tracking-wide ${
                    newPassword === confirmPassword ? "text-emerald-400/70" : "text-red-400/70"
                  }`}
                >
                  {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            {/* Status */}
            {passwordStatus && (
              <StatusMessage type={passwordStatus.type} message={passwordStatus.message} />
            )}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordSaving}
                className="flex items-center gap-2.5 bg-white text-black hover:bg-white/90 transition-colors rounded-lg px-6 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {passwordSaving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <ShieldCheck size={13} />
                )}
                {passwordSaving ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Decorative footer note ────────────────────────── */}
      <p className="mt-10 text-center text-[10px] tracking-[0.2em] uppercase text-white/15">
        Maison Nuit · Admin Console
      </p>
    </div>
  );
}
