import React from "react";
import { FileText, ArrowDown, PhoneCall, Sun, Armchair, ArrowUpRight } from "lucide-react";
import { useCart } from "../context/CartContext";

interface MainBrandHeroProps {
  onSelectDepartment: (dept: "solar" | "muebles" | "accesorios") => void;
}

export const MainBrandHero: React.FC<MainBrandHeroProps> = ({ onSelectDepartment }) => {
  const { setIsQuotationOpen, products } = useCart();

  const solarProducts = products.filter((p) => p.department === "solar" || !p.department);
  const homeProducts = products.filter(
    (p) => p.department === "muebles" || p.department === "accesorios",
  );

  const solarStar = solarProducts.find((p) => /1200/i.test(p.name)) ?? solarProducts[0];
  const homeStar = homeProducts[0];

  const solarMin = solarProducts.length
    ? Math.min(...solarProducts.map((p) => p.price))
    : 0;
  const homeMin = homeProducts.length ? Math.min(...homeProducts.map((p) => p.price)) : 0;

  const handleScrollToDepartments = () => {
    const el = document.getElementById("departamentos");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const tiles = [
    {
      key: "solar" as const,
      icon: Sun,
      eyebrow: "Iluminación solar",
      title: "Farolas y proyectores",
      meta:
        solarProducts.length > 0
          ? `${solarProducts.length} ${solarProducts.length === 1 ? "modelo" : "modelos"} · desde $${solarMin.toFixed(0)}`
          : "Próximamente",
      image: solarStar?.image ?? "/products/lampara-1200w/image-1.jpg",
      alt: solarStar?.name ?? "Farola LED solar de calle Rolinger",
      eager: true,
    },
    {
      key: "muebles" as const,
      icon: Armchair,
      eyebrow: "Hogar",
      title: "Mobiliario y organización",
      meta:
        homeProducts.length > 0
          ? `${homeProducts.length} ${homeProducts.length === 1 ? "producto" : "productos"} · desde $${homeMin.toFixed(0)}`
          : "Próximamente 2026",
      image: homeStar?.image ?? "/brand-hero-home.jpg",
      alt: homeStar?.name ?? "Mobiliario y organización para el hogar",
      eager: false,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-forest text-white transition-colors duration-500">
      {/* Background Hero Image with Consistent High-Contrast Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/brand-hero-home.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center brightness-[0.4] contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest/95 via-forest/85 to-forest/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-transparent to-black/50" />

        {/* Ambient Warm Solar Glow */}
        <div className="pointer-events-none absolute -bottom-10 left-1/4 h-80 w-80 rounded-full bg-solar/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:gap-12">
          {/* Columna de texto */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex max-w-full flex-wrap items-center gap-1.5 self-start rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg backdrop-blur-md sm:gap-2 sm:px-4 sm:text-xs">
              <span className="flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-solar" />
              <span className="font-mono uppercase tracking-wider text-solar">Solar y Hogar Panamá</span>
              <span className="hidden text-white/40 xs:inline">•</span>
              <span className="hidden text-white/90 xs:inline">Energía y Hogar</span>
            </div>

            <h1 className="mt-4 text-balance font-serif text-3xl font-extrabold leading-[1.12] tracking-tight text-white sm:mt-5 sm:text-5xl sm:leading-[1.08]">
              Energía limpia y diseño{" "}
              <span className="text-solar">para tu hogar</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90 sm:mt-6 sm:text-lg">
              Farolas solares de alto rendimiento y piezas seleccionadas para tu hogar. Energía sin
              cables ni factura de luz, y diseño pensado para el clima de Panamá.
            </p>

            <div className="mt-6 flex flex-col items-stretch gap-2.5 sm:mt-8 sm:flex-row sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={handleScrollToDepartments}
                className="pressable inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-solar px-6 text-sm font-bold text-solar-foreground shadow-xl transition-transform hover:bg-solar/95 active:scale-95 sm:px-7"
              >
                <span>Ver catálogo</span>
                <ArrowDown aria-hidden="true" className="h-4 w-4 animate-bounce" />
              </button>

              <a
                href="https://wa.me/50769893055?text=Hola%20Solar%20y%20Hogar,%20quisiera%20asesoria%20sobre%20sus%20productos"
                target="_blank"
                rel="noopener noreferrer"
                className="pressable inline-flex h-12 items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-5 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-emerald-500/25 sm:px-6"
              >
                <PhoneCall aria-hidden="true" className="h-4 w-4 text-emerald-400" />
                <span>WhatsApp 6989-3055</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setIsQuotationOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 underline-offset-4 transition-colors hover:text-solar hover:underline"
            >
              <FileText aria-hidden="true" className="h-3.5 w-3.5" />
              <span>o genera una cotización oficial en PDF</span>
            </button>
          </div>

          {/* Columna de producto: las dos líneas del negocio */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {tiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <button
                  key={tile.key}
                  type="button"
                  onClick={() => onSelectDepartment(tile.key)}
                  className="pressable group relative h-full min-h-[260px] overflow-hidden rounded-2xl border border-white/15 bg-black/40 text-left shadow-xl backdrop-blur-md transition-colors hover:border-solar/60 sm:min-h-[300px] lg:min-h-[340px]"
                >
                  <img
                    src={tile.image}
                    alt={tile.alt}
                    loading={tile.eager ? "eager" : "lazy"}
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/70 to-forest/40" />

                  <div className="absolute inset-x-0 bottom-0 p-3 [text-shadow:0_1px_6px_rgba(0,0,0,0.95)] sm:p-4">
                    <span className="mb-1 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-solar">
                      <Icon aria-hidden="true" className="h-3 w-3" />
                      {tile.eyebrow}
                    </span>
                    <p className="font-serif text-sm font-bold leading-tight text-white sm:text-base">
                      {tile.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/75">{tile.meta}</p>
                  </div>

                  <span className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors group-hover:bg-solar group-hover:text-solar-foreground">
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
