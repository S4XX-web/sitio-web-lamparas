import React, { useState } from "react";
import { Sun, Zap, Radio, BatteryCharging, Shield, Sparkles, Layers, CheckCircle2, ArrowRight, ChevronDown } from "lucide-react";

interface Layer {
  id: string;
  step: string;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  material: string;
  panamaBenefit: string;
  specs: string;
  description: string;
  accent: string;
}

const LAYERS: Layer[] = [
  {
    id: "panel",
    step: "01",
    title: "Celdas Fotovoltaicas de Alta Eficiencia",
    shortDesc: "Captación solar de alta tasa de conversión fotoeléctrica",
    icon: Sun,
    material: "Silicio grado A con cubierta de vidrio templado resistente",
    panamaBenefit: "Capta radiación directa y luz difusa (40% a 60% de carga en días nublados)",
    specs: "Eficiencia Clase A++ • Cero consumo de red eléctrica",
    description:
      "Ubicado en la parte superior de la farola (o como panel independiente en el reflector de 300W), este panel solar convierte la luz del sol en energía eléctrica limpia. Su superficie sellada repele el agua de lluvia y el polvo, aprovechando las horas de luz diurna para cargar la batería interna.",
    accent: "from-amber-500/20 to-amber-500/5 text-amber-500 border-amber-500/30",
  },
  {
    id: "led",
    step: "02",
    title: "Matriz Óptica LED de Alta Pureza",
    shortDesc: "Iluminación 6500K con óptica de dispersión gran angular",
    icon: Zap,
    material: "Perlas LED de emisión blanca fría 6500K y reflectores facetados",
    panamaBenefit: "Claridad nítida en portones, fachadas y patios sin calentar la estructura",
    specs: "Hasta 50,000 horas de vida útil • Mínima degradación lumínica",
    description:
      "Múltiples módulos LED organizados en paneles direccionales que proyectan un haz uniforme y expansivo de 120° a 140°. Ofrece una visibilidad clara que disuade intrusos y mejora la seguridad perimetral de tu residencia, comercio o finca.",
    accent: "from-solar/20 to-solar/5 text-solar border-solar/30",
  },
  {
    id: "radar",
    step: "03",
    title: "Sensor de Radar Inteligente (Doppler)",
    shortDesc: "Detección volumétrica por microondas para personas y vehículos",
    icon: Radio,
    material: "Sensor de inducción Doppler de microondas integrado en el chasis",
    panamaBenefit: "Ahorra batería toda la noche y sube al 100% al detectar movimiento real",
    specs: "Alcance de 8 a 10 metros • Modo 30% ahorro / 100% activo",
    description:
      "Presente en las farolas de calle de 1200W y 800W, el radar Doppler mantiene la luminaria encendida en modo tenue de ahorro energético (30%) y eleva el brillo al 100% de potencia en cuanto detecta personas o vehículos, maximizando la duración de la batería.",
    accent: "from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/30",
  },
  {
    id: "battery",
    step: "04",
    title: "Batería LiFePO4 de Larga Vida",
    shortDesc: "Química de litio-ferrofosfato termoestable y duradera",
    icon: BatteryCharging,
    material: "Batería LiFePO4 (Fosfato de Hierro y Litio) DC 3.2V - 6V",
    panamaBenefit: "10 a 12h de autonomía en días soleados y de 6 a 8h en días nublados",
    specs: "+2,000 ciclos de carga • Soporta altas temperaturas tropicales",
    description:
      "El corazón energético de la luminaria. La química LiFePO4 es estable, segura y duradera frente al calor de Panamá. Con una carga solar completa suministra de 10 a 12 horas de iluminación nocturna (y entre 6 y 8 horas en días nublados apoyándose en el modo de ahorro inteligente).",
    accent: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "chassis",
    step: "05",
    title: "Chasis Sellado IP66 / IP67 y Fijación Firme",
    shortDesc: "Blindaje impermeable anticorrosión con kit de montaje",
    icon: Shield,
    material: "Estructura de alta resistencia UV y aluminio con sellado hermético",
    panamaBenefit: "Resiste aguaceros tropicales, humedad salina y exposición continua al sol",
    specs: "Certificación IP66 / IP67 • Incluye tornillería y soportes",
    description:
      "Diseñado para resistir la intemperie en todo Panamá. Su carcasa sellada impide la filtración de agua de lluvia o insectos, e incluye sus soportes y tornillos para instalarla de forma práctica en pared, techo o poste utilizando herramientas básicas de hogar.",
    accent: "from-primary/20 to-primary/5 text-primary-foreground border-primary/40",
  },
];

