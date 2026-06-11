
// Typography tokens – matching the rest of the site
const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'Raleway', sans-serif" };

export default function About() {
  return (
    <div style={sans} className="bg-background min-h-screen">
      {/* Main About Section – two‑column layout, glass‑morphism, gradient background */}
      <section className="px-8 lg:px-20 py-28 border-t border-border bg-background">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          {/* Textual content */}
          <div className="space-y-6">
            <p className="text-[11px] tracking-[0.5em] uppercase text-primary mb-3">About Nuit</p>
            <h2 className="text-4xl lg:text-5xl font-light text-foreground" style={serif}>
              Our Story<br /><em className="text-primary/90">Crafted with passion</em>
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed text-sm font-light">
              Nuit is a modern e‑commerce showcase built with a clean separation of concerns: a React storefront, an admin dashboard, and a Laravel API. The application demonstrates stateful authentication with Sanctum, role‑based admin access, and a premium UI using glass‑morphism, subtle gradients, and the Inter font.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed text-sm font-light">
              Explore the shop, add items to the cart, and try the checkout flow. The codebase is fully typed with TypeScript and follows best security and performance practices.
            </p>
            <h3 className="text-2xl font-medium mb-2" style={serif}>Our Vision</h3>
            <p className="text-base mb-4" style={serif}>
              To provide developers with a reference‑grade e‑commerce platform that showcases modern full‑stack architecture, clean code, and elegant UI/UX while remaining easy to extend and adapt.
            </p>
            <h3 className="text-2xl font-medium mb-2" style={serif}>Meet the Team</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Lead Developer:</strong> Ahmed – Full‑stack architect, Laravel &amp; React.</li>
              <li><strong>UI/UX Designer:</strong> Lina – Visual design, glass‑morphism, branding.</li>
              <li><strong>Backend Engineer:</strong> Sam – API design, Sanctum security.</li>
              <li><strong>Frontend Engineer:</strong> Maya – State management, component library.</li>
            </ul>
          </div>
          {/* Image side – glass card with subtle overlay */}
          <div className="relative">
            <div className="aspect-[4/5] bg-secondary overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1000&auto=format&fit=crop&q=80"
                alt="Perfumer at work"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-36 h-36 border border-border bg-background flex flex-col items-center justify-center">
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Est.</p>
              <p className="text-3xl text-foreground font-light" style={serif}>2020</p>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
