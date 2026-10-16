import React from "react";
import { Truck, Smartphone, ShieldCheck, MapPin, Heart, PhoneCall, PackageCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-card text-card-foreground transition-colors duration-500">
      {/* Panamá Logistics & Trust Banner */}
      <div className="border-b border-border bg-sand/70 py-10 px-4 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
          {/* Item 1 */}
          <div className="flex items-center justify-center sm:justify-start gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-solar/15 text-solar shrink-0">
              <Truck className="h-6 w-6 text-amber-500" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Despacho en 24h a todo Panamáá
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Transporte Ferguson, Uno Express y Servientrega
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-center justify-center sm:justify-start gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Smartphone className="h-6 w-6" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Paga con Yappy o ACH
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Banco General Yappy y Transferencias ACH
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-center justify-center sm:justify-start gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shrink-0">
              <ShieldCheck className="h-6 w-6" />
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
            <div className="flex items-center gap-3">
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
                  Panamáá • Iluminación Solar Inteligente
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Especialistas en iluminación solar exterior residencial y comercial en Panamáá.
              Cero cables, 0$ en tu factura de luz y encendido automático al anochecer.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-solar" />
              <span>Ciudad de Panamáá • Envíos a todas las provincias</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 font-mono">
              Navegación
            </h5>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-medium">
              <li>
                <a href="/#catalogo" className="hover:text-solar transition-colors">
                  Catálogo Oficial 2026
                </a>
              </li>
              <li>
                <a href="/#simulador" className="hover:text-solar transition-colors">
                  Simulador Día / Noche
                </a>
              </li>
              <li>
                <a href="/#beneficios" className="hover:text-solar transition-colors">
                  Ventajas Fotovoltaicas
                </a>
              </li>
              <li>
                <a href="/#envios-instalaciones" className="hover:text-solar transition-colors font-bold text-foreground">
                  Envíos e Instalaciones
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-solar transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Logistics & Support */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 font-mono">
              Envíos y Asesoría
            </h5>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Enviamos diariamente por Transporte Ferguson, Uno Express y Servientrega a David, Santiago, Chitréé, Penonoméé, Colón y todo el interior.
            </p>
            <a
              href="https://wa.me/50769893055?text=Hola%20Solar%20y%20Hogar,%20quisiera%20asesoria%20sobre%20las%20lamparas%20solares"
              target="_blank"
              rel="noopener noreferrer"
              className="pressable inline-flex items-center gap-2 rounded-xl bg-secondary border border-border px-4 py-2.5 text-xs font-bold text-foreground hover:border-solar/60 transition-colors"
            >
              <PhoneCall className="h-3.5 w-3.5 text-emerald-500" />
              <span>WhatsApp Servicio al Cliente: 6989-3055</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <p>© {new Date().getFullYear()} Solar y Hogar Panamáá. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            <span>Iluminando noches con energía limpia</span>
            <Heart className="h-3 w-3 text-solar fill-solar" />
          </p>
        </div>
      </div>
    </footer>
  );
};
