import { useState, useEffect } from "react";

const BAR_H = 32;
const NAV_H = 68;

export default function AnnouncementBar() {
  const [texts, setTexts] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // 1. تأمين مسار الـ API بالكامل للـ Deployment ومقاومة الـ SPA HTML Rewrites
  // تحديد الـ Base URL بناءً على البيئة الحالية (Local أو Railway Live)
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://127.0.0.1:8000/api/v1' 
  : 'https://nuit-production.up.railway.app/api/v1'; // 👈 الرابط المباشر لسيرفر لارافيل على Railway // 👈 تأكد من إضافة VITE_API_BASE_URL في إعدادات Vercel

  useEffect(() => {
    // كسر الكاش لمنع الـ 304 والوصول المباشر لقاعدة البيانات
    fetch(`${API_BASE}/announcements?t=${new Date().getTime()}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((resData) => {
        console.log("Fetched Announcements Original Data:", resData);
        
        // 2. مطابقة الـ Response Structure الجديد (resData.data) المقفل في الـ Controller
        const items = resData && typeof resData === 'object' && 'data' in resData 
          ? resData.data 
          : (Array.isArray(resData) ? resData : []);
        
        // 3. معالجة وتصفية البيانات بأعلى معايير الأمان (Defensive Programming)
        const result: string[] = Array.isArray(items) 
          ? items
              .filter((a: any) => {
                if (!a) return false;
                if (typeof a === "string") return true;

                // قراءة الـ is_active الممرر الآن صراحة من الـ Controller
                const isActiveValue = a.is_active !== undefined ? a.is_active : a.active;
                return isActiveValue !== false && isActiveValue !== 0 && isActiveValue !== "0";
              })
              .map((a: any) => {
                return typeof a === "string" ? a : String(a.text || a.content || "");
              })
              .filter((text: string) => text.trim() !== "")
          : [];

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

  // حارس العرض: منع ظهور أي مساحات فارغة أو تداخل في التصميم إذا لم تتوفر إعلانات نشطة
  if (!loaded || texts.length === 0) return null;

  const single = texts.join("   ✦   ");
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
        <div style={{
          position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
          background: "linear-gradient(to right, #080808 0%, transparent 6%, transparent 94%, #080808 100%)",
        }} />

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