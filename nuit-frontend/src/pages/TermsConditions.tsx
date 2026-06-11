import { useEffect } from "react";
import { Scale, ShoppingBag, Truck, RefreshCw, AlertCircle, ShieldAlert } from "lucide-react";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'Raleway', sans-serif" };

export default function TermsConditions() {
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
            Terms & Conditions
          </h1>
          <div className="w-12 h-[1px] bg-primary/60 mx-auto"></div>
          <p className="text-muted-foreground text-sm font-light max-w-xl mx-auto leading-relaxed">
            Welcome to Nuit. These terms and conditions outline the rules and regulations for the use of Maison Nuit's Website.
          </p>
        </div>

        {/* محتوى الشروط والأحكام */}
        <div className="space-y-12">
          
          {/* مقدمة الموافقة */}
          <p className="text-sm font-light text-muted-foreground leading-relaxed bg-muted/30 p-4 border-l border-primary/40 italic">
            By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use Nuit's website if you do not accept all of the terms stated on this page.
          </p>

          {/* 1. الحساب والملكية الفكرية */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <Scale size={18} className="text-primary/80" />
              <h2 className="text-sm tracking-[0.15em] uppercase font-semibold">1. Intellectual Property & Use</h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              Unless otherwise stated, Nuit owns the intellectual property rights for all material on the website (including logos, imagery, product descriptions, and technical architecture). All intellectual property rights are reserved. You must not republish, sell, or duplicate our content without prior written consent.
            </p>
          </section>

          {/* 2. الطلبات والتسعير */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <ShoppingBag size={18} className="text-primary/80" />
              <h2 className="text-sm tracking-[0.15em] uppercase font-semibold">2. Orders & Pricing</h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              We reserve the right to refuse or cancel any order at any time for reasons including but not limited to: product availability, errors in the description or price of the product, or errors in your order. Prices for our luxury fragrances are subject to change without notice.
            </p>
          </section>

          {/* 3. الشحن والتوصيل */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <Truck size={18} className="text-primary/80" />
              <h2 className="text-sm tracking-[0.15em] uppercase font-semibold">3. Shipping & Delivery</h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              Delivery times may vary depending on your location and the performance of third-party shipping couriers. Nuit is dedicated to dispatching your luxury packages promptly, but we cannot be held legally responsible for unexpected shipping delays beyond our control.
            </p>
          </section>

          {/* 4. سياسة الاسترجاع والاستبدال */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <RefreshCw size={17} className="text-primary/80" />
              <h2 className="text-sm tracking-[0.15em] uppercase font-semibold">4. 14-Day Return & Exchange Policy</h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              In alignment with consumer rights, we offer an easy 14-day return and exchange window. To be eligible, the perfume bottle must be completely unused, unopened, and returned in its original premium packaging. Opened or sprayed items cannot be accepted for health and hygiene reasons.
            </p>
          </section>

          {/* 5. دقة وصحة البيانات */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <AlertCircle size={18} className="text-primary/80" />
              <h2 className="text-sm tracking-[0.15em] uppercase font-semibold">5. Accuracy of Information</h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              As a customer, you agree to provide current, complete, and accurate purchase and account information for all orders made at our store. Accurate addresses and phone numbers are essential to ensure the seamless delivery of your products.
            </p>
          </section>

          {/* 6. حدود المسؤولية */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <ShieldAlert size={18} className="text-primary/80" />
              <h2 className="text-sm tracking-[0.15em] uppercase font-semibold">6. Limitation of Liability</h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              Nuit and its team shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our products or website. Use of our products is at the consumer's discretion.
            </p>
          </section>

          {/* 7. تعديل الشروط */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <RefreshCw size={16} className="text-primary/80" />
              <h2 className="text-sm tracking-[0.15em] uppercase font-semibold">7. Changes to Terms</h2>
            </div>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              We reserve the right to review and modify these Terms & Conditions at any given time. Any changes will become immediately effective upon being published on this page. Your continued use of the platform implies agreement to the updated terms.
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