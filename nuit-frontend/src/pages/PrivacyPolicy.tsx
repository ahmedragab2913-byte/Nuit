import { useEffect } from "react";
import { Shield, Eye, Lock, RefreshCw, UserCheck, Cookie } from "lucide-react";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'Raleway', sans-serif" };

export default function PrivacyPolicy() {
  // للتأكد من أن الصفحة تبدأ من الأعلى عند فتحها
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen py-20 px-6 lg:px-20" style={sans}>
      <div className="max-w-3xl mx-auto">
        
        {/* الهيدر الرئيسي للمنتج */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-3xl md:text-4xl tracking-[0.2em] uppercase font-light text-foreground" style={serif}>
            Privacy Policy
          </h1>
          <div className="w-12 h-[1px] bg-primary/60 mx-auto"></div>
          <p className="text-muted-foreground text-sm font-light max-w-xl mx-auto leading-relaxed">
            Thank you for choosing Nuit Perfume. We are profoundly committed to protecting your privacy and safeguarding your personal information with the utmost care.
          </p>
        </div>

        {/* محتوى السياسة */}
        <div className="space-y-12">
          
          {/* مقدمة الموافقة */}
          <p className="text-sm font-light text-muted-foreground leading-relaxed bg-muted/30 p-4 border-l border-primary/40 italic">
            By accessing and utilizing our website, you acknowledge and agree to the terms and practices outlined in this Privacy Policy.
          </p>

          {/* 1. البيانات التي نجمعها */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <Eye size={18} className="text-primary/80" />
              <h2 className="text-sm tracking-[0.15em] uppercase font-semibold">1. Information We Collect</h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              To provide you with a seamless luxury shopping experience, we collect the following personal details:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-light text-muted-foreground list-disc list-inside pl-2">
              <li>Full Name</li>
              <li>Phone Number</li>
              <li>Shipping and Delivery Address</li>
              <li>Email Address</li>
              <li>Order and Transaction History</li>
              <li className="font-normal text-foreground/90">Payment details <span className="text-xs text-muted-foreground/80">(We strictly do not store credit card information)</span></li>
            </ul>
          </section>

          {/* 2. كيف نستخدم بياناتك */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <Shield size={18} className="text-primary/80" />
              <h2 className="text-sm tracking-[0.15em] uppercase font-semibold">2. How We Use Your Information</h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              The information we gather is used solely to enhance your engagement with Nuit through:
            </p>
            <ul className="space-y-2 text-sm font-light text-muted-foreground list-disc list-inside pl-2">
              <li>Processing, fulfilling, and shipping your perfume orders.</li>
              <li>Communicating vital updates regarding your purchase or delivery status.</li>
              <li>Improving our website performance and tailoring your personal browsing experience.</li>
              <li>Sending exclusive offers and seasonal updates <span className="italic">(only with your explicit consent)</span>.</li>
            </ul>
          </section>

          {/* 3. حماية البيانات */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <Lock size={17} className="text-primary/80" />
              <h2 className="text-sm tracking-[0.15em] uppercase font-semibold">3. Data Protection</h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              Security is foundational to Nuit. We implement modern, advanced security systems and encryption protocols to shield your data from unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          {/* 4. مشاركة البيانات */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <UserCheck size={18} className="text-primary/80" />
              <h2 className="text-sm tracking-[0.15em] uppercase font-semibold">4. Data Sharing & Third Parties</h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              We hold your trust in high regard. <span className="font-medium text-foreground/90">We do not sell, rent, or share your personal information</span> with third parties, except trusted entities essential to completing your order:
            </p>
            <ul className="space-y-2 text-sm font-light text-muted-foreground list-disc list-inside pl-2">
              <li><span className="font-medium text-foreground/80">Shipping Companies:</span> To safely deliver your bottle to your doorstep.</li>
              <li><span className="font-medium text-foreground/80">Payment Processors:</span> To safely validate transactions via secure gateways.</li>
            </ul>
          </section>

          {/* 5. ملفات الكوكيز */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <Cookie size={18} className="text-primary/80" />
              <h2 className="text-sm tracking-[0.15em] uppercase font-semibold">5. Cookies</h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              Our website uses cookies to optimize site functionality, remember your shopping bag preferences, and elevate your overall experience on our platform. You can manage cookie preferences via your browser settings.
            </p>
          </section>

          {/* 6. حقوق المستخدم */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <UserCheck size={18} className="text-primary/80" />
              <h2 className="text-sm tracking-[0.15em] uppercase font-semibold">6. Your Rights</h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              You maintain complete ownership of your data. You have the right to request access to the personal data we hold, request corrections to inaccurate information, or request the complete deletion of your data from our active systems.
            </p>
          </section>

          {/* 7. التغييرات في السياسة */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <RefreshCw size={16} className="text-primary/80" />
              <h2 className="text-sm tracking-[0.15em] uppercase font-semibold">7. Changes to This Policy</h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              We reserve the right to refine this Privacy Policy at any time. Any revisions will be instantly reflected and posted on this page. We encourage clients to periodically review this section.
            </p>
          </section>

        </div>

        {/* الفوتر الصغير داخل الصفحة */}
        <div className="mt-20 pt-8 border-t border-border/40 text-center text-xs text-muted-foreground/60">
          Last updated: June 2026
        </div>

      </div>
    </div>
  );
}