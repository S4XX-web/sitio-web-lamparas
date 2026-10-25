import React, { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, Sparkles, PhoneCall, Sun, Moon, FileText, Lock } from "lucide-react";
import { useCart } from "../context/CartContext";

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const {
    totalItems,
    setIsCartOpen,
    setIsQuotationOpen,
    items,
    products,
    nightMode,
    setNightMode,
    activeDepartment,
    setActiveDepartment,
  } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const solarCount = products.filter((product) => product.department === "solar").length;
  const homeCount = products.filter((product) => product.department === "muebles").length;

  const handleNavigateDepartment = (dept: "general" | "solar" | "muebles" | "accesorios") => {
    setActiveDepartment(dept);
    navigate({ to: "/", hash: dept === "general" ? undefined : dept });
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo with Official Solar y Hogar Emblem */}
        <button
          type="button"
          onClick={() => handleNavigateDepartment("general")}
          className="group flex items-center gap-2 sm:gap-3 cursor-pointer text-left min-w-0"
        >
          <div className="relative flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-white/95 p-0.5 shadow-sm ring-1 ring-border/50 transition-transform duration-300 group-hover:scale-105 overflow-hidden">
            <img
              src="/logo-emblem.png"
              alt="Solar y Hogar"
              width={128}
              height={128}
              decoding="async"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base sm:text-2xl font-extrabold tracking-[0.01em] text-foreground font-serif uppercase leading-none truncate">
              Solar y Hogar
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5 font-mono truncate">
              Panamá • Energía & Hogar
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs font-semibold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => handleNavigateDepartment("general")}
            className={`transition-colors cursor-pointer py-1 ${
              activeDepartment === "general"
                ? "text-solar-ink font-bold border-b-2 border-solar"
                : "text-foreground/80 hover:text-solar-ink"
            }`}
          >
            Inicio
          </button>

          <button
            type="button"
            onClick={() => handleNavigateDepartment("solar")}
            className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer py-1 ${
              activeDepartment === "solar"
                ? "text-solar-ink font-bold border-b-2 border-solar"
                : "text-foreground/80 hover:text-solar-ink"
            }`}
          >
            <Sun aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Energía Solar</span>
            <span className="rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 text-[11px] font-bold">
              {solarCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigateDepartment("muebles")}
            className={`transition-colors cursor-pointer py-1 ${
              activeDepartment === "muebles"
                ? "text-solar-ink font-bold border-b-2 border-solar"
                : "text-foreground/80 hover:text-solar-ink"
            }`}
          >
            Muebles
          </button>

          <button
            type="button"
            onClick={() => handleNavigateDepartment("accesorios")}
            className={`transition-colors cursor-pointer py-1 ${
              activeDepartment === "accesorios"
                ? "text-solar-ink font-bold border-b-2 border-solar"
                : "text-foreground/80 hover:text-solar-ink"
            }`}
          >
            Accesorios
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Day / Night Ambience Toggle with Spring Feedback */}
          <button
            type="button"
            onClick={() => setNightMode((prev) => !prev)}
            aria-label={nightMode ? "Modo noche activo. Cambiar a modo día" : "Modo día activo. Cambiar a modo noche"}
            className="pressable relative flex h-11 w-11 sm:h-9 sm:w-auto items-center justify-center gap-2 rounded-full border border-border bg-card text-xs font-semibold text-foreground hover:border-solar/60 cursor-pointer shadow-sm shrink-0"
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

          {/* Cotizador Oficial (PDF) Button - Visible on Desktop */}
          <button
            type="button"
            onClick={() => setIsQuotationOpen(true)}
            aria-label="Cotizador PDF: abrir el cotizador oficial"
            className="pressable hidden md:inline-flex h-9.5 items-center gap-1.5 rounded-full border border-solar/40 bg-solar/15 hover:bg-solar text-foreground hover:text-solar-foreground px-3.5 text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md shrink-0"
            title="Generar cotización oficial en PDF para empresas o particulares"
          >
            <FileText aria-hidden="true" className="h-4 w-4 text-solar-ink" />
            <span>Cotizador PDF</span>
          </button>

          {/* Cart Trigger Button */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label="Abrir carrito de compras"
            className="pressable relative flex h-11 sm:h-9.5 items-center gap-1.5 sm:gap-2 rounded-full bg-primary px-3 sm:px-3.5 text-primary-foreground shadow-sm hover:bg-primary/95 cursor-pointer shrink-0"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-bold">Carrito</span>
            {totalItems > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-solar px-1.5 text-[11px] font-extrabold text-solar-foreground shadow animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          {/* Seller Admin Shortcut Button (Desktop) */}
          <Link
            to="/admin"
            className="pressable hidden sm:flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-border/80 bg-card text-muted-foreground hover:text-amber-500 hover:border-amber-500/50 transition-colors shadow-xs shrink-0"
            title="Panel de Vendedor (acceso privado)"
          >
            <Lock aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            className="pressable flex h-11 w-11 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-full border border-border text-foreground lg:hidden hover:bg-secondary cursor-pointer shrink-0"
          >
            {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background px-4 py-4 lg:hidden animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-2.5 text-sm font-semibold">
            <button
              type="button"
              onClick={() => handleNavigateDepartment("general")}
              className={`text-left px-3.5 py-3 rounded-xl transition-colors ${
                activeDepartment === "general"
                  ? "bg-solar text-solar-foreground font-bold"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              Portada Principal (Presentación General)
            </button>

            <button
              type="button"
              onClick={() => handleNavigateDepartment("solar")}
              className={`flex items-center justify-between text-left px-3.5 py-3 rounded-xl transition-colors ${
                activeDepartment === "solar"
                  ? "bg-solar text-solar-foreground font-bold"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun aria-hidden="true" className="h-4 w-4 text-solar-ink" />
                <span>Iluminación & Energía Solar</span>
              </div>
              <span className="rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[11px] font-bold">
                {solarCount} {solarCount === 1 ? "Modelo" : "Modelos"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigateDepartment("muebles")}
              className={`flex items-center justify-between text-left px-3.5 py-3 rounded-xl transition-colors ${
                activeDepartment === "muebles"
                  ? "bg-solar text-solar-foreground font-bold"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              <span>Muebles & Terraza</span>
              {homeCount > 0 ? (
                <span className="rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[11px] font-bold">
                  {homeCount} {homeCount === 1 ? "producto" : "productos"}
                </span>
              ) : (
                <span className="rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-[11px] font-bold">
                  Próximamente
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNavigateDepartment("accesorios")}
              className={`flex items-center justify-between text-left px-3.5 py-3 rounded-xl transition-colors ${
                activeDepartment === "accesorios"
                  ? "bg-solar text-solar-foreground font-bold"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              <span>Accesorios de Hogar</span>
              <span className="rounded-full bg-amber-500/20 text-amber-500 px-2 py-0.5 text-[11px] font-bold">
                Próximamente
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsQuotationOpen(true);
              }}
              className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left bg-solar/15 border border-solar/30 hover:bg-solar hover:text-solar-foreground transition-colors text-xs font-bold text-foreground cursor-pointer"
            >
              <FileText aria-hidden="true" className="h-4 w-4 text-solar-ink" />
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

            {/* Mobile Admin Link */}
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-3 rounded-xl border border-dashed border-border/80 text-xs font-semibold text-muted-foreground hover:text-amber-500 hover:border-amber-500/50 transition-colors mt-1"
            >
              <div className="flex items-center gap-2">
                <Lock aria-hidden="true" className="h-3.5 w-3.5 text-amber-500" />
                <span>Panel Privado de Vendedor</span>
              </div>
              <span className="text-[11px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-mono font-bold">
                PRIVADO
              </span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
