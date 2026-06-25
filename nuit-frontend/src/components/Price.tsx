import { useLanguageStore } from "../store/languageStore";
import type { Language } from "../store/languageStore";

// ─── Types ──────────────────────────────────────────────────────────────────
interface PriceProps {
  /** The current (sale) price to display */
  amount: number | string | null | undefined;
  /** Optional original price — shown struck-through when greater than `amount` */
  originalAmount?: number | string | null | undefined;
  /** Currency code. Defaults to "EGP". */
  currency?: string;
  /** Tailwind size variant. Defaults to "md". */
  size?: "sm" | "md" | "lg" | "xl";
  /** Extra Tailwind classes forwarded to the root wrapper */
  className?: string;
}

// ─── Formatting ──────────────────────────────────────────────────────────────
const LOCALE_MAP: Record<Language, string> = {
  en: "en-US",
  ar: "ar-EG",
};

const CURRENCY_SYMBOL: Record<string, Record<Language, string>> = {
  EGP: { en: "EGP", ar: "ج.م" },
  USD: { en: "USD", ar: "دولار" },
  SAR: { en: "SAR", ar: "ر.س" },
};

function toNumber(val: number | string | null | undefined): number {
  if (val === null || val === undefined || val === "") return 0;
  const n = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(n) ? 0 : n;
}

function formatAmount(val: number, lang: Language): string {
  return new Intl.NumberFormat(LOCALE_MAP[lang], {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(val);
}

function buildLabel(val: number, lang: Language, currency: string): string {
  const symbol = CURRENCY_SYMBOL[currency]?.[lang] ?? currency;
  const formatted = formatAmount(val, lang);
  // Arabic: "1,200 ج.م" — English: "EGP 1,200"
  return lang === "ar" ? `${formatted} ${symbol}` : `${symbol} ${formatted}`;
}

// ─── Size scale ──────────────────────────────────────────────────────────────
const SIZE_CLASSES = {
  sm: {
    price    : "text-sm   tracking-[0.12em]",
    original : "text-xs   tracking-[0.1em]",
    font     : "font-medium",
  },
  md: {
    price    : "text-base tracking-[0.16em]",
    original : "text-xs   tracking-[0.12em]",
    font     : "font-medium",
  },
  lg: {
    price    : "text-lg   tracking-[0.18em]",
    original : "text-sm   tracking-[0.14em]",
    font     : "font-semibold",
  },
  xl: {
    price    : "text-2xl  tracking-[0.2em]",
    original : "text-base tracking-[0.16em]",
    font     : "font-semibold",
  },
} as const;

// ─── Component ──────────────────────────────────────────────────────────────
/**
 * Price — unified luxury price display for Maison Nuit.
 *
 * Color behaviour (via semantic tokens):
 *   Light mode — text-primary → #4f6271 (Muted Steel Blue)
 *   Dark  mode — text-primary → #998C73 (Sandy Gold / warm amber)
 *
 * This gives a clean neutral-steel feel in daylight and a
 * warm-gold luxury feel in dark/night mode — both on-brand.
 */
export default function Price({
  amount,
  originalAmount,
  currency = "EGP",
  size     = "md",
  className = "",
}: PriceProps) {
  const { language } = useLanguageStore();
  const scale = SIZE_CLASSES[size];

  const current  = toNumber(amount);
  const original = toNumber(originalAmount);
  const hasDiscount = original > 0 && original > current;

  const currentLabel  = buildLabel(current,  language, currency);
  const originalLabel = hasDiscount ? buildLabel(original, language, currency) : null;

  return (
    /*
      Root: inline-flex so it drops naturally into any flex/grid parent.
      RTL-aware gap direction is handled by the parent html[dir].
    */
    <span
      className={`
        inline-flex items-baseline gap-2 flex-wrap
        ${className}
      `.trim()}
    >
      {/*
        ── Current / sale price ────────────────────────────────────────────
        text-primary resolves to:
          Light → #4f6271  (Muted Steel Blue — refined, luxury neutral)
          Dark  → #998C73  (Sandy Gold — warm, premium, night-mode jewel tone)

        uppercase + lining-nums keeps the numerals optically aligned
        and consistent with the brand's Playfair Display headers.
      */}
      <span
        className={`
          ${scale.price} ${scale.font}
          uppercase lining-nums
          text-primary
        `.trim()}
        style={{ fontFamily: "'Playfair Display', serif", fontVariantNumeric: "lining-nums" }}
      >
        {currentLabel}
      </span>

      {/*
        ── Original / crossed-out price ────────────────────────────────────
        Only renders when originalAmount > amount.
        text-muted-foreground/60 gives a 40% transparent overlay of the
        muted foreground color (#778ca4 in both modes) — readable but
        clearly de-emphasised, zero hardcoded values.
      */}
      {hasDiscount && originalLabel && (
        <span
          className={`
            ${scale.original}
            line-through decoration-1
            text-muted-foreground/60
            font-light
          `.trim()}
          style={{ fontFamily: "'Raleway', sans-serif", fontVariantNumeric: "lining-nums" }}
          aria-label={`Original price: ${originalLabel}`}
        >
          {originalLabel}
        </span>
      )}
    </span>
  );
}