export const ProductAnatomy: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<Layer>(LAYERS[0]);

  const renderLayerDetailCard = (layer: Layer) => (
    <div className="relative overflow-hidden rounded-3xl border border-solar/40 bg-card p-5 sm:p-8 shadow-xl animate-in fade-in duration-200">
      {/* Top Meta Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5 pb-4 border-b border-border/80">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-solar/15 text-solar font-mono text-xs font-black">
            {layer.step}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-solar">
            Cómo Está Hecha • Componente {layer.step}
          </span>
        </div>
        <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-[11px] font-bold flex items-center gap-1">
          <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
          Listo para Clima Tropical
        </span>
      </div>

      {/* Title & Main Description */}
      <h3 className="font-serif text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
        {layer.title}
      </h3>

      <p className="mt-3 text-xs sm:text-base text-muted-foreground leading-relaxed">
        {layer.description}
      </p>

      {/* Technical Specifications Bento Chips */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="rounded-2xl border border-border/80 bg-secondary/40 p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
            Material y Construcción
          </span>
          <p className="text-xs font-bold text-foreground">
            {layer.material}
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-secondary/40 p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
            Rendimiento Técnico
          </span>
          <p className="text-xs font-bold text-foreground">
            {layer.specs}
          </p>
        </div>

        <div className="sm:col-span-2 rounded-2xl border border-solar/30 bg-solar/10 p-4 flex items-start gap-3">
          <Sparkles aria-hidden="true" className="h-4 w-4 text-solar shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-solar-foreground font-mono">
              Ventaja en Panamá:
            </span>
            <p className="text-xs font-semibold text-foreground mt-0.5">
              {layer.panamaBenefit}
            </p>
          </div>
        </div>
      </div>

      {/* Next Layer Shortcut Button */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>Inspección técnica de componentes</span>
        <button
          type="button"
          onClick={() => {
            const currentIdx = LAYERS.findIndex((l) => l.id === layer.id);
            const nextIdx = (currentIdx + 1) % LAYERS.length;
            setActiveLayer(LAYERS[nextIdx]);
          }}
          className="pressable inline-flex items-center gap-1 font-bold text-solar hover:underline cursor-pointer"
        >
          <span>
            Siguiente componente ({LAYERS[(LAYERS.findIndex((l) => l.id === layer.id) + 1) % LAYERS.length].step})
          </span>
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <section id="anatomia" className="border-b border-border bg-card/40 py-20 sm:py-24 px-4 sm:px-6 transition-colors duration-500">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-solar-foreground shadow-sm">
            <Layers aria-hidden="true" className="h-3.5 w-3.5" />
            Ingeniería por Capas • Cómo Está Hecha
          </span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Anatomía de Nuestras Luminarias Rolinger
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Toca cualquiera de los 5 componentes tecnológicos para ver justo debajo cómo funciona cada parte por dentro sin necesidad de cables eléctricos.
          </p>
        </div>

        {/* Interactive Anatomy Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Layer Stepper (5 Cols on Desktop, Inline Accordion on Mobile) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 font-mono mb-2">
              Toca un componente para ver su explicación:
            </div>

            {LAYERS.map((layer) => {
              const isSelected = activeLayer.id === layer.id;
              const Icon = layer.icon;

              return (
                <div key={layer.id} className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveLayer(layer)}
                    aria-expanded={isSelected}
                    className={`pressable w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-card border-solar shadow-md ring-1 ring-solar/30"
                        : "bg-card/60 border-border hover:bg-secondary/60 hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl font-mono text-xs font-bold shrink-0 transition-colors ${
                          isSelected ? "bg-solar text-solar-foreground" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {layer.step}
                      </span>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-foreground leading-tight">
                          {layer.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {layer.shortDesc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Icon
                        aria-hidden="true"
                        className={`h-4 w-4 transition-colors ${isSelected ? "text-solar" : "text-muted-foreground"}`}
                      />
                      <ChevronDown
                        aria-hidden="true"
                        className={`h-4 w-4 lg:hidden transition-transform duration-200 ${
                          isSelected ? "rotate-180 text-solar" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                  </button>

                  {/* EN MÓVIL Y TABLET: La respuesta se muestra inmediatamente debajo del botón presionado */}
                  {isSelected && (
                    <div className="block lg:hidden pt-1 pb-2">
                      {renderLayerDetailCard(layer)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Layer Deep-Dive Stage on Desktop (Sticky so it is always visible next to the clicked button) */}
          <div className="hidden lg:block lg:col-span-7 lg:sticky lg:top-24">
            {renderLayerDetailCard(activeLayer)}
          </div>
        </div>
      </div>
    </section>
  );
};
