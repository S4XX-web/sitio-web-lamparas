import React from "react";
import { FileText, ArrowDown, PhoneCall, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";

interface MainBrandHeroProps {
  onSelectDepartment: (dept: "solar" | "muebles" | "accesorios") => void;
}

export const MainBrandHero: React.FC<MainBrandHeroProps> = ({ onSelectDepartment }) => {
  const { setIsQuotationOpen } = useCart();

  const handleScrollToDepartments = () => {
    const el = document.getElementById("departamentos");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-forest text-white transition-colors duration-500">
      {/* Background Hero Image with Consistent High-Contrast Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/brand-hero-home.jpg"
          alt="Residencia moderna con iluminación ambiental y terraza en Panamá"
          className="h-full w-full object-cover object-center brightness-[0.4] contrast-110"
        />
        {/* Cinematic atmospheric overlays that guarantee full readability in both light & dark mode */}
        <div className="absolute inset-0 bg-gradient-to-r from-forest/95 via-forest/85 to-forest/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-transparent to-black/50" />
        
        {/* Ambient Warm Solar Glow */}
        <div className="pointer-events-none absolute -bottom-10 left-1/4 h-80 w-80 rounded-full bg-solar/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20 lg:py-24">
        <div className="max-w-3xl">
          {/* Brand Header Chip */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/20 bg-black/60 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold text-white shadow-lg backdrop-blur-md max-w-full flex-wrap">
            <span className="flex h-2 w-2 rounded-full bg-solar animate-pulse shrink-0" />
            <span className="font-mono text-solar uppercase tracking-wider">Solar y Hogar Panamá</span>
            <span className="text-white/40 hidden xs:inline">•</span>
            <span className="text-white/90 hidden xs:inline">Energía, Mobiliario & Confort</span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-4 sm:mt-5 font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold leading-[1.12] sm:leading-[1.08] text-white tracking-tight">
            Energía limpia y diseño{" "}
            <span className="relative inline-block text-solar">
              para transformar tu hogar
              <svg
                aria-hidden="true"
                className="absolute -bottom-1.5 left-0 w-full max-w-full text-solar/40"
                height="8"
                viewBox="0 0 200 8"
                fill="none"
              >
                <path
                  d="M1 5.5C40 2 120 1.5 199 5.5"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-white/90 leading-relaxed max-w-2xl font-normal">
            Bienvenido a <strong>Solar y Hogar</strong>. Somos tu tienda especializada en Panamá en iluminación solar exterior autónoma con $0 en factura de luz, y tu nuevo destino para mobiliario y accesorios pensados para transformar cada espacio de tu casa.
          </p>

          {/* Clean Action CTAs */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5">
            <button
              type="button"
              onClick={handleScrollToDepartments}
              className="pressable inline-flex items-center justify-center gap-2.5 rounded-full bg-solar px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-solar-foreground shadow-xl hover:bg-solar/95 cursor-pointer transition-transform active:scale-95"
            >
              <span>Explorar Departamentos</span>
              <ArrowDown aria-hidden="true" className="h-4 w-4 animate-bounce" />
            </button>

            <button
              type="button"
              onClick={() => setIsQuotationOpen(true)}
              className="pressable inline-flex items-center justify-center gap-2 rounded-full border border-solar/70 bg-solar/20 hover:bg-solar text-white hover:text-solar-foreground px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold backdrop-blur-md transition-all cursor-pointer shadow-md hover:shadow-solar/30"
            >
              <FileText aria-hidden="true" className="h-4 w-4 text-solar group-hover:text-inherit" />
              <span>Cotizador Oficial (PDF)</span>
            </button>

            <a
              href="https://wa.me/50769893055?text=Hola%20Solar%20y%20Hogar,%20quisiera%20asesoria%20sobre%20sus%20productos"
              target="_blank"
              rel="noopener noreferrer"
              className="pressable inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-black/40 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md hover:bg-black/60 cursor-pointer shadow-sm transition-colors"
            >
              <PhoneCall aria-hidden="true" className="h-4 w-4 text-emerald-400" />
              <span>WhatsApp 6989-3055</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
