import { Sparkles } from "lucide-react";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'Raleway', sans-serif" };

export default function Offers() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6" style={sans}>
      <div className="text-center space-y-6">
        <Sparkles className="mx-auto text-primary animate-pulse" size={40} />
        
        <h1 className="text-4xl md:text-6xl tracking-[0.25em] uppercase font-light text-foreground" style={serif}>
          Coming Soon
        </h1>
        
        <div className="w-24 h-[1px] bg-primary/60 mx-auto" />
        
        <p className="text-muted-foreground text-sm font-light max-w-sm mx-auto leading-relaxed">
          We are crafting exclusive offers and artisan fragrance selections just for you. Stay tuned for something truly special.
        </p>
      </div>
    </div>
  );
}