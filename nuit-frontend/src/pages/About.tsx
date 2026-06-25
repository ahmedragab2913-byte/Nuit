import { useLanguageStore } from "../store/languageStore";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function About() {
  const { t, language } = useLanguageStore();
  const isAr = language === "ar";

  return (
    <div style={sans} className="bg-background min-h-screen" dir={isAr ? "rtl" : "ltr"}>
      <section className="px-8 lg:px-20 py-28 border-t border-border bg-background">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">

          {/* Text content */}
          <div className={`space-y-6 ${isAr ? "text-right" : ""}`}>
            <p className={`text-[11px] ${isAr ? "" : "tracking-[0.5em]"} uppercase text-primary mb-3`}>
              {t("aboutNuit")}
            </p>
            <h2 className="text-4xl lg:text-5xl font-light text-foreground" style={serif}>
              {t("ourStory")}<br />
              <em className="text-primary/90">{t("craftedWithPassion")}</em>
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed text-sm font-light">
              {t("aboutDesc1Page")}
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed text-sm font-light">
              {t("aboutDesc2Page")}
            </p>
            
            <h3 className="text-2xl font-medium mb-2" style={serif}>{t("ourVision")}</h3>
            <p className="text-base mb-4 text-muted-foreground text-sm font-light leading-relaxed">
              {t("ourVisionDesc")}
            </p>

            {/* نقاط التميز الخاصة بالعطور الفاخرة والبراند */}
            <h3 className="text-2xl font-medium mb-2" style={serif}>
              {isAr ? "لماذا تتسوق من Nuit؟" : "Why Shop From Nuit?"}
            </h3>
            <ul className={`list-none space-y-3 text-sm text-muted-foreground ${isAr ? "pr-0" : "pl-0"}`}>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✦</span>
                <span>
                  {isAr 
                    ? "مجموعة مختارة من أشهر وأرقى العطور العالمية بين يديك." 
                    : "A curated collection of the finest and most celebrated global fragrances."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✦</span>
                <span>
                  {isAr 
                    ? "ضمان الجودة العالية والنقاء التام لكل زجاجة عطر نقوم بتوفيرها." 
                    : "Guaranteed premium quality and pristine formulation in every single bottle."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✦</span>
                <span>
                  {isAr 
                    ? "تجربة تسوق فاخرة وموثوقة تليق بأصحاب الذوق الرفيع." 
                    : "A luxury, trusted shopping experience tailored for fragrance connoisseurs."}
                </span>
              </li>
            </ul>
          </div>

          {/* Image side */}
          <div className="relative">
            <div className="aspect-[4/5] bg-secondary overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1000&auto=format&fit=crop&q=80"
                alt="Luxury Fragrance Collection"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* مربع سنة التأسيس الفاخر مع الـ lining-nums للاستقامة الفنية */}
            <div className={`absolute -bottom-6 ${isAr ? "-right-6" : "-left-6"} w-36 h-36 border border-border bg-background flex flex-col items-center justify-center`}>
              <p className={`text-[11px] ${isAr ? "" : "tracking-[0.2em]"} uppercase text-muted-foreground mb-1`}>
                {t("est")}
              </p>
              <p className="text-3xl text-foreground font-light lining-nums" style={serif}>2020</p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}