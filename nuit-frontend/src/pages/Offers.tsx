import { Sparkles } from "lucide-react";
import { useLanguageStore } from "../store/languageStore";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function Offers() {
  const { t, language } = useLanguageStore();
  const isAr = language === "ar";

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background px-6"
      style={sans}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="text-center space-y-6">
        <Sparkles className="mx-auto text-primary animate-pulse" size={40} />

        <h1
          className={`text-4xl md:text-6xl font-light text-foreground ${isAr ? "" : "tracking-[0.25em] uppercase"}`}
          style={serif}
        >
          {t("comingSoon")}
        </h1>

        <div className="w-24 h-[1px] bg-primary/60 mx-auto" />

        <p className="text-muted-foreground text-sm font-light max-w-sm mx-auto leading-relaxed">
          {t("offersDesc")}
        </p>
      </div>
    </div>
  );
}