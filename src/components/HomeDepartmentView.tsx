import React from "react";
import { ArrowLeft, Armchair, Sparkles, MessageCircle, Sun, ShieldCheck, CheckCircle2, Clock, Package } from "lucide-react";
import { useCart } from "../context/CartContext";
import { ProductCard } from "./ProductCard";

interface HomeDepartmentViewProps {
  department: "muebles" | "accesorios";
  onBackToGeneral: () => void;
  onGoToSolar: () => void;
}

export const HomeDepartmentView: React.FC<HomeDepartmentViewProps> = ({
  department,
  onBackToGeneral,
  onGoToSolar,
}) => {
  const isFurniture = department === "muebles";
  const { products } = useCart();
  const departmentProducts = products.filter((p) => p.department === department);

  return (
    <div className="animate-in fade-in duration-300">
      {/* Top Department Navigation Bar */}
      <div className="sticky top-[57px] z-30 border-b border-border bg-background/95 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBackToGeneral}
            className="pressable inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 sm:px-4 py-1.5 text-xs font-bold text-foreground hover:border-solar hover:text-solar-ink cursor-pointer transition-colors shadow-xs shrink-0"
          >
            <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">← Volver a la Portada</span>
            <span className="sm:hidden font-bold">← Inicio</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-solar-ink shrink-0">
              {isFurniture ? (
                <Armchair aria-hidden="true" className="h-3.5 w-3.5" />
              ) : (
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              )}
            </span>
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-foreground font-mono truncate">
              {isFurniture ? "Muebles" : "Accesorios"}
            </span>
          </div>

          <button
            type="button"
            onClick={onGoToSolar}
            className="pressable inline-flex items-center gap-1.5 rounded-full bg-solar/15 hover:bg-solar text-foreground hover:text-solar-foreground px-2.5 sm:px-3 py-1 text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <Sun aria-hidden="true" className="h-3.5 w-3.5 text-solar-ink" />
            <span className="hidden sm:inline">Ver Iluminación Solar</span>
            <span className="sm:hidden text-xs">Solar</span>
          </button>
        </div>
      </div>

      {/* Main Department Showcase Section */}
      <section className="relative overflow-hidden bg-background py-10 sm:py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {departmentProducts.length > 0 ? (
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-solar/15 text-solar-ink px-3 py-1 text-xs font-bold uppercase tracking-wider font-mono">
                  <Package className="w-3.5 h-3.5" />
                  Catálogo Disponible
                </span>
                <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
                  {isFurniture ? "Mobiliario y Terrazas para el Hogar" : "Accesorios, Confort & Decoración"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {departmentProducts.length} modelo(s) disponibles para entrega inmediata o pedido en Panamá.
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {departmentProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-xl space-y-8">
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 px-4 py-1 text-xs font-bold uppercase tracking-wider font-mono">
                  <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                  Colección 2026 • En Fase de Preparación
                </span>

              <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
                {isFurniture
                  ? "Mobiliario y Terrazas para el Hogar"
                  : "Accesorios, Confort & Decoración"}
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {isFurniture
                  ? "En Solar y Hogar estamos preparando una selecta línea de mobiliario exterior e interior: salas modulares, comedores de terraza y mesas auxiliares diseñadas para perdurar en el clima tropical de Panamá."
                  : "Muy pronto podrás complementar cada rincón de tu casa con organizadores prácticos, detalles de ambientación y accesorios exclusivos pensados para hacer tu día a día más placentero."}
              </p>
            </div>

            {/* Feature Points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-2">
                <div className="flex items-center gap-2 text-solar-ink font-bold text-xs uppercase font-mono">
                  <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                  <span>Resistencia Tropical</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Materiales aptos para sol, humedad y lluvia tropical con bajo mantenimiento.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-2">
                <div className="flex items-center gap-2 text-solar-ink font-bold text-xs uppercase font-mono">
                  <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                  <span>Diseño & Confort</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Piezas seleccionadas para maximizar la comodidad, armonía y estilo de tus espacios.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-2">
                <div className="flex items-center gap-2 text-solar-ink font-bold text-xs uppercase font-mono">
                  <MessageCircle aria-hidden="true" className="h-4 w-4" />
                  <span>Atención Personal</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Asesoría directa y opciones de encargo personalizado vía WhatsApp.
                </p>
              </div>
            </div>

            {/* Direct WhatsApp Pre-Order / Waitlist Box */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 sm:p-8 text-center space-y-4">
              <h3 className="font-serif text-xl font-bold text-foreground">
                ¿Buscas muebles o accesorios para tu proyecto ahora mismo?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
                Escríbenos directamente a nuestra línea oficial de atención. Podemos asesorarte sobre las próximas fechas de ingreso o gestionar pedidos especiales para tu casa o negocio.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={`https://wa.me/50769893055?text=${encodeURIComponent(
                    isFurniture
                      ? "Hola Solar y Hogar, quisiera información sobre su próxima línea de muebles de terraza y opciones de encargo."
                      : "Hola Solar y Hogar, quisiera información sobre su línea de accesorios de hogar."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pressable inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-xs font-bold shadow-lg cursor-pointer transition-transform active:scale-95"
                >
                  <MessageCircle aria-hidden="true" className="h-4 w-4" />
                  <span>Consultar por WhatsApp (6989-3055)</span>
                </a>

                <button
                  type="button"
                  onClick={onGoToSolar}
                  className="pressable inline-flex items-center gap-2 rounded-full border border-border bg-background hover:bg-secondary text-foreground px-6 py-3 text-xs font-bold cursor-pointer transition-colors"
                >
                  <Sun aria-hidden="true" className="h-4 w-4 text-solar-ink" />
                  <span>Ver Lámparas Solares en Stock</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
    </div>
  );
};
