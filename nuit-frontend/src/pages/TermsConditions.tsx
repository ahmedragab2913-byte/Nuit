import { useEffect } from "react";
import { Scale, ShoppingBag, Truck, RefreshCw, AlertCircle, ShieldAlert } from "lucide-react";
import { useLanguageStore } from "../store/languageStore";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function TermsConditions() {
  const { language } = useLanguageStore();
  const isAr = language === "ar";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="bg-background text-foreground min-h-screen py-20 px-6 lg:px-20"
      style={sans}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className={`text-3xl md:text-4xl font-light text-foreground ${isAr ? "" : "tracking-[0.2em] uppercase"}`} style={serif}>
            {isAr ? "الشروط والأحكام" : "Terms & Conditions"}
          </h1>
          <div className="w-12 h-[1px] bg-primary/60 mx-auto"></div>
          <p className="text-muted-foreground text-sm font-light max-w-xl mx-auto leading-relaxed">
            {isAr
              ? "مرحبًا بك في نوي. تحدد هذه الشروط والأحكام القواعد واللوائح الخاصة باستخدام موقع دار نوي للعطور."
              : "Welcome to Nuit. These terms and conditions outline the rules and regulations for the use of Maison Nuit's Website."}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-12">
          
          {/* Agreement Intro */}
          <p className={`text-sm font-light text-muted-foreground leading-relaxed bg-muted/30 p-4 border-primary/40 italic ${isAr ? "border-r" : "border-l"}`}>
            {isAr
              ? "من خلال تصفح هذا الموقع، نفترض أنك تقبل هذه الشروط والأحكام بالكامل. لا تستمر في استخدام موقع نوي إذا كنت لا تقبل جميع الشروط المذكورة في هذه الصفحة."
              : "By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use Nuit's website if you do not accept all of the terms stated on this page."}
          </p>

          {/* 1. Intellectual Property & Use */}
          <section className="space-y-4">
            <div className={`flex items-center gap-3 border-b border-border pb-2 ${isAr ? "flex-row-reverse" : ""}`}>
              <Scale size={18} className="text-primary/80" />
              <h2 className={`text-sm font-semibold ${isAr ? "" : "tracking-[0.15em] uppercase"}`}>
                {isAr ? "1. الملكية الفكرية والاستخدام" : "1. Intellectual Property & Use"}
              </h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {isAr
                ? "ما لم يُذكر خلاف ذلك، تمتلك نوي حقوق الملكية الفكرية لجميع المواد الموجودة على الموقع (بما في ذلك الشعارات، الصور، أوصاف المنتجات، والبنية التقنية). جميع حقوق الملكية الفكرية محفوظة. لا يجوز لك إعادة نشر المحتوى أو بيعه أو مضاعفته دون موافقة خطية مسبقة."
                : "Unless otherwise stated, Nuit owns the intellectual property rights for all material on the website (including logos, imagery, product descriptions, and technical architecture). All intellectual property rights are reserved. You must not republish, sell, or duplicate our content without prior written consent."}
            </p>
          </section>

          {/* 2. Orders & Pricing */}
          <section className="space-y-4">
            <div className={`flex items-center gap-3 border-b border-border pb-2 ${isAr ? "flex-row-reverse" : ""}`}>
              <ShoppingBag size={18} className="text-primary/80" />
              <h2 className={`text-sm font-semibold ${isAr ? "" : "tracking-[0.15em] uppercase"}`}>
                {isAr ? "2. الطلبات والأسعار" : "2. Orders & Pricing"}
              </h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {isAr
                ? "نحتفظ بالحق في رفض أو إلغاء أي طلب في أي وقت لأسباب تشمل على سبيل المثال لا الحصر: توفر المنتج، أو أخطاء في الوصف أو سعر المنتج، أو خطأ في طلبك. أسعار عطورنا الفاخرة عرضة للتغيير دون إشعار مسبق."
                : "We reserve the right to refuse or cancel any order at any time for reasons including but not limited to: product availability, errors in the description or price of the product, or errors in your order. Prices for our luxury fragrances are subject to change without notice."}
            </p>
          </section>

          {/* 3. Shipping & Delivery */}
          <section className="space-y-4">
            <div className={`flex items-center gap-3 border-b border-border pb-2 ${isAr ? "flex-row-reverse" : ""}`}>
              <Truck size={18} className="text-primary/80" />
              <h2 className={`text-sm font-semibold ${isAr ? "" : "tracking-[0.15em] uppercase"}`}>
                {isAr ? "3. الشحن والتوصيل" : "3. Shipping & Delivery"}
              </h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {isAr
                ? "قد تختلف أوقات التسليم اعتمادًا على موقعك وأداء شركات الشحن الخارجية. تلتزم نوي بإرسال طرودك الفاخرة على الفور، لكن لا يمكن تحميلنا المسؤولية القانونية عن أي تأخير غير متوقع في الشحن خارج عن إرادتنا."
                : "Delivery times may vary depending on your location and the performance of third-party shipping couriers. Nuit is dedicated to dispatching your luxury packages promptly, but we cannot be held legally responsible for unexpected shipping delays beyond our control."}
            </p>
          </section>

          {/* 4. Return & Exchange Policy */}
          <section className="space-y-4">
            <div className={`flex items-center gap-3 border-b border-border pb-2 ${isAr ? "flex-row-reverse" : ""}`}>
              <RefreshCw size={17} className="text-primary/80" />
              <h2 className={`text-sm font-semibold ${isAr ? "" : "tracking-[0.15em] uppercase"}`}>
                {isAr ? "4. سياسة الإرجاع والاستبدال خلال 14 يومًا" : "4. 14-Day Return & Exchange Policy"}
              </h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {isAr
                ? "تماشيًا مع حقوق المستهلك، نقدم فترة إرجاع واستبدال سهلة مدتها 14 يومًا. لكي تكون مؤهلاً، يجب أن تكون زجاجة العطر غير مستخدمة تمامًا، وغير مفتوحة، ومُعاد تغليفها في عبوتها الأصلية الفاخرة. لا يمكن قبول العطور المفتوحة أو التي تم رشها لأسباب تتعلق بالصحة العامة والنظافة."
                : "In alignment with consumer rights, we offer an easy 14-day return and exchange window. To be eligible, the perfume bottle must be completely unused, unopened, and returned in its original premium packaging. Opened or sprayed items cannot be accepted for health and hygiene reasons."}
            </p>
          </section>

          {/* 5. Accuracy of Information */}
          <section className="space-y-4">
            <div className={`flex items-center gap-3 border-b border-border pb-2 ${isAr ? "flex-row-reverse" : ""}`}>
              <AlertCircle size={18} className="text-primary/80" />
              <h2 className={`text-sm font-semibold ${isAr ? "" : "tracking-[0.15em] uppercase"}`}>
                {isAr ? "5. دقة وصحة البيانات" : "5. Accuracy of Information"}
              </h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {isAr
                ? "كعميل، فإنك توافق على تقديم معلومات حساب وشراء حديثة وكاملة ودقيقة لجميع الطلبات التي تتم في متجرنا. العناوين وأرقام الهواتف الدقيقة ضرورية لضمان التسليم السلس لمنتجاتك."
                : "As a customer, you agree to provide current, complete, and accurate purchase and account information for all orders made at our store. Accurate addresses and phone numbers are essential to ensure the seamless delivery of your products."}
            </p>
          </section>

          {/* 6. Limitation of Liability */}
          <section className="space-y-4">
            <div className={`flex items-center gap-3 border-b border-border pb-2 ${isAr ? "flex-row-reverse" : ""}`}>
              <ShieldAlert size={18} className="text-primary/80" />
              <h2 className={`text-sm font-semibold ${isAr ? "" : "tracking-[0.15em] uppercase"}`}>
                {isAr ? "6. حدود المسؤولية" : "6. Limitation of Liability"}
              </h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {isAr
                ? "لن تتحمل نوي وفريقها المسؤولية عن أي أضرار مباشرة أو غير مباشرة أو عرضية أو تبعية تنتج عن استخدام أو عدم القدرة على استخدام منتجاتنا أو موقعنا. استخدام منتجاتنا هو على مسؤولية المستهلك الخاصة."
                : "Nuit and its team shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our products or website. Use of our products is at the consumer's discretion."}
            </p>
          </section>

          {/* 7. Changes to Terms */}
          <section className="space-y-4">
            <div className={`flex items-center gap-3 border-b border-border pb-2 ${isAr ? "flex-row-reverse" : ""}`}>
              <RefreshCw size={16} className="text-primary/80" />
              <h2 className={`text-sm font-semibold ${isAr ? "" : "tracking-[0.15em] uppercase"}`}>
                {isAr ? "7. تعديل الشروط" : "7. Changes to Terms"}
              </h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {isAr
                ? "نحتفظ بالحق في مراجعة وتعديل هذه الشروط والأحكام في أي وقت. وتصبح التغييرات سارية المفعول فور نشرها على هذه الصفحة. استمرارك في استخدام الموقع يعني موافقتك على الشروط المحدثة."
                : "We reserve the right to review and modify these Terms & Conditions at any given time. Any changes will become immediately effective upon being published on this page. Your continued use of the platform implies agreement to the updated terms."}
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-border/40 text-center text-xs text-muted-foreground/60">
          {isAr ? "آخر تحديث: يونيو 2026" : "Last updated: June 2026"}
        </div>

      </div>
    </div>
  );
}