import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Truck,
  Smartphone,
  Building2,
    MessageCircle,
  MapPin,
  User,
  CreditCard,
  ArrowRight,
  Info,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { ShippingCarrier } from "../types/store";

// Numero de WhatsApp oficial para recibir pedidos en Panamá (codigo +507)
const WHATSAPP_PHONE = "50769893055";

const PROVINCES = [
  "Panamá (Ciudad / Centro / Este / Norte)",
  "Panamá Oeste (La Chorrera, Arraijan, Capira)",
  "Chiriqui (David, Boquete, Bugaba, Volcan)",
  "Cocle (Penonome, Aguadulce, Anton)",
  "Veraguas (Santiago, Sona)",
  "Herrera (Chitre, Pese)",
  "Los Santos (Las Tablas, Pedasi)",
  "Colon",
  "Bocas del Toro",
  "Darien",
];

const CARRIERS: {
  id: ShippingCarrier;
  name: string;
  badge: string;
  time: string;
  description: string;
  coverage: string;
}[] = [
  {
    id: "ferguson",
    name: "Transporte Ferguson",
    badge: "Centrales y Chiriqui",
    time: "~1 dia habil (24h)",
    description: "Retiro en sucursal / agencia Ferguson",
    coverage: "Lider para Cocle, Veraguas, Herrera, Los Santos y Chiriqui",
  },
  {
    id: "uno_express",
    name: "Uno Express Panamá",
    badge: "Red Nacional",
    time: "~1 dia habil (24h)",
    description: "Retiro con cedula en sucursal Uno Express o a domicilio",
    coverage: "Sucursales en todas las cabeceras de provincia",
  },
  {
    id: "servientrega",
    name: "Servientrega Panamá",
    badge: "Puerta a Puerta",
    time: "~1 dia habil (24h)",
    description: "Centros de soluciones y entregas a domicilio",
    coverage: "Cobertura nacional amplia en todo el territorio",
  },
];

