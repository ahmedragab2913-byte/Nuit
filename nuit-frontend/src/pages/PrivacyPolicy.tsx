import { useEffect } from "react";
import { Shield, Eye, Lock, RefreshCw, UserCheck, Cookie } from "lucide-react";
import { useLanguageStore } from "../store/languageStore";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans  = { fontFamily: "'Raleway', sans-serif" };

export default function PrivacyPolicy() {
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
            {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
          </h1>
          <div className="w-12 h-[1px] bg-primary/60 mx-auto"></div>
          <p className="text-muted-foreground text-sm font-light max-w-xl mx-auto leading-relaxed">
            {isAr
              ? "شكرًا لاختيارك عطور نوي. نحن ملتزمون تمامًا بحماية خصوصيتك ومعلوماتك الشخصية بأقصى درجات العناية."
              : "Thank you for choosing Nuit Perfume. We are profoundly committed to protecting your privacy and safeguarding your personal information with the utmost care."}
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-12">
          
          {/* Agreement Intro */}
          <p className={`text-sm font-light text-muted-foreground leading-relaxed bg-muted/30 p-4 border-primary/40 italic ${isAr ? "border-r" : "border-l"}`}>
            {isAr
              ? "من خلال الوصول إلى موقعنا واستخدامه، فإنك تقر وتوافق على الشروط والممارسات الموضحة في سياسة الخصوصية هذه."
              : "By accessing and utilizing our website, you acknowledge and agree to the terms and practices outlined in this Privacy Policy."}
          </p>

          {/* 1. Information We Collect */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <Eye size={18} className="text-primary/80 shrink-0" />
              <h2 className={`text-sm font-semibold ${isAr ? "" : "tracking-[0.15em] uppercase"}`}>
                {isAr ? "1. البيانات التي نجمعها" : "1. Information We Collect"}
              </h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {isAr
                ? "لتقديم تجربة تسوق فاخرة وسلسة، نقوم بجمع التفاصيل الشخصية التالية:"
                : "To provide you with a seamless luxury shopping experience, we collect the following personal details:"}
            </p>
            <ul className={`grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-light text-muted-foreground list-disc list-inside ${isAr ? "pr-2" : "pl-2"}`}>
              {isAr ? (
                <>
                  <li>الاسم الكامل</li>
                  <li>رقم الهاتف</li>
                  <li>عنوان الشحن والتوصيل</li>
                  <li>عنوان البريد الإلكتروني</li>
                  <li>سجل الطلبات والمعاملات</li>
                  <li className="font-normal text-foreground/90">بيانات الدفع <span className="text-xs text-muted-foreground/80">(نحن لا نخزن معلومات بطاقات الائتمان نهائياً)</span></li>
                </>
              ) : (
                <>
                  <li>Full Name</li>
                  <li>Phone Number</li>
                  <li>Shipping and Delivery Address</li>
                  <li>Email Address</li>
                  <li>Order and Transaction History</li>
                  <li className="font-normal text-foreground/90">Payment details <span className="text-xs text-muted-foreground/80">(We strictly do not store credit card information)</span></li>
                </>
              )}
            </ul>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <Shield size={18} className="text-primary/80 shrink-0" />
              <h2 className={`text-sm font-semibold ${isAr ? "" : "tracking-[0.15em] uppercase"}`}>
                {isAr ? "2. كيف نستخدم معلوماتك" : "2. How We Use Your Information"}
              </h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {isAr
                ? "تُستخدم المعلومات التي نجمعها فقط لتعزيز تفاعلك مع نوي من خلال:"
                : "The information we gather is used solely to enhance your engagement with Nuit through:"}
            </p>
            <ul className={`space-y-2 text-sm font-light text-muted-foreground list-disc list-inside ${isAr ? "pr-2" : "pl-2"}`}>
              {isAr ? (
                <>
                  <li>معالجة طلبات العطور وتلبيتها وشحنها.</li>
                  <li>توصيل التحديثات الهامة المتعلقة بحالة الشراء أو الشحن.</li>
                  <li>تحسين أداء موقعنا وتخصيص تجربة التصفح الشخصية الخاصة بك.</li>
                  <li>إرسال عروض حصرية وتحديثات موسمية <span className="italic">(فقط بموافقتك الصريحة)</span>.</li>
                </>
              ) : (
                <>
                  <li>Processing, fulfilling, and shipping your perfume orders.</li>
                  <li>Communicating vital updates regarding your purchase or delivery status.</li>
                  <li>Improving our website performance and tailoring your personal browsing experience.</li>
                  <li>Sending exclusive offers and seasonal updates <span className="italic">(only with your explicit consent)</span>.</li>
                </>
              )}
            </ul>
          </section>

          {/* 3. Data Protection */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <Lock size={17} className="text-primary/80 shrink-0" />
              <h2 className={`text-sm font-semibold ${isAr ? "" : "tracking-[0.15em] uppercase"}`}>
                {isAr ? "3. حماية البيانات" : "3. Data Protection"}
              </h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {isAr
                ? "الأمان هو ركيزة أساسية في نوي. نحن نطبق أنظمة أمان وتشفير متقدمة لحماية بياناتك من الوصول غير المصرح به، أو التغيير، أو الإفشاء، أو الإتلاف."
                : "Security is foundational to Nuit. We implement modern, advanced security systems and encryption protocols to shield your data from unauthorized access, alteration, disclosure, or destruction."}
            </p>
          </section>

          {/* 4. Data Sharing & Third Parties */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <UserCheck size={18} className="text-primary/80 shrink-0" />
              <h2 className={`text-sm font-semibold ${isAr ? "" : "tracking-[0.15em] uppercase"}`}>
                {isAr ? "4. مشاركة البيانات وأطراف ثالثة" : "4. Data Sharing & Third Parties"}
              </h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {isAr
                ? "نحن نقدر ثقتك كثيراً. نحن لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة، باستثناء الكيانات الموثوقة اللازمة لإكمال طلبك:"
                : "We hold your trust in high regard. We do not sell, rent, or share your personal information with third parties, except trusted entities essential to completing your order:"}
            </p>
            <ul className={`space-y-2 text-sm font-light text-muted-foreground list-disc list-inside ${isAr ? "pr-2" : "pl-2"}`}>
              {isAr ? (
                <>
                  <li><span className="font-medium text-foreground/80">شركات الشحن:</span> لتوصيل عطورك بأمان إلى باب منزلك.</li>
                  <li><span className="font-medium text-foreground/80">بوابات الدفع:</span> للتحقق الآمن من المعاملات.</li>
                </>
              ) : (
                <>
                  <li><span className="font-medium text-foreground/80">Shipping Companies:</span> To safely deliver your bottle to your doorstep.</li>
                  <li><span className="font-medium text-foreground/80">Payment Processors:</span> To safely validate transactions via secure gateways.</li>
                </>
              )}
            </ul>
          </section>

          {/* 5. Cookies */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <Cookie size={18} className="text-primary/80 shrink-0" />
              <h2 className={`text-sm font-semibold ${isAr ? "" : "tracking-[0.15em] uppercase"}`}>
                {isAr ? "5. ملفات تعريف الارتباط (الكوكيز)" : "5. Cookies"}
              </h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {isAr
                ? "يستخدم موقعنا ملفات تعريف الارتباط لتحسين الوظائف، وحفظ تفضيلات سلة التسوق الخاصة بك، وتحسين تجربتك العامة. يمكنك إدارة تفضيلات ملفات تعريف الارتباط عبر إعدادات متصفحك."
                : "Our website uses cookies to optimize site functionality, remember your shopping bag preferences, and elevate your overall experience on our platform. You can manage cookie preferences via your browser settings."}
            </p>
          </section>

          {/* 6. Your Rights */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <UserCheck size={18} className="text-primary/80 shrink-0" />
              <h2 className={`text-sm font-semibold ${isAr ? "" : "tracking-[0.15em] uppercase"}`}>
                {isAr ? "6. حقوقك" : "6. Your Rights"}
              </h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {isAr
                ? "أنت تحتفظ بملكية كاملة لبياناتك. لديك الحق في طلب الوصول إلى البيانات الشخصية التي نحتفظ بها، أو طلب تصحيح معلومات غير دقيقة، أو طلب الحذف الكامل لبياناتك من أنظمتنا النشطة."
                : "You maintain complete ownership of your data. You have the right to request access to the personal data we hold, request corrections to inaccurate information, or request the complete deletion of your data from our active systems."}
            </p>
          </section>

          {/* 7. Changes to This Policy */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <RefreshCw size={16} className="text-primary/80 shrink-0" />
              <h2 className={`text-sm font-semibold ${isAr ? "" : "tracking-[0.15em] uppercase"}`}>
                {isAr ? "7. التغييرات على هذه السياسة" : "7. Changes to This Policy"}
              </h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {isAr
                ? "نحتفظ بالحق في تعديل سياسة الخصوصية هذه في أي وقت. سينعكس أي تغيير فوراً على هذه الصفحة. نشجع عملائنا على مراجعة هذا القسم بشكل دوري."
                : "We reserve the right to refine this Privacy Policy at any time. Any revisions will be instantly reflected and posted on this page. We encourage clients to periodically review this section."}
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