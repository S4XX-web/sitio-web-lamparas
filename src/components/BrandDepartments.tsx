import React from "react";
import { Sun, Armchair, Sparkles, ArrowRight, ShieldCheck, Truck, Home } from "lucide-react";

interface BrandDepartmentsProps {
  onSelectDepartment?: (dept: "solar" | "muebles" | "accesorios") => void;
  activeDepartment?: string;
}

export const BrandDepartments: React.FC<BrandDepartmentsProps> = ({
  onSelectDepartment,
  activeDepartment = "general",
}) => {
  return (
    <section id="departamentos" className="relative bg-background border-b border-border py-16 px-4 sm:px-6 scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-solar/15 text-solar px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider font-mono">
            <Home aria-hidden="true" className="h-3.5 w-3.5" />
            Departamentos de Solar y Hogar
          </span>
          <h2 className="mt-3 font-serif text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Nuestros Departamentos Especializados
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Cada sección cuenta con su propio catálogo e información técnica. Selecciona un departamento para ver todos sus productos, simuladores y detalles.
          </p>
        </div>

        {/* 3 Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Iluminacion Solar (Active) */}
          <div className="spring-card group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-solar bg-gradient-to-b from-card via-card to-solar/10 p-6 sm:p-7 shadow-xl hover:shadow-2xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-solar text-solar-foreground shadow-md">
                  <Sun aria-hidden="true" className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1 text-[11px] font-black uppercase tracking-wider font-mono">
                  Disponible (3 Modelos)
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-solar transition-colors">
                Iluminación & Energía Solar
              </h3>
              <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                Farolas solares de 1200W y 800W con radar de movimiento y proyectores solares IP67. Cero cables, cero facturas de luz y encendido automático nocturno.
              </p>

              <ul className="mt-5 space-y-2 text-xs text-foreground/85">
                <li className="flex items-center gap-2">
                  <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 text-solar shrink-0" />
                  <span>Resistencia tropical IP66 / IP67</span>
                </li>
                <li className="flex items-center gap-2">
                  <Truck aria-hidden="true" className="h-3.5 w-3.5 text-solar shrink-0" />
                  <span>Despacho inmediato en 24h a todo Panamá</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => onSelectDepartment?.("solar")}
                className="pressable w-full inline-flex items-center justify-center gap-2 rounded-xl bg-solar py-2.5 px-4 text-xs font-bold text-solar-foreground hover:bg-solar/95 shadow-md cursor-pointer transition-transform active:scale-95"
              >
                <span>Entrar a Iluminación Solar</span>
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Muebles & Terraza (Coming Soon) */}
          <div className="spring-card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-sm hover:border-border/80 hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-foreground">
                  <Armchair aria-hidden="true" className="h-6 w-6 text-solar" />
                </span>
                <span className="rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 px-3 py-1 text-[11px] font-extrabold font-mono">
                  Próximo Lanzamiento 2026
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-foreground">
                Muebles & Espacios de Hogar
              </h3>
              <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                Salas de exterior, comedores de terraza, mesas auxiliares y piezas seleccionadas para el clima de Panamá, diseñadas para compartir momentos inolvidables en familia.
              </p>

              <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-solar" />
                  <span>Mobiliario para salas, terrazas y jardines</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-solar" />
                  <span>Materiales duraderos y de bajo mantenimiento</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-border flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onSelectDepartment?.("muebles")}
                className="pressable w-full inline-flex items-center justify-center gap-2 rounded-xl bg-secondary hover:bg-secondary/80 py-2.5 px-4 text-xs font-bold text-foreground cursor-pointer transition-colors"
              >
                <span>Ver Avance de Colección</span>
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </button>

              <a
                href="https://wa.me/50769893055?text=Hola%20Solar%20y%20Hogar,%20me%20gustaria%20saber%20sobre%20su%20proxima%20linea%20de%20muebles"
                target="_blank"
                rel="noopener noreferrer"
                className="text-center text-[11px] font-semibold text-muted-foreground hover:text-solar transition-colors pt-1"
              >
                Consultar por encargo vía WhatsApp
              </a>
            </div>
          </div>

          {/* Card 3: Accesorios & Decoracion (Coming Soon) */}
          <div className="spring-card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-sm hover:border-border/80 hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-foreground">
                  <Sparkles aria-hidden="true" className="h-6 w-6 text-solar" />
                </span>
                <span className="rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 px-3 py-1 text-[11px] font-extrabold font-mono">
                  Próximo Lanzamiento 2026
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-foreground">
                Accesorios & Decoración
              </h3>
              <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                Detalles prácticos, organizadores y complementos de diseño que aportan orden, armonía y estilo a cada ambiente de tu casa.
              </p>

              <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-solar" />
                  <span>Accesorios decorativos y funcionales</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-solar" />
                  <span>Detalles para organizar e inspirar tu hogar</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-border flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onSelectDepartment?.("accesorios")}
                className="pressable w-full inline-flex items-center justify-center gap-2 rounded-xl bg-secondary hover:bg-secondary/80 py-2.5 px-4 text-xs font-bold text-foreground cursor-pointer transition-colors"
              >
                <span>Ver Avance de Colección</span>
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </button>

              <a
                href="https://wa.me/50769893055?text=Hola%20Solar%20y%20Hogar,%20me%20gustaria%20saber%20sobre%20su%20proxima%20linea%20de%20accesorios%20para%20el%20hogar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-center text-[11px] font-semibold text-muted-foreground hover:text-solar transition-colors pt-1"
              >
                Consultar por WhatsApp (6989-3055)
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
