import React, { useState } from "react";
import { X, Truck, PhoneCall, FileText } from "lucide-react";
import { useCart } from "../context/CartContext";

export const PromoBanner: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const { setIsQuotationOpen } = useCart();

  if (!visible) return null;

  return (
    <aside
      aria-label="Aviso informativo"
      className="relative z-50 bg-gradient-to-r from-forest via-primary to-forest px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex flex-1 items-center justify-center gap-2 text-center sm:gap-3 flex-wrap">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-solar text-solar-foreground shrink-0">
            <Truck aria-hidden="true" className="h-3 w-3" />
          </span>
          <p className="tracking-wide text-[11px] sm:text-xs">
            <strong className="text-solar font-bold">DESPACHOS A TODO PANAMÁ:</strong>{" "}
            Retiro en sucursal (Ferguson y Uno Express) o Puerta a Puerta (Servientrega) • Pedidos al{" "}
            <a
              href="https://wa.me/50769893055?text=Hola%20Solar%20y%20Hogar,%20quisiera%20asesoria%20sobre%20las%20lamparas%20solares"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded bg-black/25 px-2 py-0.5 font-mono font-bold text-solar underline-offset-2 hover:bg-black/40 transition-colors"
            >
              <PhoneCall aria-hidden="true" className="h-3 w-3 text-solar" />
              <span>6989-3055</span>
            </a>
            <span className="mx-2 hidden sm:inline text-white/40">•</span>
            <button
              type="button"
              onClick={() => setIsQuotationOpen(true)}
              className="inline-flex items-center gap-1 text-solar hover:text-white underline font-bold cursor-pointer transition-colors"
            >
              <FileText aria-hidden="true" className="h-3 w-3" />
              <span>Generar Cotización PDF</span>
            </button>
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-primary-foreground/70 hover:text-primary-foreground transition-colors p-1 cursor-pointer shrink-0"
          aria-label="Cerrar banner informativo"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
};
