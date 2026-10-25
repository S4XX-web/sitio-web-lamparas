import React from "react";
import { Sun, Armchair, Sparkles, ArrowRight, MessageCircle, Eye, ShieldCheck, Zap } from "lucide-react";
import { useCart } from "../context/CartContext";
import { ProductCard } from "./ProductCard";

interface GeneralFeaturedProductsProps {
  onSelectDepartment: (dept: "solar" | "muebles" | "accesorios") => void;
}

export const GeneralFeaturedProducts: React.FC<GeneralFeaturedProductsProps> = ({
  onSelectDepartment,
}) => {
  const { products } = useCart();
  const solarProducts = products.filter((p) => p.department === "solar" || !p.department);
  const homeProducts = products.filter((p) => p.department === "muebles" || p.department === "accesorios");
  return (
    <section className="relative overflow-hidden bg-forest/95 text-white py-20 px-4 sm:px-6 transition-colors duration-500">
      {/* Background Ambience Orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-leaf/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-32 h-[30rem] w-[30rem] rounded-full bg-solar/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-solar-foreground shadow-sm">
            <Zap aria-hidden="true" className="h-4 w-4" />
            Catálogo Activo • Solar y Hogar
          </span>
          <h2 className="mt-4 font-serif text-3xl font-extrabold text-white sm:text-5xl tracking-tight">
            Productos Destacados de la Tienda
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-white/85 leading-relaxed">
            Equipos de iluminación solar listos para despacho inmediato en 24h a todo Panamá, y un adelanto de nuestras próximas líneas de hogar.
          </p>
        </div>

        {/* Pillar 1: Solar Products Grid (Current Stock) */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/15">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-solar text-solar-foreground shadow-md">
                <Sun aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-xl font-bold text-white font-serif">
                  Lámparas Solares de Alta Potencia (En Stock)
                </h3>
                <p className="text-xs text-white/70">
                  {solarProducts.length} {solarProducts.length === 1 ? "modelo garantizado" : "modelos garantizados"} con entrega inmediata a todo Panamá
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectDepartment("solar")}
              className="pressable inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 text-xs font-bold backdrop-blur-md border border-white/20 cursor-pointer transition-colors"
            >
              <span>Ver Departamento Solar Completo</span>
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 text-solar" />
            </button>
          </div>

          {/* Real Products Cards */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {solarProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                className={
                  solarProducts.length % 2 === 1 && index === solarProducts.length - 1
                    ? "sm:col-span-2 sm:mx-auto sm:w-[calc(50%-1rem)] lg:col-span-1 lg:mx-0 lg:w-auto"
                    : ""
                }
              />
            ))}
          </div>

          {/* Solar Department Callout Banner */}
          <div className="mt-10 rounded-3xl border border-solar/40 bg-gradient-to-r from-solar/20 via-black/40 to-forest p-6 sm:p-8 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="inline-block rounded-full bg-solar/20 text-solar px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider font-mono">
                Experiencia Interactiva Completa
              </span>
              <h4 className="text-lg sm:text-xl font-bold text-white font-serif">
                ¿Deseas ver el simulador día/noche, despiece de capas y videos reales de instalación?
              </h4>
              <p className="text-xs text-white/80 max-w-xl">
                En nuestro departamento especializado de energía solar podrás probar la autonomía fotovoltaica, comparar modelos y ver fotos de clientes en Panamá.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectDepartment("solar")}
              className="pressable inline-flex items-center gap-2.5 rounded-full bg-solar px-6 py-3 text-xs sm:text-sm font-bold text-solar-foreground hover:bg-solar/95 shadow-xl cursor-pointer shrink-0 transition-transform active:scale-95"
            >
              <Eye aria-hidden="true" className="h-4 w-4" />
              <span>Explorar Todo el Departamento Solar</span>
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Pillar 2 & 3: Home & Furniture Previews / Live Products */}
        <div>
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/15">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white shadow-md">
              <Armchair aria-hidden="true" className="h-5 w-5 text-solar" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-white font-serif">
                {homeProducts.length > 0 ? "Mobiliario y Hogar en Catálogo" : "Próximas Colecciones de Hogar"}
              </h3>
              <p className="text-xs text-white/70">
                {homeProducts.length > 0
                  ? `${homeProducts.length} ${
                      homeProducts.length === 1 ? "producto disponible" : "productos disponibles"
                    } para tu hogar`
                  : "Líneas de mobiliario exterior y accesorios en fase de preparación"}
              </p>
            </div>
          </div>

          {homeProducts.length > 0 && (
            <div
              className={`grid gap-8 mb-10 ${
                homeProducts.length === 1
                  ? "max-w-md mx-auto"
                  : "sm:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {homeProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Furniture Preview Card */}
            <div className="rounded-3xl border border-white/15 bg-black/40 p-6 sm:p-8 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-solar/15 text-solar">
                  <Armchair aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-0.5 text-[11px] font-bold font-mono">
                  {homeProducts.length > 0 ? "Línea Mobiliario" : "Lanzamiento 2026"}
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white font-serif">
                  Mobiliario de Terraza, Jardín y Salones
                </h4>
                <p className="mt-2 text-xs text-white/80 leading-relaxed">
                  Piezas resistentes al sol y a la lluvia tropical panameña: salas moduladas, comedores exteriores y mesas auxiliares diseñadas para el confort familiar.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectDepartment("muebles")}
                  className="pressable rounded-full bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Conocer detalles
                </button>
                <a
                  href="https://wa.me/50769893055?text=Hola%20Solar%20y%20Hogar,%20quisiera%20consultar%20sobre%20pedidos%20por%20encargo%20de%20muebles%20de%20terraza."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  <MessageCircle aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>Consultar por encargo vía WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Accessories Preview Card */}
            <div className="rounded-3xl border border-white/15 bg-black/40 p-6 sm:p-8 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-solar/15 text-solar">
                  <Sparkles aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-0.5 text-[11px] font-bold font-mono">
                  Lanzamiento 2026
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white font-serif">
                  Accesorios, Decoración & Organización
                </h4>
                <p className="mt-2 text-xs text-white/80 leading-relaxed">
                  Detalles pensados para aportar orden, calidez y estilo: acentos decorativos, percheros, organizadores y piezas funcionales para complementar tus espacios.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectDepartment("accesorios")}
                  className="pressable rounded-full bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Conocer detalles
                </button>
                <a
                  href="https://wa.me/50769893055?text=Hola%20Solar%20y%20Hogar,%20quisiera%20consultar%20sobre%20su%20proxima%20linea%20de%20accesorios%20para%20el%20hogar."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  <MessageCircle aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>Consultar por WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
