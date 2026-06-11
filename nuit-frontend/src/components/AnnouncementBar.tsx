import { useState, useEffect } from "react";

const BAR_H = 32;
const NAV_H = 68;

export default function AnnouncementBar() {
  const [texts, setTexts] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/v1/announcements`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const items = Array.isArray(data) ? data : data.data ?? [];
        const result: string[] = items
          .filter((a: any) => a.is_active !== false)
          .map((a: any) => String(a.text));
        setTexts(result);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    const h = loaded && texts.length > 0 ? BAR_H + NAV_H : NAV_H;
    document.documentElement.style.setProperty("--header-h", `${h}px`);
  }, [loaded, texts]);

  if (!loaded || texts.length === 0) return null;

  // Repeat segment enough times so one group is always wider than any screen
  const single = texts.join("   ✦   ");
  // 6 repetitions ensures ~6× text width — way more than any viewport
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
          /* NO width constraints — natural content width is ground truth */
          animation: promo-ticker 40s linear infinite;
          will-change: transform;
          /* hardware-accelerated, no layout jerk */
        }
        .promo-group {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          /* NO min-width — width comes purely from content */
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
        {/* Edge fades */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
          background: "linear-gradient(to right, #080808 0%, transparent 6%, transparent 94%, #080808 100%)",
        }} />

        {/*
          Track = group A + group B (identical).
          translateX(-50%) = exactly group A width → seamless reset, zero jerk.
        */}
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
