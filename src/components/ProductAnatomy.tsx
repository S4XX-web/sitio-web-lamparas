import React, { useState } from "react";
import { Sun, Zap, Radio, BatteryCharging, Shield, Sparkles, Layers, CheckCircle2, ArrowRight } from "lucide-react";

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
    title: "Celdas Fotovoltaicas Multisilicio",
    shortDesc: "Captación solar de alta tasa de conversión fotoeléctrica",
    icon: Sun,
    material: "Silicio multi-cristalino grado A con cubierta de vidrio templado antirrayos",
    panamaBenefit: "Carga continua incluso bajo la nubosidad y lluvias tropicales de Panamá",
    specs: "Eficiencia Clase A++ • Cero consumo de red eléctrica",
    description:
      "Ubicado en la parte superior de la farola, este panel solar de silicio multi-cristalino convierte la luz solar en electricidad limpia. Su superficie tratada repele el agua de lluvia y el polvo, garantizando máxima captación durante las horas matutinas para iluminar toda la noche.",
    accent: "from-amber-500/20 to-amber-500/5 text-amber-500 border-amber-500/30",
  },
  {
    id: "led",
    step: "02",
    title: "Matriz Óptica LED de Alta Pureza",
    shortDesc: "Iluminación 6500K con óptica de dispersión gran angular",
    icon: Zap,
    material: "Perlas LED de emisión blanca fría 6500K y reflectores facetados",
    panamaBenefit: "Claridad total en portones, fachadas y patios sin calentar la estructura",
    specs: "Hasta 50,000 horas de vida útil • Mínima degradación lumínica",
    description:
      "Múltiples módulos LED organizados en paneles direccionales que proyectan un haz uniforme y expansivo de 120° a 140°. Ofrece una visibilidad nítida que disuade intrusos y realza la seguridad perimetral de tu residencia o finca.",
    accent: "from-solar/20 to-solar/5 text-solar border-solar/30",
  },
  {
    id: "radar",
    step: "03",
    title: "Sensor de Radar Inteligente (Doppler)",
    shortDesc: "Detección volumétrica por microondas para cuerpos humanos y autos",
    icon: Radio,
    material: "Sensor de inducción Doppler de microondas integrado bajo chasis",
    panamaBenefit: "No se confunde con ramas o viento; responde con precisión a personas y vehículos",
    specs: "Alcance de 8 a 10 metros • Modo 30% reposo / 100% activo",
    description:
      "A diferencia de los sensores infrarrojos comunes que fallan con el calor tropical, el radar Doppler de Rolinger emite ondas microondas invisibles. Mantiene la farola en iluminación tenue de ahorro (30%) y se eleva al 100% de potencia al instante cuando alguien se aproxima.",
    accent: "from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/30",
  },
  {
    id: "battery",
    step: "04",
    title: "Batería LiFePO4 de Grado Automotriz",
    shortDesc: "Química de litio-ferrofosfato termoestable y ultra duradera",
    icon: BatteryCharging,
    material: "Batería LiFePO4 (Fosfato de Hierro y Litio) DC 3.2V - 6V",
    panamaBenefit: "Soporta temperaturas tropicales elevadas sin riesgo de sobrecalentamiento",
    specs: "+2,000 ciclos de recarga completa (+5 años de uso diario continuo)",
    description:
      "El corazón energético de la luminaria. La química LiFePO4 es la más segura y duradera de la industria solar. Almacena la energía suficiente para brindar de 14 a 18 horas de luz ininterrumpida, asegurando que tu propiedad amanezca iluminada.",
    accent: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "chassis",
    step: "05",
    title: "Chasis Monobloque Sellado IP66 / IP67",
    shortDesc: "Blindaje impermeable y anticorrosión con diseño antirrayos",
    icon: Shield,
    material: "Polímero de alta resistencia UV con juntas herméticas de silicona marina",
    panamaBenefit: "Inmune a la humedad salina, aguaceros torrenciales y calor abrasador",
    specs: "Certificación IP66 / IP67 • Tornillería de acero inoxidable",
    description:
      "Diseñado para resistir el rigor del clima de Panamá. Su carcasa monobloque con aletas de disipación y protección antirrayos impide cualquier filtración de agua o insectos, permitiendo años de funcionamiento a la intemperie sin requerir mantenimiento.",
    accent: "from-primary/20 to-primary/5 text-primary-foreground border-primary/40",
  },
];

export const ProductAnatomy: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<Layer>(LAYERS[0]);

  return (
    <section id="anatomia" className="border-b border-border bg-card/40 py-24 px-4 sm:px-6 transition-colors duration-500">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-solar-foreground shadow-sm">
            <Layers className="h-3.5 w-3.5" />
            Ingeniería por Capas
          </span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Anatomía de una Farola Rolinger
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Descubre los 5 componentes tecnológicos que permiten generar luz brillante durante toda la noche sin tender un solo cable ni pagar electricidad.
          </p>
        </div>

        {/* Interactive Anatomy Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Layer Stepper (5 Cols) */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 font-mono mb-2">
              Selecciona un componente para inspeccionar:
            </div>

            {LAYERS.map((layer) => {
              const isSelected = activeLayer.id === layer.id;
              const Icon = layer.icon;

              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setActiveLayer(layer)}
                  className={`pressable w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-card border-solar shadow-md ring-1 ring-solar/30 scale-[1.01]"
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

                  <Icon className={`h-4 w-4 shrink-0 transition-colors ${isSelected ? "text-solar" : "text-muted-foreground"}`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Layer Deep-Dive Stage (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl">
              {/* Top Meta Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-4 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-solar/15 text-solar font-mono text-xs font-black">
                    {activeLayer.step}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-solar">
                    Componente Oficial Rolinger
                  </span>
                </div>
                <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Listo para Clima Tropical
                </span>
              </div>

              {/* Title & Main Description */}
              <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {activeLayer.title}
              </h3>

              <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                {activeLayer.description}
              </p>

              {/* Technical Specifications Bento Chips */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Chip 1 */}
                <div className="rounded-2xl border border-border/80 bg-secondary/40 p-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    Material & Construcción
                  </span>
                  <p className="text-xs font-bold text-foreground">
                    {activeLayer.material}
                  </p>
                </div>

                {/* Chip 2 */}
                <div className="rounded-2xl border border-border/80 bg-secondary/40 p-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    Rendimiento Técnico
                  </span>
                  <p className="text-xs font-bold text-foreground">
                    {activeLayer.specs}
                  </p>
                </div>

                {/* Chip 3: Panama Benefit Banner */}
                <div className="sm:col-span-2 rounded-2xl border border-solar/30 bg-solar/10 p-4 flex items-start gap-3">
                  <Sparkles className="h-4 w-4 text-solar shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-solar-foreground font-mono">
                      Ventaja para Propietarios en Panamá:
                    </span>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {activeLayer.panamaBenefit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Layer Shortcut Button */}
              <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Inspección técnica de hardware</span>
                <button
                  type="button"
                  onClick={() => {
                    const currentIdx = LAYERS.findIndex((l) => l.id === activeLayer.id);
                    const nextIdx = (currentIdx + 1) % LAYERS.length;
                    setActiveLayer(LAYERS[nextIdx]);
                  }}
                  className="pressable inline-flex items-center gap-1 font-bold text-solar hover:underline cursor-pointer"
                >
                  <span>Siguiente componente ({LAYERS[(LAYERS.findIndex((l) => l.id === activeLayer.id) + 1) % LAYERS.length].step})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
