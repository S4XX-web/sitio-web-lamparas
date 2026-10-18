import React from "react";
import { ArrowLeft, Sun, Layers, Sparkles, Truck, HelpCircle, CheckCircle2 } from "lucide-react";
import { Hero } from "./Hero";
import { ProductCatalog } from "./ProductCatalog";
import { ProductAnatomy } from "./ProductAnatomy";
import { ComparisonTable } from "./ComparisonTable";
import { DayNightSimulator } from "./DayNightSimulator";
import { Benefits } from "./Benefits";
import { ShipmentsAndInstallations } from "./ShipmentsAndInstallations";
import { FAQ } from "./FAQ";

interface SolarDepartmentViewProps {
  onBackToGeneral: () => void;
}

export const SolarDepartmentView: React.FC<SolarDepartmentViewProps> = ({ onBackToGeneral }) => {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Sticky Department Top Navigation Bar */}
      <div className="sticky top-[52px] sm:top-[57px] z-30 border-b border-solar/30 bg-background/95 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBackToGeneral}
            className="pressable inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 sm:px-4 sm:py-1.5 text-xs font-bold text-foreground hover:border-solar hover:text-solar cursor-pointer transition-colors shadow-xs shrink-0"
          >
            <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">← Volver a la Portada</span>
            <span className="sm:hidden font-bold">Inicio</span>
          </button>

          <div className="flex items-center gap-1.5 min-w-0">
            <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-solar text-solar-foreground shrink-0">
              <Sun aria-hidden="true" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </span>
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-foreground font-mono truncate">
              <span className="hidden md:inline">Departamento: </span>Iluminación Solar
            </span>
            <span className="hidden sm:inline-block rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-extrabold shrink-0">
              3 Modelos
            </span>
          </div>

          {/* Quick Sub-Section Jumps */}
          <div className="hidden lg:flex items-center gap-3 text-xs font-semibold text-muted-foreground">
            <a href="#catalogo" className="hover:text-solar transition-colors">Catálogo</a>
            <span>•</span>
            <a href="#anatomia" className="hover:text-solar transition-colors">Tecnología</a>
            <span>•</span>
            <a href="#simulador" className="hover:text-solar transition-colors">Simulador</a>
            <span>•</span>
            <a href="#envios-instalaciones" className="hover:text-solar transition-colors">Envíos</a>
            <span>•</span>
            <a href="#faq" className="hover:text-solar transition-colors">FAQ</a>
          </div>
        </div>
      </div>

      {/* 1. Signature Interactive Solar Hero with 3D Tilt, Night Mode and Live Model Switcher */}
      <Hero />

      {/* 2. Official 3 Models Catalog */}
      <ProductCatalog />

      {/* 3. Engineering & Anatomy Breakdown */}
      <ProductAnatomy />

      {/* 4. Comparison Table */}
      <ComparisonTable />

      {/* 5. Day/Night Interactive Lighting Simulator */}
      <DayNightSimulator />

      {/* 6. Benefits */}
      <Benefits />

      {/* 7. Real Customer Shipments & Installations */}
      <ShipmentsAndInstallations />

      {/* 8. Solar Questions & Answers */}
      <FAQ />

      {/* Return to General Presentation Footer Bar */}
      <div className="border-t border-border bg-card py-10 px-4 text-center">
        <div className="mx-auto max-w-xl space-y-3">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Has explorado el departamento de Iluminación & Energía Solar
          </p>
          <h3 className="font-serif text-2xl font-bold text-foreground">
            ¿Deseas volver a la presentación general de la tienda?
          </h3>
          <p className="text-xs text-muted-foreground">
            Conoce los otros departamentos y el ecosistema completo de Solar y Hogar Panamá.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onBackToGeneral}
              className="pressable inline-flex items-center gap-2 rounded-full bg-solar px-6 py-2.5 text-xs font-bold text-solar-foreground hover:bg-solar/95 shadow-md cursor-pointer transition-transform active:scale-95"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              <span>Volver a la Presentación General de Solar y Hogar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
