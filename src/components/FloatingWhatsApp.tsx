import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip message */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-card border border-border p-3 shadow-xl animate-in fade-in slide-in-from-right duration-300">
          <p className="text-xs font-medium text-foreground">
            ¿Dudas con algún modelo? <strong className="text-emerald-600 dark:text-emerald-400">WhatsApp: 6989-3055</strong>
          </p>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-muted-foreground hover:text-foreground ml-1 cursor-pointer"
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
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-emerald-600"
      >
        <span className="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping pointer-events-none opacity-75" />
        <MessageCircle className="h-7 w-7 transition-transform group-hover:rotate-12" />
      </a>
    </div>
  );
};
