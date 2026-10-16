import React from "react";
import { Sun, BatteryCharging, Leaf, Shield, DollarSign, Clock, Zap, CheckCircle2, ArrowRight } from "lucide-react";

export const Benefits: React.FC = () => {
  return (
    <section id="beneficios" className="border-b border-border bg-sand/60 py-24 px-4 sm:px-6 transition-colors duration-500">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1 text-xs font-bold text-primary">
            <Leaf className="h-3.5 w-3.5" />
            Ingeniería & Sostenibilidad
          </span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            ¿Por qué la iluminación solar de Solar y Hogar supera a la convencional?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Diseñamos cada lámpara para brindar máxima luminosidad nocturna, durabilidad ante el clima húmedo de Panamá y absoluta independencia eléctrica.
          </p>
        </div>

        {/* Bespoke Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Item 1: Wide Feature Card ($0 Electric Bill) */}
          <div className="md:col-span-2 spring-card rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-solar/20 text-solar">
                  <DollarSign className="h-6 w-6 text-amber-500" />
                </span>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Cero Gasto Mensual
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">
                $0 en tu recibo de luz eléctrica, para siempre
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                Ilumina senderos, muros perimetrales, jardines y terrazas sin añadir un solo centavo a tu factura de luz. El sol tropical de Panamá genera toda la energía que necesitas durante el día para encender tus noches.
              </p>
            </div>

            {/* Visual Technical Comparison Box */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-secondary/50 p-4 border border-border/60">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Lámpara Convencional con Cable
                </span>
                <p className="text-xs text-foreground/80">
                  • Requiere romper paredes y zanjas en tierra<br />
                  • Costo de electricista: $80 - $200<br />
                  • Consumo continuo en tu recibo mensual
                </p>
              </div>

              <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-border/60 pt-3 sm:pt-0 sm:pl-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Solar y Hogar Inteligente
                </span>
                <p className="text-xs text-foreground font-medium">
                  • Instalación lista en 2 minutos<br />
                  • 0 cables y 0 costo de mantenimiento<br />
                  • Energía infinita 100% limpia y gratuita
                </p>
              </div>
            </div>
          </div>

          {/* Bento Item 2: Weatherproof IP65/IP67 */}
          <div className="spring-card rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Shield className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-secondary-foreground">
                  IP65 / IP67
                </span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-2">
                Resistencia a lluvias tropicales
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Sellado hermético contra aguaceros torrenciales, alta humedad ambiental y radiación UV intensa. No se oxidan ni filtran agua.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 text-xs font-semibold text-primary flex items-center gap-1.5">
              <span>Probadas bajo el clima de Panamá</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>

          {/* Bento Item 3: Fast Installation */}
          <div className="spring-card rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-solar/15 text-solar">
                  <Clock className="h-6 w-6 text-amber-500" />
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-secondary-foreground">
                  Plug & Play
                </span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-2">
                Instalación en 120 segundos
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Sin cables que enterrar ni electricistas. Clava la estaca en tu jardín o fija dos tornillos en tu fachada y la luminaria queda operativa de inmediato.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground">
              Incluye estacas de alta resistencia y kit de fijación
            </div>
          </div>

          {/* Bento Item 4: Lithium LiFePO4 Battery */}
          <div className="spring-card rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf/20 text-leaf">
                  <BatteryCharging className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  +2,000 Ciclos
                </span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-2">
                Baterías LiFePO4 de larga vida
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Celdas de fosfato de hierro y litio que resisten las altas temperaturas sin degradarse. Años de autonomía nocturna estable de 10 a 16 horas.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground">
              Sin efecto memoria ni pérdida de carga
            </div>
          </div>

          {/* Bento Item 5: Dusk Sensor */}
          <div className="spring-card rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Sun className="h-6 w-6 text-solar" />
                </span>
                <span className="rounded-full bg-solar/15 px-3 py-1 text-[11px] font-bold text-solar">
                  100% Autónomo
                </span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-2">
                Sensor crepuscular automático
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Detecta la caída de la noche y se enciende sola de forma automática. Al salir los primeros rayos del sol, se apaga y entra en modo de carga.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground">
              Despreocúpate de interruptores y temporizadores
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
