import { useState, useEffect } from "react";

const BAR_H = 32;
const NAV_H = 68;

export default function AnnouncementBar() {
  const [texts, setTexts] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // تحديد الـ Base URL بناءً على البيئة الحالية (Development أو Production)
  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://127.0.0.1:8000/api/v1' 
    : '/api/v1';

  useEffect(() => {
    // تفعيل الـ Disable cache برمجياً بإضافة Timestamp اختيارية لقطع الـ 304 تماماً أثناء التطوير
    fetch(`${API_BASE}/announcements?t=${new Date().getTime()}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Fetched Announcements Original Data:", data);
        
        // 1. استخراج المصفوفة الأساسية سواء كانت مغلفة في data أم مفرودة مباشرة
        const items = Array.isArray(data) ? data : (data.data ?? []);
        
        // 2. معالجة البيانات بمرونة تامة لتجنب الفلترة الخاطئة بسبب اختلاف الـ Types (0/1 أو true/false)
        const result: string[] = items
          .filter((a: any) => {
            if (!a || typeof a === "string") return true;

            // قراءة حالة النشاط بدعم للمسميين (is_active أو active)
            const isActiveValue = a.is_active !== undefined ? a.is_active : a.active;
            
            // تمرير العنصر طالما لم يتم إيقافه صراحة بـ false أو 0 أو "0"
            return isActiveValue !== false && isActiveValue !== 0 && isActiveValue !== "0";
          })
          .map((a: any) => {
            // لو العنصر مصفوفة نصوص مباشرة خده علطول، لو أوبجكت خذ الكي المناسب
            return typeof a === "string" ? a : String(a.text || a.content || "");
          })
          .filter((text: string) => text.trim() !== ""); // استبعاد النصوص الفارغة

        console.log("Processed Announcements Result:", result);
        setTexts(result);
      })
      .catch((err) => console.error("Announcement Error:", err))
      .finally(() => setLoaded(true));
  }, [API_BASE]);

  useEffect(() => {
    const h = loaded && texts.length > 0 ? BAR_H + NAV_H : NAV_H;
    document.documentElement.style.setProperty("--header-h", `${h}px`);
  }, [loaded, texts]);

  // لو لسه بيحمل أو مفيش أي نصوص راجعة، اقفل الشاشة تماماً وماتعرضش البار
  if (!loaded || texts.length === 0) return null;

  // دمج النصوص بفاصل أيقونة النجمة اللامعة ✦
  const single = texts.join("   ✦   ");
  // تكرار النص 6 مرات لضمان ملء أي شاشة عرض ومتابعة الأنيميشن بسلاسة دائرية
  const segment = Array(6).fill(single).join("   ✦   ");

  return (
    <>
      <style>{`
        @keyframes promo-ticker {
          from { transform: translateX(0%); }
          to   { transform: translateX(-50%); }
        }
        .promo-track {
          display: flex;
          animation: promo-ticker 40s linear infinite;
          will-change: transform;
        }
        .promo-group {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          height: ${BAR_H}px;
          white-space: nowrap;
        }
        .promo-item {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.84);
          font-family: 'Raleway', sans-serif;
          font-weight: 400;
          padding: 0 2rem;
        }
      `}</style>

      <div
        style={{
          width: "100%",
          height: `${BAR_H}px`,
          backgroundColor: "#080808",
          overflow: "hidden",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
        }}
      >
        {/* تأثير التدرج الخفيف على حواف البار الجانبية لجمالية العرض الفخم */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
          background: "linear-gradient(to right, #080808 0%, transparent 6%, transparent 94%, #080808 100%)",
        }} />

        {/* مسار الحركة الدائري اللانهائي (شريط متحرك) */}
        <div className="promo-track">
          <div className="promo-group">
            <span className="promo-item">{segment}</span>
          </div>
          <div className="promo-group">
            <span className="promo-item">{segment}</span>
          </div>
        </div>
      </div>
    </>
  );
}