import React, { useState, useMemo } from "react";
import { Search, Sparkles, Sun, ArrowUpDown, SlidersHorizontal, X, Zap } from "lucide-react";
import { PRODUCTS } from "../data/products";
import { ProductCard } from "./ProductCard";

export const ProductCatalog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");

  const categories = [
    { id: "all", label: "Colección Completa (3)" },
    { id: "potencia", label: "Alta Potencia (1200W / Reflector 300W)" },
    { id: "pared", label: "Fachadas y Muros (800W)" },
  ];

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.lumens.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <section id="catalogo" className="relative overflow-hidden bg-forest/95 text-white py-24 px-4 sm:px-6 transition-colors duration-500">
      {/* Ambient Lighting Orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-leaf/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 -right-32 h-[30rem] w-[30rem] rounded-full bg-solar/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-solar-foreground shadow-sm">
            <Sun className="h-4 w-4" />
            Luminarias Oficiales en Panamá
          </span>
          <h2 className="mt-4 font-serif text-3xl font-extrabold text-white sm:text-5xl tracking-tight">
            Colección Solar Insignia 2026
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-white/85 leading-relaxed">
            3 modelos de alta potencia fotovoltaica probados bajo el calor y los aguaceros del trópico panameño. Cero cables, cero facturas de luz y encendido automático.
          </p>
        </div>

        {/* Filter and Search Bar Controls */}
        <div className="mb-10 flex flex-col gap-4 rounded-3xl bg-black/40 p-4 sm:p-6 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="Buscar por 1200w, 800w, reflector 300w..."
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
              <ArrowUpDown className="h-4 w-4 text-solar" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Ordenar productos"
                className="pressable rounded-full border border-white/15 bg-black/60 py-2 px-3.5 text-xs text-white focus:border-solar focus:outline-none cursor-pointer font-medium"
              >
                <option value="featured" className="bg-forest">Destacados</option>
                <option value="price-asc" className="bg-forest">Precio: Menor a Mayor</option>
                <option value="price-desc" className="bg-forest">Precio: Mayor a Menor</option>
                <option value="rating" className="bg-forest">Mejor Calificación</option>
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
              3 modelos listos para despacho en 24h
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
        ) : (
          <div className="rounded-3xl border border-white/10 bg-black/35 p-12 text-center backdrop-blur-md">
            <Sparkles className="mx-auto h-12 w-12 text-solar/60 mb-3" />
            <h3 className="text-xl font-bold text-white font-serif">No encontramos productos</h3>
            <p className="mt-1 text-sm text-white/70">
              Prueba seleccionando "Colección Completa" o limpiando el texto de búsqueda.
            </p>
            <button
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
