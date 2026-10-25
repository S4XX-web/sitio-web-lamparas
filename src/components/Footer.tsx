import React from "react";
import { Truck, Smartphone, ShieldCheck, MapPin, Heart, PhoneCall, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCart } from "../context/CartContext";

export const Footer: React.FC = () => {
  const { setActiveDepartment, setIsQuotationOpen, products } = useCart();
  const solarCount = products.filter((product) => product.department === "solar").length;

  return (
    <footer className="border-t border-border bg-card text-card-foreground transition-colors duration-500 pb-20 md:pb-0">
      {/* Panamá Logistics & Trust Banner */}
      <div className="border-b border-border bg-sand/70 py-10 px-4 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
          {/* Item 1 */}
          <div className="flex items-center justify-center sm:justify-start gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-solar/15 text-solar-ink shrink-0">
              <Truck aria-hidden="true" className="h-6 w-6 text-amber-500" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Despacho a todo Panamá
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ferguson y Uno Express (Sucursal) • Servientrega (Puerta a Puerta)
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-center justify-center sm:justify-start gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Smartphone aria-hidden="true" className="h-6 w-6" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Paga con Yappy o ACH
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Banco General Yappy y Transferencias Bancarias ACH
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-center justify-center sm:justify-start gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shrink-0">
              <ShieldCheck aria-hidden="true" className="h-6 w-6" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Calidad Inspeccionada
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cada lámpara se prueba antes de enviarse
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Panamá Info */}
      <div className="mx-auto max-w-6xl py-14 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand Presentation */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setActiveDepartment("general")}
              className="flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="h-14 w-14 rounded-full bg-white/95 p-1 shadow-md ring-1 ring-border/40 overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src="/logo-emblem.png"
                  alt="Solar y Hogar"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-foreground font-serif uppercase">
                  Solar y Hogar
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  Panamá • Energía Solar & Soluciones de Hogar
                </span>
              </div>
            </button>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Tu aliado en Panamá para iluminación solar exterior de alta potencia, eficiencia energética y soluciones para el confort del hogar.
              Cero cables, $0 en tu factura de luz y preparación integral para tus espacios.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-solar-ink" />
              <span>Panamá • Cobertura de envíos a nivel nacional</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 font-mono">
              Departamentos y Secciones
            </h5>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveDepartment("general")}
                  className="hover:text-solar-ink transition-colors font-semibold text-foreground cursor-pointer text-left"
                >
                  Portada Principal (Presentación General)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveDepartment("solar")}
                  className="hover:text-solar-ink transition-colors cursor-pointer text-left"
                >
                  Iluminación & Energía Solar ({solarCount} {solarCount === 1 ? "Modelo" : "Modelos"})
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveDepartment("muebles")}
                  className="hover:text-solar-ink transition-colors cursor-pointer text-left"
                >
                  Muebles & Terraza (Próximo Lanzamiento)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveDepartment("accesorios")}
                  className="hover:text-solar-ink transition-colors cursor-pointer text-left"
                >
                  Accesorios & Decoración (Próximo Lanzamiento)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsQuotationOpen(true)}
                  className="hover:text-solar-ink transition-colors font-bold text-foreground cursor-pointer text-left"
                >
                  Generador de Cotización Oficial (PDF)
                </button>
              </li>
            </ul>
          </div>

          {/* Logistics & Support */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 font-mono">
              Envíos y Asesoría
            </h5>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Realizamos despachos a todo Panamá mediante Transporte Ferguson y Uno Express (para retiro en sucursal) y Servientrega Panamá (única agencia con entrega puerta a puerta además de retiro en sucursal).
            </p>
            <a
              href="https://wa.me/50769893055?text=Hola%20Solar%20y%20Hogar,%20quisiera%20asesoria%20sobre%20sus%20productos"
              target="_blank"
              rel="noopener noreferrer"
              className="pressable inline-flex items-center gap-2 rounded-xl bg-secondary border border-border px-4 py-2.5 text-xs font-bold text-foreground hover:border-solar/60 transition-colors"
            >
              <PhoneCall aria-hidden="true" className="h-3.5 w-3.5 text-emerald-500" />
              <span>WhatsApp Servicio al Cliente: 6989-3055</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <p>© {new Date().getFullYear()} Solar y Hogar Panamá. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1">
              <span>Energía limpia y soluciones para tu hogar</span>
              <Heart aria-hidden="true" className="h-3 w-3 text-solar-ink fill-solar" />
            </p>
            <Link
              to="/admin"
              className="text-muted-foreground/60 hover:text-amber-500 transition-colors inline-flex items-center gap-1.5 font-medium border border-border/60 hover:border-amber-500/40 px-2 py-0.5 rounded-md"
              title="Panel de Vendedor"
            >
              <Lock className="w-3 h-3" />
              <span>Acceso Vendedor</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
