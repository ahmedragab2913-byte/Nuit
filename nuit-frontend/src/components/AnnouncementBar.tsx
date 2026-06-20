import { useState, useEffect } from "react";
import { useLanguageStore, formatBilingual } from "../store/languageStore";

const BAR_H = 32;
const NAV_H = 68;

export default function AnnouncementBar() {
  const [texts, setTexts] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { language } = useLanguageStore();

  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://127.0.0.1:8000/api/v1' 
    : 'https://nuit-production.up.railway.app/api/v1'; 

  useEffect(() => {
    fetch(`${API_BASE}/announcements?t=${new Date().getTime()}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((resData) => {
        const items = resData && typeof resData === 'object' && 'data' in resData 
          ? resData.data 
          : (Array.isArray(resData) ? resData : []);
        
        const result: string[] = Array.isArray(items) 
          ? items
              .filter((a: any) => {
                if (!a) return false;
                if (typeof a === "string") return true;
                const isActiveValue = a.is_active !== undefined ? a.is_active : a.active;
                return isActiveValue !== false && isActiveValue !== 0 && isActiveValue !== "0";
              })
              .map((a: any) => typeof a === "string" ? a : String(a.text || a.content || ""))
              .filter((text: string) => text.trim() !== "")
          : [];

        setTexts(result);
      })
      .catch((err) => console.error("Announcement Error:", err))
      .finally(() => setLoaded(true));
  }, [API_BASE]);

  useEffect(() => {
    const h = loaded && texts.length > 0 ? BAR_H + NAV_H : NAV_H;
    document.documentElement.style.setProperty("--header-h", `${h}px`);
  }, [loaded, texts]);

  if (!loaded || texts.length === 0) return null;

  // مكون المجموعة: يحتوي على النصوص مكررة بجانب بعضها لملء عرض الشاشة
  const PromoItemsGroup = () => (
    <div className="promo-group">
      {/* نكرر العناصر لملء المساحة إذا كان عدد الإعلانات قليلاً */}
      {[...texts, ...texts].map((text, index) => {
        const parsedText = formatBilingual(text, language);
        const isArabic = /[\u0600-\u06FF]/.test(parsedText);
        return (
          <div key={index} className="promo-item-wrapper">
            <span className={`promo-item ${isArabic ? "arabic-text" : ""}`}>
              {parsedText}
            </span>
            <span className="promo-divider">✦</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes promo-ticker {
          /* التحرك بمقدار -100% يضمن اختفاء المجموعة الأولى تماماً يساراً وظهور التانية يميناً */
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-100%, 0, 0); }
        }
        
        .promo-container {
          width: 100%;
          height: ${BAR_H}px;
          background-color: #262f37; /* التيمة الباردة الفخمة */
          overflow: hidden;
          border-bottom: 1px solid rgba(79, 98, 113, 0.15);
          position: relative;
          direction: ltr;
        }
        
        .promo-track {
          display: inline-flex;
          width: max-content;
          animation: promo-ticker 60s linear infinite; /* وقت مثالي للحركة الطويلة المستمرة */
          will-change: transform;
        }
        
        .promo-group {
          display: flex;
          align-items: center;
          justify-content: space-around;
          white-space: nowrap;
          flex-shrink: 0;
          min-width: 100vw; /* تجبر المجموعات أن تأخذ كامل عرض الشاشة على الأقل لمنع ظهور فراغات */
          padding-right: 2rem;
        }

        .promo-item-wrapper {
          display: flex;
          align-items: center;
        }
        
        .promo-item {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          letter-spacing: 0.12em;
          color: #edf1f4; 
          font-family: 'Raleway', 'Cairo', sans-serif;
          font-weight: 400;
          padding: 0 2rem;
        }
        
        .promo-divider {
          color: #778ca4; 
          opacity: 0.7;
        }
        
        .arabic-text {
          direction: rtl;
          unicode-bidi: isolate;
        }
      `}</style>

      <div className="promo-container">
        {/* التظليل الجانبي المتناسق مع تيمة موقع Nuit */}
        <div style={{
          position: "absolute", inset: "0 0 0 0", zIndex: 2, pointerEvents: "none",
          background: "linear-gradient(to right, #262f37 0%, transparent 5%, transparent 95%, #262f37 100%)",
        }} />

        <div className="promo-track">
          {/* مجموعتين عريضتين يسلمان بعضهما البعض على أطراف الشاشة */}
          <PromoItemsGroup />
          <PromoItemsGroup />
        </div>
      </div>
    </>
  );
}