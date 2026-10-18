import React from "react";
import { Sun, BatteryCharging, Leaf, Shield, DollarSign, Wrench, CheckCircle2 } from "lucide-react";

export const Benefits: React.FC = () => {
  return (
    <section id="beneficios" className="border-b border-border bg-sand/60 py-24 px-4 sm:px-6 transition-colors duration-500">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1 text-xs font-bold text-primary">
            <Leaf aria-hidden="true" className="h-3.5 w-3.5" />
            Eficiencia & Sostenibilidad
          </span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            ¿Por qué la iluminación solar supera a la convencional?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Ventajas de contar con equipos fotovoltaicos autónomos en Panamá: cero cables, cero consumo en tu recibo de luz y encendido automático crepuscular.
          </p>
        </div>

        {/* Bespoke Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Item 1: Wide Feature Card ($0 Electric Bill) */}
          <div className="md:col-span-2 spring-card rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-solar/20 text-solar">
                  <DollarSign aria-hidden="true" className="h-6 w-6 text-amber-500" />
                </span>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Cero Gasto Mensual
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">
                $0 en tu recibo de luz eléctrica, para siempre
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                Ilumina entradas, muros perimetrales, jardines y estacionamientos sin añadir un solo centavo a tu factura eléctrica. El sol de Panamá genera la energía que necesitas durante el día para encender tus noches.
              </p>
            </div>

            {/* Visual Technical Comparison Box */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-secondary/50 p-4 border border-border/60">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Lámpara Convencional con Cable
                </span>
                <p className="text-xs text-foreground/80">
                  • Requiere picar paredes y abrir zanjas para cableado<br />
                  • Costo de instalación eléctrica: $80 - $200<br />
                  • Consumo continuo en tu factura mensual
                </p>
              </div>

              <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-border/60 pt-3 sm:pt-0 sm:pl-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                  Solar y Hogar Inteligente
                </span>
                <p className="text-xs text-foreground font-medium">
                  • Montaje práctico con herramientas básicas<br />
                  • 0 cables eléctricos y 0 pago de electricidad<br />
                  • Energía 100% solar limpia y autónoma
                </p>
              </div>
            </div>
          </div>

          {/* Bento Item 2: Weatherproof IP66/IP67 */}
          <div className="spring-card rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Shield aria-hidden="true" className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-secondary-foreground">
                  IP66 / IP67
                </span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-2">
                Resistencia a lluvias tropicales
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Sellado hermético contra aguaceros intensos, alta humedad ambiental y radiación solar continua. Diseñadas para trabajar a la intemperie.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 text-xs font-semibold text-primary flex items-center gap-1.5">
              <span>Probadas bajo el clima de Panamá</span>
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
            </div>
          </div>

          {/* Bento Item 3: Practical Installation with Basic Tools */}
          <div className="spring-card rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-solar/15 text-solar">
                  <Wrench aria-hidden="true" className="h-6 w-6 text-amber-500" />
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-secondary-foreground">
                  Montaje Práctico
                </span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-2">
                Instalación práctica sin cableado
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Son muy prácticas de colocar porque no requieren conexión a la red eléctrica. Solo necesitas herramientas básicas (como taladro, destornillador o llave) para fijar su soporte en pared, techo o poste en unos 15 a 25 minutos.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground">
              Incluye kit de tornillos y soporte de fijación
            </div>
          </div>

          {/* Bento Item 4: Lithium LiFePO4 Battery */}
          <div className="spring-card rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf/20 text-leaf">
                  <BatteryCharging aria-hidden="true" className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  +2,000 Ciclos
                </span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-2">
                Baterías LiFePO4 de larga vida
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Celdas de fosfato de hierro y litio que soportan altas temperaturas. Ofrecen de 10 a 12 horas de autonomía en días soleados y de 6 a 8 horas en días nublados (con carga del 40% al 60% en modo sensor).
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground">
              Gestión inteligente de energía con radar
            </div>
          </div>

          {/* Bento Item 5: Dusk Sensor */}
          <div className="spring-card rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Sun aria-hidden="true" className="h-6 w-6 text-solar" />
                </span>
                <span className="rounded-full bg-solar/15 px-3 py-1 text-[11px] font-bold text-solar">
                  100% Autónomo
                </span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-2">
                Sensor crepuscular automático
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Detecta la caída de la noche y se enciende sola de forma automática. Al salir los primeros rayos del sol, se apaga y entra en modo de carga solar.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground">
              Incluye control remoto para ajustar modos
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
