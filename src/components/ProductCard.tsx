import React, { useState } from "react";
import { ShoppingBag, Zap, BatteryCharging, Shield, ArrowUpRight, FileText, Package } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Product } from "../types/store";
import { useCart } from "../context/CartContext";
import { isSolarProduct, getDepartmentLabel, formatProductName } from "../utils/productUtils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = "" }) => {
  const { addItem, setIsQuotationOpen } = useCart();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const isSolar = isSolarProduct(product);
  const displayName = formatProductName(product.name);

  return (
    <article className={`spring-card group relative flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card text-card-foreground shadow-sm ${className}`}>
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

          <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
            Disponible
          </span>
        </div>

        {/* Thumbnail Dots Bar */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-black/50 px-1.5 backdrop-blur-sm">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImgIndex(idx);
                }}
                className="flex h-7 w-7 items-center justify-center cursor-pointer"
                aria-label={`Ver imagen ${idx + 1} de ${product.name}`}
                aria-current={currentImgIndex === idx}
              >
                <span
                  className={`h-1.5 rounded-full transition-all ${
                    currentImgIndex === idx ? "w-4 bg-solar" : "w-1.5 bg-white/50"
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {/* Direct Link to Product Detail Page */}
        <Link
          to="/producto/$productId"
          params={{ productId: product.id }}
          aria-label={`Ver página completa de ${product.name}`}
          className="pressable absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-solar hover:text-solar-foreground shadow-md cursor-pointer transition-colors z-10"
          title="Ver página con galería y especificaciones completas"
        >
          <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>

      {/* Card Content & Action Bar */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {/* Quick Specs Badges: EXCLUSIVO PARA LAMPARAS SOLARES */}
          {isSolar ? (
            (product.lumens || product.batteryLife || product.waterproof) && (
              <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px] font-semibold">
                {product.lumens && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-solar/15 text-solar-ink px-2 py-0.5 font-mono">
                    <Zap aria-hidden="true" className="h-3 w-3" />
                    {product.lumens}
                  </span>
                )}
                {product.batteryLife && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 font-mono">
                    <BatteryCharging aria-hidden="true" className="h-3 w-3" />
                    {product.batteryLife}
                  </span>
                )}
                {product.waterproof && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-secondary text-foreground px-2 py-0.5 font-mono ml-auto">
                    <Shield aria-hidden="true" className="h-3 w-3 text-solar-ink" />
                    {product.waterproof}
                  </span>
                )}
              </div>
            )
          ) : (
            /* Badges para Muebles, Hogar y Accesorios (Sin Watts ni Batería) */
            <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px] font-semibold">
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-0.5">
                <Package aria-hidden="true" className="h-3 w-3" />
                {getDepartmentLabel(product.department)}
              </span>
              {product.material && (
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary text-foreground px-2 py-0.5">
                  {product.material}
                </span>
              )}
              {product.waterproof && (
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary text-foreground px-2 py-0.5 ml-auto">
                  {product.waterproof}
                </span>
              )}
            </div>
          )}

          {/* Product Title */}
          <h3
            className="font-serif text-base sm:text-lg font-bold text-foreground transition-colors group-hover:text-solar-ink line-clamp-2"
            title={product.name}
          >
            <Link
              to="/producto/$productId"
              params={{ productId: product.id }}
              className="hover:underline cursor-pointer"
            >
              {displayName}
            </Link>
          </h3>

          {/* Tagline */}
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>
        </div>

        {/* Pricing & Cart Action */}
        <div className="mt-4 sm:mt-5 flex items-end justify-between border-t border-border/70 pt-3 sm:pt-4 gap-2">
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-extrabold text-solar-ink font-serif">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-[11px] sm:text-xs text-muted-foreground font-semibold">USD</span>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold truncate">
              Despachos a todo Panamá
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                addItem(product, 1);
                setIsQuotationOpen(true);
              }}
              aria-label={`Cotizar ${product.name} en PDF`}
              className="pressable inline-flex h-11 sm:h-10 items-center justify-center gap-1 rounded-full border border-border bg-transparent px-2.5 text-xs font-bold text-muted-foreground hover:border-solar/60 hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
              title="Abrir cotizador oficial con este modelo"
            >
              <FileText aria-hidden="true" className="h-3.5 w-3.5" />
              <span>Cotizar</span>
            </button>

            <button
              type="button"
              onClick={() => addItem(product, 1)}
              aria-label={`Añadir ${product.name} al carrito`}
              className="pressable inline-flex h-11 sm:h-10 items-center gap-1 rounded-full bg-primary px-3.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/95 cursor-pointer"
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
