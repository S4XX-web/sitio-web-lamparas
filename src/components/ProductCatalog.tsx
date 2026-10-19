import React, { useState, useMemo } from "react";
import { Search, Sparkles, Sun, ArrowUpDown, X, Armchair, MessageCircle, Home } from "lucide-react";
import { useCart } from "../context/CartContext";
import { ProductCard } from "./ProductCard";

export const ProductCatalog: React.FC = () => {
  const { products } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");

  const categories = [
    { id: "all", label: `Todo el Catálogo (${products.length})` },
    { id: "solar", label: `Iluminación Solar (${products.filter((p) => p.department === "solar" || !p.department).length})` },
    { id: "farolas", label: "Farolas de Calle" },
    { id: "reflector", label: "Proyector Solar" },
    { id: "muebles", label: "Muebles & Terraza" },
    { id: "accesorios", label: "Accesorios de Hogar" },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "all"
          ? true
          : selectedCategory === "solar"
          ? p.department === "solar" || p.category === "farolas" || p.category === "reflector"
          : selectedCategory === "muebles"
          ? p.department === "muebles" || p.category === "muebles"
          : selectedCategory === "accesorios"
          ? p.department === "accesorios" || p.category === "accesorios"
          : p.category === selectedCategory;

      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.lumens ? p.lumens.toLowerCase().includes(searchQuery.toLowerCase()) : false);
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <section id="catalogo" className="relative overflow-hidden bg-forest/95 text-white py-24 px-4 sm:px-6 transition-colors duration-500">
      {/* Ambient Lighting Orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-leaf/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-32 h-[30rem] w-[30rem] rounded-full bg-solar/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-solar-foreground shadow-sm">
            <Home aria-hidden="true" className="h-4 w-4" />
            Catálogo Oficial Solar y Hogar
          </span>
          <h2 className="mt-4 font-serif text-3xl font-extrabold text-white sm:text-5xl tracking-tight">
            Colección de Iluminación & Hogar 2026
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-white/85 leading-relaxed">
            Luminarias solares de alta potencia disponibles con entrega inmediata en 24h, y las próximas líneas de mobiliario y accesorios para transformar tu casa en Panamá.
          </p>
        </div>

        {/* Filter and Search Bar Controls */}
        <div className="mb-10 flex flex-col gap-4 rounded-3xl bg-black/40 p-4 sm:p-6 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="Buscar por 1200W, 800W, reflector 300W..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/15 bg-white/10 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-white/50 focus:border-solar focus:outline-none focus:ring-1 focus:ring-solar transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <ArrowUpDown aria-hidden="true" className="h-4 w-4 text-solar" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Ordenar productos"
                className="pressable rounded-full border border-white/15 bg-black/60 py-2 px-3.5 text-xs text-white focus:border-solar focus:outline-none cursor-pointer font-medium"
              >
                <option value="featured" className="bg-forest">Destacados</option>
                <option value="price-asc" className="bg-forest">Precio: Menor a Mayor</option>
                <option value="price-desc" className="bg-forest">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`pressable rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
                  selectedCategory === cat.id
                    ? "bg-solar text-solar-foreground shadow-md font-bold scale-102"
                    : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-white/70 hidden sm:inline font-mono">
              3 modelos disponibles con despacho a todo Panamá
            </span>
          </div>
        </div>

        {/* Product Cards Grid - 3 columns */}
        {filteredProducts.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : selectedCategory === "muebles" || selectedCategory === "accesorios" ? (
          <div className="rounded-3xl border border-solar/30 bg-black/45 p-8 sm:p-12 text-center backdrop-blur-xl max-w-2xl mx-auto space-y-4 shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-solar/15 text-solar">
              {selectedCategory === "muebles" ? (
                <Armchair aria-hidden="true" className="h-8 w-8" />
              ) : (
                <Sparkles aria-hidden="true" className="h-8 w-8" />
              )}
            </div>
            <span className="inline-block rounded-full bg-solar/20 text-solar px-4 py-1 text-xs font-bold uppercase tracking-wider font-mono">
              Colección Hogar 2026 • En Preparación
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              {selectedCategory === "muebles"
                ? "Línea de Muebles & Terrazas para el Hogar"
                : "Accesorios, Confort & Decoración del Hogar"}
            </h3>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-lg mx-auto">
              {selectedCategory === "muebles"
                ? "Estamos preparando un catálogo exclusivo de salas, comedores de terraza y mobiliario exterior e interior diseñado para el clima y la calidez de los hogares panameños."
                : "Pronto podrás adquirir y cotizar complementos, organizadores y piezas de diseño seleccionadas para darle vida a cada ambiente de tu casa."}
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`https://wa.me/50769893055?text=${encodeURIComponent(
                  selectedCategory === "muebles"
                    ? "Hola Solar y Hogar, quisiera consultar sobre su proxima linea de muebles para el hogar y terraza."
                    : "Hola Solar y Hogar, quisiera consultar sobre su proxima linea de accesorios de hogar."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pressable inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-xs font-bold shadow-lg transition-all cursor-pointer"
              >
                <MessageCircle aria-hidden="true" className="h-4 w-4" />
                <span>Consultar por WhatsApp (6989-3055)</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="pressable rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white px-6 py-3 text-xs font-semibold cursor-pointer transition-colors"
              >
                Ver Lámparas Solares Disponibles
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-black/35 p-12 text-center backdrop-blur-md">
            <Sparkles aria-hidden="true" className="mx-auto h-12 w-12 text-solar/60 mb-3" />
            <h3 className="text-xl font-bold text-white font-serif">No encontramos productos</h3>
            <p className="mt-1 text-sm text-white/70">
              Prueba seleccionando "Todo el Catálogo" o limpiando el texto de búsqueda.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="pressable mt-5 rounded-full bg-solar px-6 py-2.5 text-xs font-bold text-solar-foreground cursor-pointer shadow-md"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