export const CheckoutModal: React.FC = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, items, total, discount, clearCart } = useCart();

  const [step, setStep] = useState<"form" | "confirmed">("form");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [savedOrderItems, setSavedOrderItems] = useState(items);
  const [savedTotal, setSavedTotal] = useState(total);
  const [savedDiscount, setSavedDiscount] = useState(discount);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    idNumber: "",
    province: PROVINCES[0],
    cityOrDistrict: "",
    carrier: "uno_express" as ShippingCarrier,
    branchOrAddress: "",
    paymentPreference: "yappy" as "yappy" | "ach",
    notes: "",
  });

  if (!isCheckoutOpen) return null;

  const selectedCarrierObj = CARRIERS.find((c) => c.id === formData.carrier) || CARRIERS[0];

  // Mensaje para WhatsApp sin emojis (para evitar signos de interrogacion en WhatsApp Web o movil)
  const buildWhatsAppMessage = (
    orderNum: string,
    currentItems = savedOrderItems,
    currentTotal = savedTotal,
    currentDiscount = savedDiscount
  ) => {
    const carrierName = selectedCarrierObj.name;
    const paymentLabel =
      formData.paymentPreference === "yappy"
        ? "Yappy (Banco General)"
        : "Transferencia Bancaria ACH (Cualquier Banco)";

    const itemsList = currentItems
      .map(
        (i) =>
          `- ${i.quantity}x ${i.product.name} ($${i.product.price.toFixed(2)} c/u) = $${(
            i.product.price * i.quantity
          ).toFixed(2)}`
      )
      .join("\n");

    const message = `*NUEVA ORDEN DE PEDIDO - SOLAR Y HOGAR PANAMA*
*Orden No.:* ${orderNum}
----------------------------------------
*DATOS DE ENVIO*
- Cliente: ${formData.fullName}
- Telefono: ${formData.phone}
- Cedula: ${formData.idNumber || "Por coordinar"}
- Provincia: ${formData.province}
- Distrito / Ciudad: ${formData.cityOrDistrict}
- Transporte: ${carrierName} (Tiempo: ~1 dia habil)
- Sucursal o Direccion: ${formData.branchOrAddress}
- Metodo de Pago: ${paymentLabel}
${formData.notes ? `- Notas: ${formData.notes}\n` : ""}----------------------------------------
*LAMPARAS SELECCIONADAS*
${itemsList}

*TOTAL A PAGAR:* $${currentTotal.toFixed(2)} USD
----------------------------------------
Hola equipo de Solar y Hogar, ya genere mi orden desde la pagina web. Quedo atento a la confirmacion de datos para coordinar el envio. Muchas gracias.`;

    return message;
  };

  const handleOpenWhatsApp = (orderNum = orderNumber) => {
    const text = encodeURIComponent(buildWhatsAppMessage(orderNum));
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${text}`, "_blank");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.cityOrDistrict || !formData.branchOrAddress) {
      toast.error("Por favor completa los campos de contacto y entrega");
      return;
    }

    const generatedOrder = `SOL-PTY-${Math.floor(10000 + Math.random() * 90000)}`;
    setOrderNumber(generatedOrder);
    setSavedOrderItems([...items]);
    setSavedTotal(total);
    setSavedDiscount(discount);
    setStep("confirmed");
    clearCart();
    toast.success("¡Orden generada con éxito! Toca el botón para enviarla por WhatsApp.");

    handleOpenWhatsApp(generatedOrder);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep("form");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-background border border-border shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 sm:p-6 bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-solar text-solar-foreground font-bold shadow-md">
              {step === "form" ? "PTY" : "✓"}
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                {step === "form" ? "Generar Orden de Pedido" : "¡Orden Generada con Éxito!"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {step === "form"
                  ? "Envíos a todo Panamá por Ferguson, Uno Express y Servientrega"
                  : `Orden ${orderNumber} lista para coordinar con Solar y Hogar`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {step === "form" ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Quick Summary */}
              <div className="rounded-2xl border border-border bg-sand/60 p-4">
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                  <span className="font-semibold text-foreground">
                    Lámparas en tu orden ({items.length} modelo{items.length > 1 ? "s" : ""}):
                  </span>
                  <span className="font-bold text-solar text-sm">${total.toFixed(2)} USD</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {items.map((i) => (
                    <span
                      key={i.product.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 font-medium border border-border text-foreground shadow-xs"
                    >
                      <strong className="text-solar">{i.quantity}x</strong> {i.product.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notice for growing company */}
              <div className="flex items-start gap-2.5 rounded-2xl bg-solar/10 border border-solar/30 p-3 text-xs text-foreground">
                <Info className="h-4 w-4 text-solar shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px] sm:text-xs">
                  <strong>Compra directa sin pasarelas de pago:</strong> Llena tus datos para generar la orden oficial.
                  Al presionar el botón se te dirigirá directamente a WhatsApp con todos los datos listos para coordinar el despacho.
                </p>
              </div>

              {/* 1. Customer Identification */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-solar" />
                  1. Datos del Cliente
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-1">
                    <label className="text-xs font-semibold text-foreground">Nombre y Apellido *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Mendoza"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:border-solar focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="text-xs font-semibold text-foreground">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 6500-1234"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:border-solar focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="text-xs font-semibold text-foreground">Cédula o Pasaporte</label>
                    <input
                      type="text"
                      placeholder="Ej. 8-123-456"
                      value={formData.idNumber}
                      onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:border-solar focus:outline-none"
                    />
                    <span className="text-[10px] text-muted-foreground">Requerido para retirar encomienda</span>
                  </div>
                </div>
              </div>

              {/* 2. Destination Province */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-solar" />
                  2. Destino en Panamá
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground">Provincia de Entrega *</label>
                    <select
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground focus:border-solar focus:outline-none"
                    >
                      {PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">Ciudad / Distrito / Corregimiento *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. David Centro, Chitré, San Francisco, Penonomé..."
                      value={formData.cityOrDistrict}
                      onChange={(e) => setFormData({ ...formData, cityOrDistrict: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:border-solar focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Shipping Carrier Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-solar" />
                    3. Empresa de Encomienda (Demora ~1 Día Hábil)
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Entrega en 24h
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CARRIERS.map((c) => {
                    const isSelected = formData.carrier === c.id;
                    return (
                      <label
                        key={c.id}
                        className={`relative flex flex-col p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-solar bg-solar/10 shadow-sm ring-1 ring-solar/50"
                            : "border-border bg-card hover:bg-secondary/60"
                        }`}
                      >
                        <input
                          type="radio"
                          name="carrier"
                          checked={isSelected}
                          onChange={() => setFormData({ ...formData, carrier: c.id })}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-foreground">{c.name}</span>
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold text-secondary-foreground">
                            {c.badge}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-solar mb-1">{c.time}</span>
                        <p className="text-[10px] text-muted-foreground leading-tight">{c.description}</p>
                      </label>
                    );
                  })}
                </div>

                <div className="mt-3">
                  <label className="text-xs font-semibold text-foreground">
                    Sucursal de Retiro o Dirección de Entrega *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sucursal Uno Express David Centro / Sucursal Ferguson Chitré / Casa #45 Calle 3ra"
                    value={formData.branchOrAddress}
                    onChange={(e) => setFormData({ ...formData, branchOrAddress: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:border-solar focus:outline-none"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Indica si retiras en sucursal de la agencia o si requieres entrega en dirección específica.
                  </span>
                </div>
              </div>

              {/* 4. Payment Preference */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-solar" />
                  4. Preferencia de Pago
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                      formData.paymentPreference === "yappy"
                        ? "border-solar bg-solar/10 font-bold shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentPreference === "yappy"}
                      onChange={() => setFormData({ ...formData, paymentPreference: "yappy" })}
                      className="sr-only"
                    />
                    <Smartphone className="h-5 w-5 mb-1 text-solar" />
                    <span className="text-xs text-foreground">Yappy</span>
                    <span className="text-[10px] text-muted-foreground">Banco General</span>
                  </label>

                  <label
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                      formData.paymentPreference === "ach"
                        ? "border-solar bg-solar/10 font-bold shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentPreference === "ach"}
                      onChange={() => setFormData({ ...formData, paymentPreference: "ach" })}
                      className="sr-only"
                    />
                    <Building2 className="h-5 w-5 mb-1 text-primary" />
                    <span className="text-xs text-foreground">Transferencia ACH</span>
                    <span className="text-[10px] text-muted-foreground">Cualquier banco</span>
                  </label>
                </div>
              </div>

              {/* 5. Additional Notes */}
              <div>
                <label className="text-xs font-semibold text-foreground">Comentarios o notas (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. 'Llamar antes de entregar' o 'Retiro en la tarde'"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:border-solar focus:outline-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 text-sm sm:text-base font-extrabold shadow-lg hover:shadow-xl transition-all hover:scale-101 cursor-pointer"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Generar Orden y Enviar a WhatsApp • ${total.toFixed(2)} USD</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Al presionar se creará tu orden oficial y se abrirá WhatsApp con el pedido listo.
                </p>
              </div>
            </form>
          ) : (
            /* Order Confirmed Screen - PANTALLA CON UN SOLO BOTON DIRECTO A WHATSAPP */
            <div className="space-y-6 animate-in zoom-in-95">
              {/* Top Banner */}
              <div className="flex flex-col items-center text-center p-4 sm:p-6 rounded-3xl bg-solar/10 border border-solar/30 space-y-2.5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg animate-bounce">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-solar px-3.5 py-1 text-xs font-extrabold text-solar-foreground">
                  ORDEN No.: {orderNumber}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                  ¡¡Tu Pedido está Listo!
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                  Hola <strong>{formData.fullName}</strong>, tu orden para entrega via{" "}
                  <strong>{selectedCarrierObj.name}</strong> esta armada.
                </p>
              </div>

              {/* Quick Summary of items and destination */}
              <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground">Destino de Entrega:</span>
                  <span className="font-bold text-foreground">
                    {formData.province} - {formData.cityOrDistrict}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground">Transporte:</span>
                  <span className="font-bold text-foreground">
                    {selectedCarrierObj.name} (~1 dia habil)
                  </span>
                </div>

                <div className="space-y-1.5 py-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Resumen de lamparas:
                  </span>
                  {savedOrderItems.map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between text-muted-foreground">
                      <span>
                        - {quantity}x {product.name}
                      </span>
                      <span className="font-semibold text-foreground">
                        ${(product.price * quantity).toFixed(2)} USD
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border text-base font-extrabold text-foreground">
                  <span>Total a Pagar:</span>
                  <span className="text-solar text-xl font-bold">${savedTotal.toFixed(2)} USD</span>
                </div>
              </div>

              {/* UN SOLO BOTON PRINCIPAL: DIRECTO A WHATSAPP */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenWhatsApp()}
                  className="w-full flex items-center justify-center gap-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 text-sm sm:text-base font-extrabold shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <MessageCircle className="h-6 w-6" />
                  <span>Enviar Orden Directo a WhatsApp</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                <p className="mt-2.5 text-center text-xs text-muted-foreground">
                  Toca el boton para enviar los detalles de tu orden a Solar y Hogar y coordinar el envio.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
