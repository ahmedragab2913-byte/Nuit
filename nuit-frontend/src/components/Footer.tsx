import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { useLanguageStore } from "../store/languageStore";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'Raleway', sans-serif" };

export default function Footer() {
  const { t } = useLanguageStore();

  return (
    <footer className="bg-background border-t border-border px-6 lg:px-20 pt-16 pb-8" style={sans}>
      <div className="max-w-7xl mx-auto">
        
        {/* المجموعات الرئيسية الأربعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-border/60">
          
          {/* العمود الأول: عن البراند والسوشيال ميديا */}
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl tracking-[0.45em] uppercase text-foreground font-light" style={serif}>
              Nuit
            </h2>
            <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-xs">
              {t("brandDesc")}
            </p>
            <div className="mt-2">
              <p className="text-[11px] tracking-[0.2em] uppercase text-foreground font-medium mb-3">{t("followUs")}</p>
              <div className="flex items-center gap-5 text-muted-foreground">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                  <Instagram size={18} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                  <Facebook size={18} />
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                  {/* SVG مخصص لأيقونة تيك توك لتظهر بشكل رسمي ومثالي */}
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95 1.18 2.28 1.99 3.75 2.29V10.3c-1.21-.13-2.39-.59-3.41-1.27-.67-.44-1.25-.99-1.7-1.64v7.35c.04 1.34-.23 2.71-.85 3.89-.66 1.25-1.74 2.26-3.04 2.82-1.39.6-2.95.73-4.42.36-1.55-.38-2.98-1.3-3.95-2.58-1.04-1.37-1.52-3.13-1.34-4.86.18-1.73.99-3.35 2.3-4.46 1.34-1.14 3.12-1.68 4.87-1.49V8.65c-.94-.13-1.92.1-2.69.66-.75.54-1.23 1.39-1.32 2.33-.12 1.07.29 2.16 1.07 2.89.75.71 1.81 1.04 2.82.87 1.01-.16 1.88-.86 2.28-1.81.25-.57.34-1.2.32-1.82V.02z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* العمود الثاني: روابط هامة للعميل */}
          <div>
            <h3 className="text-[11px] tracking-[0.25em] uppercase text-foreground font-semibold mb-6">
              {t("importantLinks")}
            </h3>
            <ul className="space-y-3.5 text-sm font-light text-muted-foreground">
              <li><Link to="/shop" className="hover:text-primary transition-colors">{t("allCollections")}</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">{t("aboutUs")}</Link></li>
              <li><Link to="/terms-conditions" className="hover:text-primary transition-colors">{t("termsConditions")}</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">{t("privacyPolicy")}</Link></li>
            </ul>
          </div>

          {/* العمود الثالث: مزايا المتجر أونلاين */}
          <div>
            <h3 className="text-[11px] tracking-[0.25em] uppercase text-foreground font-semibold mb-6">
              {t("whyShopWithUs")}
            </h3>
            <ul className="space-y-4 text-sm font-light text-muted-foreground">
              <li className="flex items-center gap-3">
                <Truck size={15} className="text-primary/80" />
                <span>{t("fastDelivery")}</span>
              </li>
              <li className="flex items-center gap-3">
                <RotateCcw size={15} className="text-primary/80" />
                <span>{t("easyReturns")}</span>
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck size={15} className="text-primary/80" />
                <span>{t("authenticProducts")}</span>
              </li>
            </ul>
          </div>

          {/* العمود الرابع: بيانات الاتصال والـ WhatsApp */}
          <div>
            <h3 className="text-[11px] tracking-[0.25em] uppercase text-foreground font-semibold mb-6">
              {t("contactUs")}
            </h3>
            <ul className="space-y-4 text-sm font-light text-muted-foreground">
              <li className="flex items-center gap-3 group">
                <Mail size={14} className="group-hover:text-primary transition-colors" />
                <a href="mailto:info@maisonnuit.com" className="hover:text-primary transition-colors break-all">
                  info@maisonnuit.com
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                {/* أيقونة الواتساب الرسمية */}
                <svg 
                  className="w-4 h-4 group-hover:text-primary transition-colors fill-current text-muted-foreground" 
                  viewBox="0 0 24 24"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397 0 12.008 0c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 12.004-11.948 12.004-1.998-.001-3.951-.5-5.688-1.448L0 24zm6.59-4.859c1.72.101 2.382.204 3.906.83 1.514.621 3.382 1.247 5.656.63 1.334-.361 2.502-1.011 3.428-1.921 1.252-1.233 2.148-2.9 2.502-4.73.344-1.783.181-3.69-.46-5.322-.601-1.527-1.688-2.771-3.072-3.49-1.684-.875-3.655-1.127-5.5-.7-1.57.363-2.96 1.157-3.952 2.276-.948 1.07-1.517 2.457-1.603 3.931-.048.815.022 1.543.21 2.322.253 1.048.742 2.003 1.417 2.801l-.417 1.523 1.54-.424z"/>
                </svg>
                {/* اللينك المعدل بالرسالة الجاهزة الكود الدولي الصحيح */}
                <a 
                  href="https://wa.me/201096959237?text=%E2%80%8E%20Hello%20Nuit%2C%20I%20was%20on%20your%20website%20and%20I%20need%20assistance%20with%20a%20fragrance." 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-primary transition-colors text-left"
                  dir="ltr"
                >
                  +20 109 695 9237
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* الحقوق السفلى والـ Powered By */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs tracking-wider text-muted-foreground/80">
          <p>{t("rightsReserved")}</p>
          <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
            <span>{t("poweredBy")}</span>
            <span className="font-semibold tracking-widest uppercase text-foreground text-[10px]">{t("nuitTeam")}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}