import React from "react";
import {
  X,
  FileText,
  Trash2,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  Truck,
} from "lucide-react";
import { useCart } from "../context/CartContext";

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    total,
    subtotal,
    setIsCheckoutOpen,
    setIsQuotationOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const handleWhatsAppCheckout = () => {
    const itemsList = items
      .map(
        (i) =>
          `- ${i.quantity}x ${i.product.name} ($${i.product.price.toFixed(2)} c/u) = $${(
            i.product.price * i.quantity
          ).toFixed(2)}`
      )
      .join("\n");

    const message = `*CONSULTA DE PEDIDO - SOLAR Y HOGAR PANAMA*
Hola equipo de Solar y Hogar, me gustaria pedir las siguientes lamparas solares:

${itemsList}

*Subtotal de productos:* $${total.toFixed(2)} USD
*Envio:* Transporte Ferguson / Uno Express (retiro en sucursal) o Servientrega (puerta a puerta o sucursal)

Me confirman disponibilidad y los datos para coordinar el envio? Muchas gracias.`;

    window.open(`https://wa.me/50769893055?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsCartOpen(false)}
      />

      <aside
        className="absolute inset-y-0 right-0 flex max-w-full pl-10 animate-in slide-in-from-right duration-300"
        aria-label="Carrito de compras"
      >
        <div className="flex w-screen max-w-md flex-col bg-background shadow-2xl border-l border-border">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4 sm:p-5 bg-card">
            <div className="flex items-center gap-2">
              <ShoppingBag aria-hidden="true" className="h-5 w-5 text-solar" />
              <h2 className="font-serif text-lg font-bold text-foreground">Tu Carrito Solar y Hogar</h2>
              <span className="rounded-full bg-solar/20 px-2 py-0.5 text-xs font-bold text-solar-foreground">
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-secondary cursor-pointer"
              aria-label="Cerrar carrito"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nationwide Shipping Banner (Free Shipping Removed) */}
          <div className="border-b border-border bg-solar/10 p-3.5 text-xs text-foreground">
            <p className="flex items-start gap-2 font-medium leading-relaxed">
              <Truck aria-hidden="true" className="h-4 w-4 text-solar shrink-0 mt-0.5" />
              <span>
                <strong className="text-solar font-bold">Despachos a todo Panamá:</strong> Retiro en sucursal (Ferguson / Uno Express / Servientrega) o entrega puerta a puerta (exclusivo con Servientrega).
              </span>
            </p>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground py-12">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-4">
                  <ShoppingBag aria-hidden="true" className="h-9 w-9 text-solar" />
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground">Tu carrito está vacío</h3>
                <p className="mt-1 text-xs max-w-xs leading-relaxed">
                  Descubre nuestra colección de lámparas solares autónomas y dale luz a tu propiedad sin cables.
                </p>
                <div className="flex flex-col gap-2 mt-5 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition-all hover:scale-102 cursor-pointer"
                  >
                    Ver Catálogo de Lámparas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsQuotationOpen(true);
                    }}
                    className="rounded-full border border-solar/40 bg-solar/15 hover:bg-solar hover:text-solar-foreground px-6 py-2.5 text-xs font-bold text-foreground transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FileText aria-hidden="true" className="h-3.5 w-3.5 text-solar" />
                    <span>Abrir Cotizador Oficial (PDF)</span>
                  </button>
                </div>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-3 shadow-sm transition-all hover:border-solar/40"
                >
                  {/* Thumbnail */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-20 w-20 rounded-xl object-cover bg-black/30 shrink-0"
                  />

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between overflow-hidden">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">{product.name}</h4>
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer"
                        aria-label={`Eliminar ${product.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">${product.price.toFixed(2)} USD c/u</p>

                    {/* Quantity and Line Total */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-border bg-background">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="flex h-6 w-6 items-center justify-center text-xs font-bold text-foreground hover:bg-secondary rounded-full cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-semibold">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="flex h-6 w-6 items-center justify-center text-xs font-bold text-foreground hover:bg-secondary rounded-full cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold text-solar text-sm">${(product.price * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Checkout */}
          {items.length > 0 && (
            <div className="border-t border-border bg-card/60 p-4 sm:p-5 backdrop-blur-md space-y-4">
              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal de lámparas</span>
                  <span>${subtotal.toFixed(2)} USD</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Costo de envío</span>
                  <span>Según tarifa de encomienda</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-foreground pt-2 border-t border-border">
                  <span>Total en productos</span>
                  <span className="text-solar">${total.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/95 transition-all hover:scale-101 cursor-pointer"
                >
                  <span>Generar Orden de Despacho</span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </button>

                {/* BOTON OFICIAL DE GENERAR COTIZACION EN PDF */}
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsQuotationOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-primary/30 bg-card hover:bg-secondary text-foreground hover:border-solar px-5 py-2.5 text-xs font-bold shadow-sm transition-all hover:scale-101 cursor-pointer"
                >
                  <FileText aria-hidden="true" className="h-4 w-4 text-solar" />
                  <span>Generar Cotización en PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppCheckout}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition-all cursor-pointer"
                >
                  <MessageCircle aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>Consultar por WhatsApp al instante</span>
                </button>
              </div>

              <div className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground pt-1 text-center">
                <div className="flex items-center gap-1.5">
                  <Truck aria-hidden="true" className="h-3.5 w-3.5 text-solar" />
                  <span>Despachos a todo Panamá vía Ferguson, Uno Express y Servientrega</span>
                </div>
                <span>Pagos por Yappy (Banco General) o Transferencia Bancaria ACH</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
