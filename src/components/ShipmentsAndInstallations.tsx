import React, { useState } from "react";
import { Truck, Home, Camera, MapPin, CheckCircle2, Play, Maximize2, X, MessageCircle, ArrowRight, ChevronLeft, ChevronRight, Video } from "lucide-react";
import { SHOWCASE_ITEMS, ShowcaseItem } from "../data/shipmentsInstallations";

export const ShipmentsAndInstallations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"todos" | "instalacion" | "envio">("todos");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const filteredItems = SHOWCASE_ITEMS.filter((item) => {
    if (activeTab === "todos") return true;
    return item.category === activeTab;
  });

  const totalInstalaciones = SHOWCASE_ITEMS.filter((i) => i.category === "instalacion").length;
  const totalEnvios = SHOWCASE_ITEMS.filter((i) => i.category === "envio").length;

  const handleOpenItem = (item: ShowcaseItem) => {
    const idx = SHOWCASE_ITEMS.findIndex((i) => i.id === item.id);
    if (idx !== -1) setSelectedIndex(idx);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : SHOWCASE_ITEMS.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! < SHOWCASE_ITEMS.length - 1 ? prev! + 1 : 0));
  };

  const currentModalItem = selectedIndex !== null ? SHOWCASE_ITEMS[selectedIndex] : null;

  return (
    <section id="envios-instalaciones" className="border-b border-border bg-background py-20 px-4 sm:px-6 transition-colors duration-500">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-solar/15 px-3.5 py-1 text-xs font-bold text-solar-foreground">
            <Camera className="h-3.5 w-3.5 text-solar" />
            Evidencia Real en Panamá
          </span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Envíos e Instalaciones
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Fotos reales de despachos preparados con encomiendas y videos de lámparas instaladas iluminando patios, portones y senderos en Panamá.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          <button
            type="button"
            onClick={() => setActiveTab("todos")}
            className={`pressable px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "todos"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Todos ({SHOWCASE_ITEMS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("instalacion")}
            className={`pressable inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "instalacion"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Home className="h-4 w-4 text-emerald-500" />
            Instalaciones en Casas ({totalInstalaciones} Videos)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("envio")}
            className={`pressable inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "envio"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Truck className="h-4 w-4 text-amber-500" />
            Envíos Realizados ({totalEnvios} Despachos)
          </button>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isVideo = item.mediaType === "video";

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-solar/40"
              >
                <div>
                  {/* Media Container */}
                  <div
                    onClick={() => handleOpenItem(item)}
                    className="relative h-60 w-full overflow-hidden rounded-2xl bg-black cursor-pointer"
                  >
                    {isVideo ? (
                      <div className="relative h-full w-full">
                        <video
                          src={item.mediaUrl}
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                          onMouseEnter={(e) => {
                            e.currentTarget.play().catch(() => {});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }}
                        />
                        {/* Play Badge Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-solar text-solar-foreground shadow-lg transition-transform duration-300 group-hover:scale-110">
                            <Play className="h-5 w-5 fill-solar-foreground ml-0.5" />
                          </span>
                        </div>
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                          <Video className="h-3 w-3 text-solar" /> Video en Vivo
                        </span>
                      </div>
                    ) : (
                      <div className="relative h-full w-full">
                        <img
                          src={item.mediaUrl}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs">
                            <Maximize2 className="h-5 w-5" />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Badges & Meta */}
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        item.category === "envio"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {item.category === "envio" ? (
                        <>
                          <Truck className="h-3 w-3" /> {item.badge}
                        </>
                      ) : (
                        <>
                          <Home className="h-3 w-3" /> {item.badge}
                        </>
                      )}
                    </span>

                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 font-mono">
                      <MapPin className="h-3 w-3 text-solar" />
                      {item.location}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-2.5 font-serif text-lg font-bold text-foreground group-hover:text-solar transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Footer Tag */}
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-foreground/80 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    {item.carrierOrType}
                  </span>
                  <span className="text-muted-foreground font-mono">{item.date}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* WhatsApp Share Banner for Customer Photos */}
        <div className="mt-12 rounded-3xl border border-solar/30 bg-gradient-to-r from-solar/10 via-sand/60 to-primary/10 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-solar-foreground">
              <Camera className="h-4 w-4 text-solar" />
              ¿Ya recibiste o instalaste tus lámparas?
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
              ¡Comparte tu foto o video y aparece en nuestra galería oficial!
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Envíanos una foto de tu paquete al recibirlo o un video de tu lámpara alumbrando tu patio por WhatsApp.
            </p>
          </div>

          <a
            href="https://wa.me/50769893055?text=Hola%20Solar%20y%20Hogar,%20les%20comparto%20la%20foto%20de%20mi%20instalacion%20para%20la%20galeria"
            target="_blank"
            rel="noopener noreferrer"
            className="pressable inline-flex items-center gap-2 rounded-2xl bg-solar px-6 py-3.5 text-xs sm:text-sm font-bold text-solar-foreground shadow-md hover:bg-solar/95 cursor-pointer shrink-0"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Compartir por WhatsApp (6989-3055)</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Lightbox / Video Modal */}
      {currentModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Previous Button */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 cursor-pointer backdrop-blur-xs"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 cursor-pointer backdrop-blur-xs"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div
            className="relative max-w-4xl w-full overflow-hidden rounded-3xl bg-card border border-border p-4 sm:p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 cursor-pointer"
              aria-label="Cerrar vista previa"
            >
              <X className="h-5 w-5" />
            </button>

            {currentModalItem.mediaType === "video" ? (
              <div className="relative w-full max-h-[65vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                <video
                  src={currentModalItem.mediaUrl}
                  controls
                  autoPlay
                  className="max-h-[65vh] w-full rounded-2xl object-contain bg-black"
                />
              </div>
            ) : (
              <div className="relative w-full max-h-[65vh] rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center">
                <img
                  src={currentModalItem.mediaUrl}
                  alt={currentModalItem.title}
                  className="max-h-[65vh] w-full rounded-2xl object-contain"
                />
              </div>
            )}

            <div className="mt-4 px-2 pb-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-solar">
                  <span className="font-bold uppercase tracking-wider bg-solar/15 text-solar-foreground px-2 py-0.5 rounded-md">
                    {currentModalItem.badge}
                  </span>
                  <span>•</span>
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{currentModalItem.location}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {selectedIndex! + 1} de {SHOWCASE_ITEMS.length}
                </span>
              </div>
              <h4 className="font-serif text-xl font-bold text-foreground mt-1.5">
                {currentModalItem.title}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {currentModalItem.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
