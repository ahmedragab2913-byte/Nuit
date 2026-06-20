import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguageStore } from "../store/languageStore";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function NotFound() {
  const navigate = useNavigate();
  const { t, language } = useLanguageStore();
  const isAr = language === "ar";

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center select-none"
      style={sans}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="relative mb-8">
        <h1
          className="text-9xl md:text-[12rem] font-light text-foreground/5 tracking-wider select-none"
          style={serif}
        >
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className={`text-sm ${isAr ? "" : "tracking-[0.4em]"} uppercase text-primary font-medium bg-background px-4 py-1`}>
            {t("compositionLost")}
          </p>
        </div>
      </div>

      <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4" style={serif}>
        {t("pageNotFound")}
      </h2>

      <p className="text-muted-foreground text-sm font-light max-w-sm mb-10 leading-relaxed">
        {t("notFoundDesc")}
      </p>

      <button
        onClick={() => navigate("/")}
        className={`group flex items-center gap-3 text-[10px] ${isAr ? "" : "tracking-[0.25em]"} uppercase text-foreground border border-border px-8 py-4 hover:border-primary hover:text-primary transition-all duration-300 cursor-pointer`}
      >
        <ArrowLeft
          size={13}
          className={`group-hover:-translate-x-1 transition-transform ${isAr ? "rotate-180 group-hover:translate-x-1 group-hover:-translate-x-0" : ""}`}
        />
        {t("returnToHome")}
      </button>
    </div>
  );
}
