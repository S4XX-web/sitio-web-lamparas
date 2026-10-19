import React, { useState } from "react";
import { X, ShoppingBag, ShieldCheck, Zap, BatteryCharging, Check, MessageCircle, FileText, Package } from "lucide-react";
import { useCart } from "../context/CartContext";
import { isSolarProduct, getDepartmentLabel } from "../utils/productUtils";

export const ProductQuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addItem, setIsQuotationOpen } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const isSolar = isSolarProduct(quickViewProduct);

  const handleAddToCart = () => {
    addItem(quickViewProduct, quantity);
    setQuickViewProduct(null);
  };

  const handleQuotationDirect = () => {
    addItem(quickViewProduct, quantity);
    setQuickViewProduct(null);
    setIsQuotationOpen(true);
  };

  const handleWhatsAppInstant = () => {
    const itemType = isSolar ? "LAMPARA SOLAR" : "ARTICULO";
    const message = `*CONSULTA DE ${itemType} - SOLAR Y HOGAR PANAMA*
Hola equipo de Solar y Hogar, me gustaria ordenar directamente:
- Modelo: ${quickViewProduct.name}
- Cantidad: ${quantity} unidad(es)
- Subtotal: $${(quickViewProduct.price * quantity).toFixed(2)} USD
- Envio: Transporte Ferguson / Uno Express (sucursal) o Servientrega (puerta a puerta o sucursal)

Me confirman disponibilidad para coordinar el despacho? Muchas gracias.`;
    window.open(`https://wa.me/50769893055?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-background border border-border shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto md:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
          aria-label="Cerrar ventana de detalles"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image Side */}
          <div className="relative aspect-[16/9] sm:aspect-square md:aspect-auto md:h-full bg-black shrink-0">
            <img
              src={quickViewProduct.image}
              alt={quickViewProduct.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5">
              {quickViewProduct.badge && (
                <span className="rounded-full bg-solar px-3 py-1 text-[11px] sm:text-xs font-bold text-solar-foreground shadow">
                  {quickViewProduct.badge}
                </span>
              )}
            </div>

            {/* Quick specs chips: Solo para lámparas solares */}
            {isSolar ? (
              (quickViewProduct.lumens || quickViewProduct.batteryLife || quickViewProduct.waterproof) && (
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex flex-wrap gap-1.5 text-xs text-white">
                  {quickViewProduct.lumens && (
                    <span className="flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[11px]">
                      <Zap aria-hidden="true" className="h-3 w-3 text-solar" />
                      {quickViewProduct.lumens}
                    </span>
                  )}
                  {quickViewProduct.batteryLife && (
                    <span className="flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[11px]">
                      <BatteryCharging aria-hidden="true" className="h-3 w-3 text-emerald-400" />
                      {quickViewProduct.batteryLife}
                    </span>
                  )}
                  {quickViewProduct.waterproof && (
                    <span className="flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[11px]">
                      <ShieldCheck aria-hidden="true" className="h-3 w-3 text-blue-400" />
                      {quickViewProduct.waterproof}
                    </span>
                  )}
                </div>
              )
            ) : (
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex flex-wrap gap-1.5 text-xs text-white">
                <span className="flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[11px]">
                  <Package aria-hidden="true" className="h-3 w-3 text-solar" />
                  {getDepartmentLabel(quickViewProduct.department)}
                </span>
                {quickViewProduct.material && (
                  <span className="flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[11px]">
                    {quickViewProduct.material}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Details & Actions Side */}
          <div className="flex flex-col justify-between p-4 sm:p-6 md:p-8 md:max-h-[85vh] md:overflow-y-auto">
            <div>
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
                    <Check aria-hidden="true" className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
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
                  className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition-all hover:scale-102 cursor-pointer"
                >
                  <ShoppingBag aria-hidden="true" className="h-4 w-4" />
                  <span>Añadir al Carrito</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppInstant}
                  className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow hover:bg-emerald-700 transition-all hover:scale-102 cursor-pointer"
                >
                  <MessageCircle aria-hidden="true" className="h-4 w-4" />
                  <span>Pedir por WhatsApp</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleQuotationDirect}
                className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-solar/40 bg-solar/10 hover:bg-solar hover:text-solar-foreground text-foreground px-4 py-2.5 text-xs font-bold transition-all cursor-pointer"
              >
                <FileText aria-hidden="true" className="h-3.5 w-3.5 text-solar group-hover:text-inherit" />
                <span>Generar Cotización en PDF de este modelo</span>
              </button>

              <p className="text-center text-[10px] text-muted-foreground">
                Garantía de calidad • Despachos a todo Panamá
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
