import React, { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useCart } from "../context/CartContext";

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);
  const { activeDepartment } = useCart();

  const isSolar = activeDepartment === "solar";

  // La burbuja de ayuda se retira sola para no tapar contenido en pantallas
  // pequeñas ni quedarse encima de las tarjetas al hacer scroll.
  useEffect(() => {
    const timer = window.setTimeout(() => setShowTooltip(false), 10000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed ${
        isSolar ? "bottom-16 sm:bottom-20 md:bottom-6" : "bottom-4 sm:bottom-6"
      } right-3 sm:right-6 z-40 flex items-center gap-2 sm:gap-3`}
    >
      {/* Tooltip message */}
      {showTooltip && (
        <div className="hidden sm:flex max-w-[15rem] items-center gap-2 rounded-2xl bg-card border border-border p-3 shadow-xl animate-in fade-in slide-in-from-right duration-300">
          <p className="text-xs font-medium leading-snug text-foreground">
            ¿Dudas con algún modelo? <strong className="text-emerald-600 dark:text-emerald-400">WhatsApp: 6989-3055</strong>
          </p>
          <button
            onClick={() => setShowTooltip(false)}
            className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
            aria-label="Cerrar sugerencia"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href="https://wa.me/50769893055?text=Hola%20Solar%20y%20Hogar,%20quisiera%20asesoria%20sobre%20las%20lamparas%20solares"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar servicio al cliente por WhatsApp 6989-3055"
        className="group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-emerald-600"
      >
        <span className="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping pointer-events-none opacity-75" />
        <MessageCircle aria-hidden="true" className="h-6 w-6 sm:h-7 sm:w-7 transition-transform group-hover:rotate-12" />
      </a>
    </div>
  );
};
