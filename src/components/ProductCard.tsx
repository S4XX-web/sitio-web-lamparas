import React, { useState } from "react";
import { Star, ShoppingBag, Zap, BatteryCharging, Shield, ArrowUpRight, FileText } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Product } from "../types/store";
import { useCart } from "../context/CartContext";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, setIsQuotationOpen } = useCart();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <article className="spring-card group relative flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card text-card-foreground shadow-sm">
      {/* Image & Interactive Carousel Preview Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
        <Link
          to="/producto/$productId"
          params={{ productId: product.id }}
          className="block h-full w-full cursor-pointer"
        >
          <img
            src={images[currentImgIndex]}
            alt={`${product.name} - Vista ${currentImgIndex + 1}`}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Ambient Gradient Overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {product.badge ? (
            <span className="glass-chip rounded-full px-3 py-1 text-[11px] font-bold text-solar-foreground shadow-sm backdrop-blur-md">
              {product.badge}
            </span>
          ) : (
            <span />
          )}

          <span className="rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
            Disponible
          </span>
        </div>

        {/* Thumbnail Dots Bar */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImgIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentImgIndex === idx ? "w-4 bg-solar" : "w-1.5 bg-white/50 hover:bg-white"
                }`}
                aria-label={`Ver imagen ${idx + 1} de ${product.name}`}
              />
            ))}
          </div>
        )}

        {/* Direct Link to Product Detail Page */}
        <Link
          to="/producto/$productId"
          params={{ productId: product.id }}
          aria-label={`Ver página completa de ${product.name}`}
          className="pressable absolute bottom-3 right-3 flex h-8.5 w-8.5 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-solar hover:text-solar-foreground shadow-md cursor-pointer transition-colors z-10"
          title="Ver página con galería y especificaciones completas"
        >
          <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>

      {/* Card Content & Action Bar */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Quick Specs Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[10px] font-semibold">
            <span className="inline-flex items-center gap-1 rounded-md bg-solar/15 text-solar px-2 py-0.5 font-mono">
              <Zap aria-hidden="true" className="h-3 w-3" />
              {product.lumens}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 font-mono">
              <BatteryCharging aria-hidden="true" className="h-3 w-3" />
              {product.batteryLife}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary text-foreground px-2 py-0.5 font-mono ml-auto">
              <Shield aria-hidden="true" className="h-3 w-3 text-solar" />
              {product.waterproof}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
            <Star aria-hidden="true" className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-foreground font-mono">{product.rating.toFixed(1)}</span>
            <span>({product.reviewsCount} reseñas verificadas)</span>
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-lg font-bold text-foreground transition-colors group-hover:text-solar line-clamp-1">
            <Link
              to="/producto/$productId"
              params={{ productId: product.id }}
              className="hover:underline cursor-pointer"
            >
              {product.name}
            </Link>
          </h3>

          {/* Tagline */}
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>
        </div>

        {/* Pricing & Cart Action */}
        <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-solar font-serif">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">USD</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Despachos a todo Panamá
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                addItem(product, 1);
                setIsQuotationOpen(true);
              }}
              aria-label={`Cotizar ${product.name} en PDF`}
              className="pressable rounded-full border border-solar/40 bg-solar/10 hover:bg-solar hover:text-solar-foreground px-2.5 py-1.5 text-xs font-bold text-foreground cursor-pointer flex items-center gap-1 shadow-xs transition-colors"
              title="Abrir cotizador oficial con este modelo"
            >
              <FileText aria-hidden="true" className="h-3.5 w-3.5 text-solar group-hover:text-inherit" />
              <span>Cotizar</span>
            </button>

            <button
              type="button"
              onClick={() => addItem(product, 1)}
              aria-label={`Añadir ${product.name} al carrito`}
              className="pressable flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/95 cursor-pointer"
            >
              <ShoppingBag aria-hidden="true" className="h-3.5 w-3.5" />
              <span>Añadir</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
