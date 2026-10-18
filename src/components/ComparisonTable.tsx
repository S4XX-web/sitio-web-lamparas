import React from "react";
import { Zap, Sun, Shield, BatteryCharging, Radio, Check, ShoppingBag, Eye, ArrowLeftRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PRODUCTS } from "../data/products";
import { useCart } from "../context/CartContext";

export const ComparisonTable: React.FC = () => {
  const { addItem, products } = useCart();
  const solarModels = products.filter((p) => p.department === "solar" || !p.department);

  const specs = [
    {
      feature: "Potencia Nominal",
      icon: Zap,
      values: ["1200 Watts", "800 Watts", "300 Watts"],
    },
    {
      feature: "Marca y Modelo",
      icon: Shield,
      values: [
        "Rolinger Farola Calle 1200W",
        "Rolinger Farola Calle 800W",
        "Rolinger Proyector TYN-JBP-300W",
      ],
    },
    {
      feature: "Tipo de Panel Solar",
      icon: Sun,
      values: [
        "Silicio Multi-cristalino Integrado",
        "Silicio Multi-cristalino Integrado",
        "Silicio Monocristalino Independiente (Marco Aluminio)",
      ],
    },
    {
      feature: "Tecnología de Sensor",
      icon: Radio,
      values: [
        "Radar Induction (Movimiento) + Crepuscular",
        "Radar Induction (Movimiento) + Crepuscular",
        "Fotocélula Crepuscular + Control Remoto",
      ],
    },
    {
      feature: "Autonomía Estimada",
      icon: BatteryCharging,
      values: [
        "10-12h (Soleado) / 6-8h (Nublado en modo radar)",
        "10-12h (Soleado) / 6-8h (Nublado en modo radar)",
        "8-12h (Soleado) / 5-7h (Nublado)",
      ],
    },
    {
      feature: "Temperatura de Color",
      icon: Sun,
      values: [
        "6500K Blanco Frío de Alta Claridad",
        "6500K Blanco Frío de Alta Claridad",
        "6500K Blanco Frío de Alta Claridad",
      ],
    },
    {
      feature: "Clasificación de Protección",
      icon: Shield,
      values: [
        "IP66 + Diseño Antirrayos",
        "IP66 + Diseño Antirrayos",
        "IP67 Impermeable Todo Clima",
      ],
    },
    {
      feature: "Control Remoto",
      icon: Radio,
      values: [
        "Inalámbrico con Temporizador (Time Switch)",
        "Inalámbrico con Temporizador (Time Switch)",
        "Multifunción (Brillo, Timer, Reset)",
      ],
    },
    {
      feature: "Instalación y Herramientas",
      icon: Check,
      values: [
        "Práctica sin cables (requiere herramientas básicas)",
        "Práctica sin cables (requiere herramientas básicas)",
        "Práctica con soporte ajustable (requiere herramientas básicas)",
      ],
    },
  ];

  return (
    <section id="comparativa" className="border-b border-border bg-card/60 py-12 sm:py-20 px-3 sm:px-6 transition-colors duration-500">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-solar-foreground shadow-sm">
            <Zap aria-hidden="true" className="h-3.5 w-3.5" />
            Ficha Comparativa Técnica Oficial
          </span>
          <h2 className="mt-3 font-serif text-2xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            ¿Cuál modelo Rolinger se adapta mejor a tu espacio?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            Compara frente a frente las especificaciones técnicas de nuestra línea Rolinger: Farolas de calle 1200W y 800W con radar, y el Proyector 300W IP67.
          </p>
        </div>

        {/* Mobile Scroll Indicator */}
        <div className="mb-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-solar md:hidden">
          <ArrowLeftRight aria-hidden="true" className="h-3.5 w-3.5 animate-pulse" />
          <span>Desliza la tabla hacia los lados para comparar los 3 modelos</span>
        </div>

        {/* Comparison Table Container */}
        <div className="w-full max-w-full overflow-x-auto min-w-0 overscroll-x-contain rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-xl">
          <table className="w-full text-left border-collapse min-w-[580px] sm:min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="sticky left-0 z-10 bg-secondary/95 backdrop-blur-sm p-3 sm:p-5 text-xs font-bold uppercase tracking-wider text-muted-foreground w-1/4">
                  Especificación
                </th>
                {solarModels.map((prod) => (
                  <th key={prod.id} className="p-4 sm:p-5 text-center w-1/4 border-l border-border/70">
                    <div className="flex flex-col items-center">
                      <span className="rounded-full bg-solar/20 px-2.5 py-0.5 text-[10px] font-extrabold text-solar mb-2">
                        {prod.badge}
                      </span>
                      <img
                        src={prod.image}
                        alt={prod.name}
                        loading="lazy"
                        className="h-24 w-24 object-cover rounded-2xl shadow-sm mb-2 border border-border"
                      />
                      <h4 className="font-serif text-sm font-bold text-foreground line-clamp-2 px-1">
                        {prod.name}
                      </h4>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-lg font-extrabold text-solar font-serif">
                          ${prod.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground font-semibold">USD</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Link
                          to="/producto/$productId"
                          params={{ productId: prod.id }}
                          className="pressable inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-card cursor-pointer"
                        >
                          <Eye aria-hidden="true" className="h-3.5 w-3.5" />
                          <span>Ver Ficha</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => addItem(prod, 1)}
                          className="pressable flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/95 cursor-pointer"
                        >
                          <ShoppingBag aria-hidden="true" className="h-3.5 w-3.5" />
                          <span>Pedir</span>
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
              {specs.map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-card" : "bg-secondary/30"}
                >
                  <td className="sticky left-0 z-10 bg-card/95 backdrop-blur-sm p-3 sm:p-5 font-semibold text-foreground flex items-center gap-2">
                    <row.icon aria-hidden="true" className="h-4 w-4 text-solar shrink-0" />
                    <span>{row.feature}</span>
                  </td>
                  {row.values.map((val, vIdx) => (
                    <td
                      key={vIdx}
                      className="p-3 sm:p-5 text-center text-muted-foreground border-l border-border/60 font-medium leading-relaxed"
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Decision Assistance Banner */}
        <div className="mt-8 rounded-2xl bg-sand/60 border border-border p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="font-serif text-base font-bold text-foreground">
              ¿No estás seguro de cuál modelo elegir para tu espacio?
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Te asesoramos sin costo por WhatsApp según el área a iluminar y la altura de instalación en tu propiedad.
            </p>
          </div>
          <a
            href="https://wa.me/50769893055?text=Hola%20Solar%20y%20Hogar,%20quisiera%20asesoria%20para%20saber%20cual%20modelo%20Rolinger%20se%20adapta%20mejor%20a%20mi%20propiedad"
            target="_blank"
            rel="noopener noreferrer"
            className="pressable rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold shadow-sm whitespace-nowrap cursor-pointer"
          >
            Consultar con Asesor
          </a>
        </div>
      </div>
    </section>
  );
};
