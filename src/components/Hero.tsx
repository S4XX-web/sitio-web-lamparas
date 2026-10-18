import React, { useState, useRef } from "react";
import { Leaf, Sun, Zap, ArrowRight, Moon, Shield, Truck, ShoppingBag, Eye, MessageCircle, Layers } from "lucide-react";
import { useCart } from "../context/CartContext";
import { PRODUCTS } from "../data/products";
import { Link } from "@tanstack/react-router";
import heroImage from "../assets/hero-solar.jpg";

export const Hero: React.FC = () => {
  const { nightMode, setNightMode, addItem } = useCart();
  const [selectedProductId, setSelectedProductId] = useState<string>("lampara-solar-1200w");

  // Interactive 3D tilt state (desktop only)
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const currentProduct = PRODUCTS.find((p) => p.id === selectedProductId) || PRODUCTS[0];

  const handleWhatsAppOrder = () => {
    const message = `*CONSULTA DE PEDIDO - SOLAR Y HOGAR PANAMA*
Hola equipo de Solar y Hogar, me interesa pedir la siguiente luminaria:
- Producto: ${currentProduct.name}
- Precio: $${currentProduct.price.toFixed(2)} USD
- Envio: Transporte Ferguson / Uno Express (sucursal) o Servientrega (puerta a puerta o sucursal)

Me confirman disponibilidad y datos para coordinar el envio? Muchas gracias.`;
    window.open(`https://wa.me/50769893055?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section className="relative overflow-hidden transition-colors duration-700 bg-background text-foreground">
      {/* Background Image with Atmospheric Lighting Shift */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Jardín y terraza residencial iluminada con lámparas solares al anochecer"
          className={`h-full w-full object-cover transition-all duration-700 ease-out ${
            nightMode
              ? "brightness-[0.38] contrast-125 saturate-125 scale-102"
              : "brightness-[0.8] contrast-105 saturate-100 scale-100"
          }`}
        />
        {/* Editorial Atmospheric Gradients */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            nightMode
              ? "bg-gradient-to-r from-forest/95 via-forest/85 to-transparent"
              : "bg-gradient-to-r from-forest/80 via-forest/50 to-transparent"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30 pointer-events-none" />

        {/* Ambient Solar Glow Pool */}
        <div
          className={`absolute bottom-16 left-1/4 h-96 w-96 rounded-full bg-solar/25 blur-3xl pointer-events-none transition-all duration-700 ${
            nightMode ? "opacity-100 scale-110" : "opacity-20 scale-75"
          }`}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20 lg:py-24">
        {/* Top Badges & Tactile Lighting Switch */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-solar/95 px-3.5 py-1 text-xs font-bold text-solar-foreground shadow-sm backdrop-blur-md">
            <Leaf aria-hidden="true" className="h-3.5 w-3.5" />
            Luminarias Rolinger Oficiales • Panamá 2026
          </span>

          <button
            onClick={() => setNightMode((prev) => !prev)}
            type="button"
            className="pressable inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md hover:bg-black/60 cursor-pointer shadow-sm transition-transform active:scale-95"
            title="Haz clic para alternar iluminación de día o noche"
          >
            {nightMode ? (
              <>
                <Moon aria-hidden="true" className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                <span>Modo Noche (Iluminación Activa)</span>
              </>
            ) : (
              <>
                <Sun aria-hidden="true" className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span>Modo Día (Carga Fotovoltaica)</span>
              </>
            )}
          </button>
        </div>

        {/* 2-Column Bespoke Hero Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Side: Brand Statement & Claims (7 Cols) */}
          <div className="lg:col-span-7">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.08] text-white tracking-tight text-balance">
              Iluminación solar autónoma{" "}
              <span className="relative inline-block text-solar">
                sin cables ni recibos de luz
                <svg
                  aria-hidden="true"
                  className="absolute -bottom-2 left-0 w-full text-solar/40"
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

            <p className="mt-5 max-w-xl text-base sm:text-lg text-white/90 leading-relaxed font-normal">
              Farolas de calle y proyectores solares con tecnología de radar inteligente y celdas fotovoltaicas de alta eficiencia.
              Instalación práctica sin cableado eléctrico (incluye kit de fijación para montar con herramientas básicas), encendido automático al anochecer y resistencia contra lluvias tropicales en Panamá.
            </p>

            {/* Quick Action Links */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#catalogo"
                className="pressable inline-flex items-center gap-2.5 rounded-full bg-solar px-7 py-3.5 text-sm font-bold text-solar-foreground shadow-lg hover:bg-solar/95 cursor-pointer"
              >
                <span>Explorar los 3 Modelos</span>
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>

              <a
                href="#anatomia"
                className="pressable inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/35 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md hover:bg-black/50 cursor-pointer shadow-sm"
              >
                <Layers aria-hidden="true" className="h-4 w-4 text-solar" />
                <span>Ver Cómo Está Hecha</span>
              </a>
            </div>

            {/* Logistics Fast Fact */}
            <div className="mt-6 flex items-center gap-2.5 text-xs text-white/80 font-mono">
              <Truck aria-hidden="true" className="h-4 w-4 text-solar shrink-0" />
              <span>Despachos a todo Panamá por Ferguson, Uno Express y Servientrega (única puerta a puerta)</span>
            </div>
          </div>

          {/* Right Side: Interactive 3D Product Stage with Live Variant Switcher (5 Cols) */}
          <div className="lg:col-span-5">
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: "transform 180ms ease-out",
              }}
              className="relative overflow-hidden rounded-3xl border border-white/20 bg-black/50 p-6 backdrop-blur-2xl shadow-2xl text-white"
            >
              {/* Variant Selector Tabs */}
              <div className="flex rounded-2xl bg-white/10 p-1 mb-5">
                {PRODUCTS.map((prod) => {
                  const isSelected = prod.id === selectedProductId;
                  const shortName = prod.id.includes("1200w")
                    ? "1200W"
                    : prod.id.includes("800w")
                    ? "800W"
                    : "300W";

                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => setSelectedProductId(prod.id)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? "bg-solar text-solar-foreground shadow-md"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      {shortName} (${prod.price.toFixed(0)})
                    </button>
                  );
                })}
              </div>

              {/* Product Visual Presentation */}
              <div className="relative h-60 w-full overflow-hidden rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center p-3">
                <img
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  className="h-full w-full object-contain drop-shadow-2xl transition-all duration-300"
                />
                <span className="absolute top-3 left-3 rounded-full bg-black/70 border border-white/20 px-2.5 py-0.5 text-[10px] font-extrabold text-solar backdrop-blur-xs">
                  {currentProduct.badge}
                </span>
                <span className="absolute bottom-3 right-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                  En Stock Inmediato
                </span>
              </div>

              {/* Product Meta & Pricing */}
              <div className="mt-4">
                <h3 className="font-serif text-lg font-bold text-white line-clamp-1">
                  {currentProduct.name}
                </h3>
                <p className="text-xs text-white/70 line-clamp-1 mt-0.5">
                  {currentProduct.tagline}
                </p>

                <div className="mt-3 flex items-baseline justify-between border-t border-white/10 pt-3">
                  <div>
                    <span className="text-2xl font-black text-solar font-serif">
                      ${currentProduct.price.toFixed(2)} USD
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full">
                    Despachos a todo Panamá
                  </span>
                </div>

                {/* Instant Actions */}
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => addItem(currentProduct, 1)}
                    className="pressable flex items-center justify-center gap-1.5 rounded-xl bg-solar py-2.5 px-3 text-xs font-bold text-solar-foreground shadow-md hover:bg-solar/95 cursor-pointer"
                  >
                    <ShoppingBag aria-hidden="true" className="h-4 w-4" />
                    <span>Añadir al Carrito</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppOrder}
                    className="pressable flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 px-3 text-xs font-bold text-white shadow-md cursor-pointer"
                  >
                    <MessageCircle aria-hidden="true" className="h-4 w-4" />
                    <span>Pedir WhatsApp</span>
                  </button>
                </div>

                <div className="mt-3 text-center">
                  <Link
                    to="/producto/$productId"
                    params={{ productId: currentProduct.id }}
                    className="text-[11px] text-white/70 hover:text-solar underline font-mono inline-flex items-center gap-1"
                  >
                    <Eye aria-hidden="true" className="h-3 w-3" /> Ver todas las fotos y ficha completa
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Technical Indicators Grid */}
        <div className="mt-12 grid w-full grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4 border-t border-white/15 pt-8">
          <div className="spring-card rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-md text-white">
            <div className="flex items-center gap-2 text-solar mb-1.5">
              <Zap aria-hidden="true" className="h-4 w-4" />
              <span className="text-xl font-extrabold text-white font-serif">$0.00</span>
            </div>
            <p className="text-xs font-semibold text-white/90">Gasto en factura de luz</p>
            <p className="text-[11px] text-white/60 mt-0.5">100% energía solar pura</p>
          </div>

          <div className="spring-card rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-md text-white">
            <div className="flex items-center gap-2 text-solar mb-1.5">
              <Sun aria-hidden="true" className="h-4 w-4" />
              <span className="text-xl font-extrabold text-white font-serif">10 - 12 h</span>
            </div>
            <p className="text-xs font-semibold text-white/90">Autonomía nocturna</p>
            <p className="text-[11px] text-white/60 mt-0.5">6-8h en días nublados (modo radar)</p>
          </div>

          <div className="spring-card rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-md text-white">
            <div className="flex items-center gap-2 text-solar mb-1.5">
              <Shield aria-hidden="true" className="h-4 w-4" />
              <span className="text-xl font-extrabold text-white font-serif">IP66 / IP67</span>
            </div>
            <p className="text-xs font-semibold text-white/90">Protección Climática</p>
            <p className="text-[11px] text-white/60 mt-0.5">Soporta lluvias y alta humedad</p>
          </div>

          <div className="spring-card rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-md text-white">
            <div className="flex items-center gap-2 text-solar mb-1.5">
              <Truck aria-hidden="true" className="h-4 w-4" />
              <span className="text-xl font-extrabold text-white font-serif">Todo Panamá</span>
            </div>
            <p className="text-xs font-semibold text-white/90">Despachos Nacionales</p>
            <p className="text-[11px] text-white/60 mt-0.5">Ferguson • Uno Express • Servientrega</p>
          </div>
        </div>
      </div>
    </section>
  );
};
