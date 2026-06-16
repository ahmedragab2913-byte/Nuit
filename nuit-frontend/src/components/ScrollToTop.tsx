import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 🚀 إجبار المتصفح على الصعود لأعلى الصفحة فوراً مع كل تغيير في الـ URL
    window.scrollTo({
  top: 0,
  left: 0,
  behavior: "smooth" // 👈 إضافة حركة ناعمة أثناء الصعود
});
  }, [pathname]);

  return null; // المكون ده وظيفته سلوك فقط ومبيعملش رندر لأي UI
}