import React, { useState } from "react";
import { ShoppingBag, Menu, X, Sparkles, PhoneCall, Sun, Moon, FileText } from "lucide-react";
import { useCart } from "../context/CartContext";

export const Navbar: React.FC = () => {
  const { totalItems, setIsCartOpen, setIsQuotationOpen, items, nightMode, setNightMode } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo with Official Solar y Hogar Emblem */}
        <a href="/" className="group flex items-center gap-3 cursor-pointer">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/95 p-0.5 shadow-sm ring-1 ring-border/50 transition-transform duration-300 group-hover:scale-105 overflow-hidden">
            <img
              src="/logo-emblem.png"
              alt="Solar y Hogar"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-serif uppercase leading-none">
              Solar y Hogar
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5 font-mono">
              Panamá • Luz Solar
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider">
          <a
            href="/#catalogo"
            className="text-foreground/80 hover:text-solar transition-colors"
          >
            Catálogo
          </a>
          <a
            href="/#anatomia"
            className="text-foreground/80 hover:text-solar transition-colors"
          >
            Anatomía
          </a>
          <a
            href="/#simulador"
            className="flex items-center gap-1.5 text-foreground/80 hover:text-solar transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-solar" />
            Simulador
          </a>
          <a
            href="/#beneficios"
            className="text-foreground/80 hover:text-solar transition-colors"
          >
            Beneficios
          </a>
          <a
            href="/#envios-instalaciones"
            className="text-foreground/80 hover:text-solar transition-colors"
          >
            Envíos & Instalaciones
          </a>
          <a
            href="/#faq"
            className="text-foreground/80 hover:text-solar transition-colors"
          >
            Envíos & FAQ
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Day / Night Ambience Toggle with Spring Feedback */}
          <button
            type="button"
            onClick={() => setNightMode((prev) => !prev)}
            aria-label={nightMode ? "Cambiar a modo día" : "Cambiar a modo noche"}
            className="pressable relative flex h-9 px-3 items-center gap-2 rounded-full border border-border bg-card text-xs font-semibold text-foreground hover:border-solar/60 cursor-pointer shadow-sm"
            title={nightMode ? "Actualmente en modo noche. Clic para ver modo día" : "Actualmente en modo día. Clic para ver modo noche"}
          >
            {nightMode ? (
              <>
                <Moon className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="hidden sm:inline text-xs font-medium">Noche</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="hidden sm:inline text-xs font-medium">Día</span>
              </>
            )}
          </button>

          {/* Cotizar PDF Button */}
          <button
            type="button"
            onClick={() => {
              if (items.length > 0) {
                setIsQuotationOpen(true);
              } else {
                setIsCartOpen(true);
              }
            }}
            aria-label="Generar cotización oficial en PDF"
            className="pressable hidden sm:inline-flex h-9.5 items-center gap-1.5 rounded-full border border-border bg-secondary/80 hover:bg-secondary px-3.5 text-xs font-semibold text-foreground hover:border-solar/60 transition-all cursor-pointer"
            title="Generar cotización en PDF con las lámparas del carrito"
          >
            <FileText className="h-3.5 w-3.5 text-solar" />
            <span>Cotizar PDF</span>
          </button>

          {/* Cart Trigger Button */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label="Abrir carrito de compras"
            className="pressable relative flex h-9.5 items-center gap-2 rounded-full bg-primary px-3.5 text-primary-foreground shadow-sm hover:bg-primary/95 cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-bold">Carrito</span>
            {totalItems > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-solar px-1.5 text-[11px] font-extrabold text-solar-foreground shadow animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            className="pressable flex h-9.5 w-9.5 items-center justify-center rounded-full border border-border text-foreground md:hidden hover:bg-secondary cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background px-4 py-4 md:hidden animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-2.5 text-sm font-semibold">
            <a
              href="/#catalogo"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-secondary transition-colors"
            >
              Catálogo Oficial
            </a>
            <a
              href="/#anatomia"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-secondary transition-colors"
            >
              Anatomía & Capas
            </a>
            <a
              href="/#simulador"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary transition-colors"
            >
              <Sparkles className="h-4 w-4 text-solar" />
              Simulador Día / Noche
            </a>
            <a
              href="/#beneficios"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-secondary transition-colors"
            >
              Ventajas Fotovoltaicas
            </a>
            <a
              href="/#envios-instalaciones"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-secondary transition-colors"
            >
              Envíos & Instalaciones
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (items.length > 0) {
                  setIsQuotationOpen(true);
                } else {
                  setIsCartOpen(true);
                }
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-secondary transition-colors text-xs font-bold text-foreground cursor-pointer"
            >
              <FileText className="h-4 w-4 text-solar" />
              <span>Generar Cotización Oficial (PDF)</span>
            </button>

            <a
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-secondary transition-colors"
            >
              Envíos Ferguson, Uno Express & FAQ
            </a>
            <div className="pt-2 border-t border-border flex items-center justify-between px-3">
              <span className="text-xs text-muted-foreground">Servicio al cliente WhatsApp:</span>
              <a
                href="https://wa.me/50769893055?text=Hola%20Solar%20y%20Hogar,%20quisiera%20asesoria%20sobre%20las%20lamparas%20solares"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                6989-3055
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
