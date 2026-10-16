import React, { useState } from "react";
import { X, Star, ShoppingBag, ShieldCheck, Zap, BatteryCharging, Check, MessageCircle } from "lucide-react";
import { useCart } from "../context/CartContext";

export const ProductQuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addItem, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const handleAddToCart = () => {
    addItem(quickViewProduct, quantity);
    setQuickViewProduct(null);
  };

    const handleWhatsAppInstant = () => {
    const message = `*CONSULTA DE LAMPARA - SOLAR Y HOGAR PANAMA*
Hola equipo de Solar y Hogar, me gustaria ordenar directamente la siguiente lampara:
- Modelo: ${quickViewProduct.name}
- Cantidad: ${quantity} unidad(es)
- Total: $${(quickViewProduct.price * quantity).toFixed(2)} USD
- Envio: Transporte Ferguson / Uno Express / Servientrega (~1 dia habil)

Me confirman disponibilidad para despacho hoy? Muchas gracias.`;
    window.open(`https://wa.me/50769893055?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-background border border-border shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          aria-label="Cerrar ventana de detalles"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image Side */}
          <div className="relative aspect-square md:aspect-auto h-full bg-black">
            <img
              src={quickViewProduct.image}
              alt={quickViewProduct.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {quickViewProduct.badge && (
                <span className="rounded-full bg-solar px-3 py-1 text-xs font-bold text-solar-foreground shadow">
                  {quickViewProduct.badge}
                </span>
              )}
            </div>
            {/* Quick specs chips */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 text-xs text-white">
              <span className="flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1">
                <Zap className="h-3.5 w-3.5 text-solar" />
                {quickViewProduct.lumens}
              </span>
              <span className="flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1">
                <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" />
                {quickViewProduct.batteryLife}
              </span>
              <span className="flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                {quickViewProduct.waterproof}
              </span>
            </div>
          </div>

          {/* Details & Actions Side */}
          <div className="flex flex-col justify-between p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
            <div>
              {/* Rating */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <div className="flex items-center text-amber-500">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400" />
                </div>
                <span className="font-bold text-foreground">{quickViewProduct.rating}</span>
                <span>({quickViewProduct.reviewsCount} opiniones verificadas)</span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl font-bold text-foreground">
                {quickViewProduct.name}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground font-medium">
                {quickViewProduct.tagline}
              </p>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-solar font-serif">
                  ${quickViewProduct.price.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">USD</span>
              </div>

              {/* Description */}
              <p className="mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {quickViewProduct.description}
              </p>

              {/* Key Features Bullets */}
              <div className="mt-4 space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Características clave:
                </p>
                {quickViewProduct.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-foreground/80">
                    <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="mt-6 pt-5 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Cantidad:</span>
                <div className="flex items-center rounded-full border border-border bg-card">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-secondary font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-secondary font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition-all hover:scale-102"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Añadir al Carrito</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppInstant}
                  className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow hover:bg-emerald-700 transition-all hover:scale-102"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Pedir por WhatsApp</span>
                </button>
              </div>

              <p className="text-center text-[10px] text-muted-foreground">
                Garantía de calidad • Envíos en ~1 día hábil a todo Panamá
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
