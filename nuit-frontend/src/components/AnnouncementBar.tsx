import { useState, useEffect } from "react";
import { useLanguageStore, formatBilingual } from "../store/languageStore";

// ─── Constants ────────────────────────────────────────────────────────────────
const BAR_H  = 32;   // px — announcement bar height
const NAV_H  = 68;   // px — nav height; combined into --header-h CSS var

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000/api/v1"
    : "https://nuit-production.up.railway.app/api/v1";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RawAnnouncement {
  text?      : string;
  content?   : string;
  is_active? : boolean | number | string;
  active?    : boolean | number | string;
}

// ─── Pure helpers (no side-effects) ──────────────────────────────────────────
function isActive(a: RawAnnouncement): boolean {
  const v = a.is_active !== undefined ? a.is_active : a.active;
  return v !== false && v !== 0 && v !== "0";
}

function getText(a: RawAnnouncement | string): string {
  return typeof a === "string" ? a : String(a.text || a.content || "");
}

// ─── Sub-component: one group of items ───────────────────────────────────────
interface GroupItemsProps {
  texts    : string[];
  language : "en" | "ar";
}

function GroupItems({ texts, language }: GroupItemsProps) {
  // إذا كان عدد النصوص قليلاً، نكرر المصفوفة داخلياً لملأ عرض الشاشة فوراً ومنع التأخير والفجوات
  const duplicatedTexts = texts.length < 4 ? [...texts, ...texts, ...texts] : texts;

  return (
    <div className="flex items-center shrink-0">
      {duplicatedTexts.map((raw, i) => {
        const label   = formatBilingual(raw, language);
        const isArabic = /[\u0600-\u06FF]/.test(label);

        return (
          <span
            key={i}
            className="inline-flex items-center shrink-0"
            style={{ unicodeBidi: "isolate" }}
          >
            {/* ── Label ── */}
            <span
              className="
                px-8
                text-[12px] font-medium tracking-[0.18em] uppercase
                text-muted-foreground
                lining-nums
              "
              style={{
                fontFamily        : language === "ar" ? "'Cairo', sans-serif" : "'Raleway', sans-serif",
                fontVariantNumeric: "lining-nums",
                direction         : isArabic ? "rtl" : "ltr",
                unicodeBidi       : "isolate",
              }}
            >
              {label}
            </span>

            {/* ── Divider ── */}
            <span aria-hidden className="text-[9px] text-primary/40 mx-2">
              ✦
            </span>
          </span>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AnnouncementBar() {
  const [texts,  setTexts]  = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { language } = useLanguageStore();

  // ── 1. Fetch active announcements ─────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/announcements?t=${Date.now()}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        const raw: (RawAnnouncement | string)[] =
          payload && typeof payload === "object" && "data" in payload
            ? payload.data
            : Array.isArray(payload)
            ? payload
            : [];

        const clean = raw
          .filter((a) => {
            if (!a) return false;
            if (typeof a === "string") return a.trim() !== "";
            return isActive(a);
          })
          .map(getText)
          .filter((t) => t.trim() !== "");

        setTexts(clean);
      })
      .catch((err) => console.error("[AnnouncementBar]", err))
      .finally(() => setLoaded(true));
  }, []);

  // ── 2. Keep --header-h in sync ─────────────────────────────────────────────
  useEffect(() => {
    const h = loaded && texts.length > 0 ? BAR_H + NAV_H : NAV_H;
    document.documentElement.style.setProperty("--header-h", `${h}px`);
  }, [loaded, texts]);

  if (!loaded || texts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Site announcements"
      className="group relative w-full overflow-hidden select-none bg-muted border-b border-border"
      style={{ height: BAR_H }}
    >
      {/* ── Left edge fade ──────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16
                   bg-gradient-to-r from-muted to-transparent"
      />

      {/* ── Right edge fade ─────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16
                   bg-gradient-to-l from-muted to-transparent"
      />

      {/* 
        ── Scrolling track ─────────────────────────────────────────────────
        تم إزالة ريفيرس حركة الـ CSS والاعتماد على حركة خطية موحدة ومستمرة (ltr بملء الشاشة)، 
        لتجنب قفزات وحسابات الـ Viewport العكسية في العربي.
      */}
      <div
        className="absolute inset-y-0 flex items-center animate-nuit-marquee group-hover:[animation-play-state:paused]"
        style={{ direction: "ltr" }}
      >
        {/* Group A — primary content */}
        <GroupItems texts={texts} language={language} />

        {/* Group B — seamless clone */}
        <div aria-hidden className="flex items-center">
          <GroupItems texts={texts} language={language} />
        </div>
      </div>
    </div>
  );
}