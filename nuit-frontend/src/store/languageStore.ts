import { create } from "zustand";
import { translations } from "../lib/translations";

export type Language = "en" | "ar";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

// Helper to initialize HTML attributes on startup
const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem("language") as Language;
  const lang = saved === "ar" || saved === "en" ? saved : "en";
  
  // Set HTML direction and lang on initial load
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
  
  return lang;
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: getInitialLanguage(),
  setLanguage: (lang: Language) => {
    localStorage.setItem("language", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    set({ language: lang });
  },
  t: (key: string, replacements?: Record<string, string | number>) => {
    const lang = get().language;
    let text = translations[lang]?.[key] || translations["en"]?.[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replace(`{${placeholder}}`, String(value));
      });
    }
    return text;
  }
}));

/**
 * Parses a bilingual string using the custom ` || ` delimiter layout.
 * Safely falls back to the available string if the delimiter is missing or if one language string is empty.
 */
export function formatBilingual(text: string | null | undefined, lang: Language): string {
  if (text === null || text === undefined) return "";
  const str = String(text).trim();
  if (str.includes(" || ")) {
    const parts = str.split(" || ");
    const en = (parts[0] || "").trim();
    const ar = (parts[1] || "").trim();
    if (lang === "ar") {
      return ar || en;
    }
    return en || ar;
  }
  return str;
}

/**
 * Combines separate English and Arabic values, falling back to whichever is available.
 * Handles the ` || ` delimiter if present inside either string.
 */
export function getBilingualValue(
  enVal: string | null | undefined,
  arVal: string | null | undefined,
  lang: Language
): string {
  const cleanEn = formatBilingual(enVal, lang);
  const cleanAr = formatBilingual(arVal, lang);
  if (lang === "ar") {
    return cleanAr || cleanEn;
  }
  return cleanEn || cleanAr;
}

/**
 * Formats pricing with consistent currency symbols (EGP for LTR, ج.م for RTL).
 */
export function formatPrice(amount: number | string | undefined | null, lang: Language): string {
  if (amount === undefined || amount === null) return "";
  const num = typeof amount === "number" ? amount : parseFloat(String(amount)) || 0;
  const formattedNum = num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  if (lang === "ar") {
    return `${formattedNum} ج.م`;
  }
  return `EGP ${formattedNum}`;
}
