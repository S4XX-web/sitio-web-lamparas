import React, { useState } from "react";
import {
  X,
  FileText,
  Download,
  Printer,
  MessageCircle,
  User,
  Plus,
  Minus,
  Sparkles,
  Trash2,
  PackagePlus,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { PRODUCTS } from "../data/products";
import { generateQuotationPDF } from "../utils/quotationPdf";
import { toast } from "sonner";

function sanitizeField(val: string, maxLen = 100): string {
  return val.replace(/[<>]/g, "").trim().slice(0, maxLen);
}

export const QuotationModal: React.FC = () => {
  const {
    isQuotationOpen,
    setIsQuotationOpen,
    items,
    addItem,
    updateQuantity,
    removeItem,
    total,
    products,
  } = useCart();

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [sellerName, setSellerName] = useState("Mabel Hernández");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isQuotationOpen) return null;

  const quoteNumber = `COT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const todayFormatted = new Date().toLocaleDateString("es-PA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDownloadPDF = async () => {
    if (items.length === 0) {
      toast.error("Selecciona al menos una lámpara para generar la cotización");
      return;
    }
    const cleanClient = sanitizeField(clientName, 80) || "Cliente Particular";

    try {
      setIsGenerating(true);
      await generateQuotationPDF({
        clientName: cleanClient,
        clientPhone: sanitizeField(clientPhone, 30),
        sellerName: sanitizeField(sellerName, 60) || "Mabel Hernández",
        items,
        quoteNumber,
      });
      toast.success("¡Cotización descargada exitosamente en PDF!");
    } catch (err) {
      console.error(err);
      toast.error("Error al generar el PDF de cotización");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const cleanClient = sanitizeField(clientName, 80) || "Cliente Particular";
    const cleanPhone = sanitizeField(clientPhone, 30);
    const cleanSeller = sanitizeField(sellerName, 60) || "Mabel Hernández";

    const itemsList = items
      .map(
        (i) =>
          `- ${i.quantity}x ${i.product.name} (Und: $${i.product.price.toFixed(2)}) = $${(
            i.product.price * i.quantity
          ).toFixed(2)} USD`
      )
      .join("\n");

    const message = `*SOLICITUD DE COTIZACION OFICIAL - SOLAR Y HOGAR PANAMA*
*Cotizacion No.:* ${quoteNumber}
*Fecha:* ${todayFormatted}
*Cliente / Empresa:* ${cleanClient}
${cleanPhone ? `*Telefono:* ${cleanPhone}\n` : ""}*Vendedor de Referencia:* ${cleanSeller}
----------------------------------------
*LAMPARAS COTIZADAS*
${itemsList}

*SUBTOTAL ESTIMADO:* $${total.toFixed(2)} USD
----------------------------------------
*Metodos de pago habilitados:*
- Yappy (Banco General)
- Transferencia Bancaria ACH (Banco General)

Hola equipo de Solar y Hogar, les comparto esta cotizacion generada desde su portal web. Quedo atento a su confirmacion de disponibilidad y coordinacion de envio. Muchas gracias.`;

    window.open(`https://wa.me/50769893055?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl rounded-3xl bg-background border border-border shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-solar/15 text-solar">
              <FileText aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-foreground leading-tight">
                Generador de Cotización Oficial (PDF)
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Documento con formato formal para empresas y clientes particulares
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsQuotationOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            aria-label="Cerrar modal de cotización"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body: Left form, Right Sheet Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls / Inputs Form (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User aria-hidden="true" className="h-4 w-4 text-solar" />
                1. Datos del Cliente o Empresa
              </h3>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Nombre del Cliente o Razón Social *
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    required
                    maxLength={80}
                    placeholder="Ej. Juan Pérez / Constructora del Istmo S.A."
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-solar focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Teléfono o WhatsApp (Opcional)
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="Ej. 6989-3055 / 260-0000"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-solar focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Vendedor Asignado
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    maxLength={60}
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:border-solar focus:outline-none font-medium"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Aparece registrado en el encabezado de la cotización oficial
                </span>
              </div>
            </div>

            {/* Items in Cart Quick Adjust & Direct Lamp Selector */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <PackagePlus aria-hidden="true" className="h-4 w-4 text-solar" />
                  <span>2. Lámparas a Cotizar ({items.length})</span>
                </h3>
                <span className="text-solar font-mono font-bold text-sm">${total.toFixed(2)} USD</span>
              </div>

              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-3 space-y-2.5">
                  <p className="text-xs font-medium text-foreground text-center">
                    Selecciona las lámparas para incluir en tu cotización oficial:
                  </p>
                  <div className="space-y-1.5">
                    {products.map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-card border border-border text-xs gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-foreground truncate">{prod.name}</p>
                          <p className="text-[11px] text-solar font-semibold">${prod.price.toFixed(2)} USD</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addItem(prod, 1)}
                          className="pressable inline-flex items-center gap-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 text-xs font-bold shrink-0 cursor-pointer shadow-xs"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Añadir</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {items.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border/80 text-xs gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-foreground truncate">{product.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            Und: ${product.price.toFixed(2)} USD
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="flex items-center rounded-lg border border-border bg-card">
                            <button
                              type="button"
                              onClick={() => {
                                if (quantity <= 1) {
                                  removeItem(product.id);
                                } else {
                                  updateQuantity(product.id, quantity - 1);
                                }
                              }}
                              className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Restar o eliminar"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center font-bold text-xs">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Aumentar"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="font-bold text-solar w-13 text-right">
                            ${(product.price * quantity).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(product.id)}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                            title="Eliminar de cotización"
                            aria-label={`Eliminar ${product.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick-add additional models button bar */}
                  <div className="pt-2 border-t border-border/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                      + Sumar otro modelo a la cotización:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {products.map((prod) => (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => addItem(prod, 1)}
                          className="pressable flex flex-col items-center justify-center p-1.5 rounded-lg border border-border bg-background hover:bg-secondary transition-colors cursor-pointer text-center"
                        >
                          <span className="text-[10px] font-bold text-foreground truncate w-full">
                            {prod.badge || prod.name} (${prod.price.toFixed(0)})
                          </span>
                          <span className="text-[9px] text-solar font-semibold">
                            + Añadir
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isGenerating || items.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-5 text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Download aria-hidden="true" className="h-4 w-4" />
                <span>{isGenerating ? "Generando PDF..." : "Descargar Cotización en PDF"}</span>
              </button>

              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full flex items-center justify-center gap-2 rounded-full border border-emerald-600/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 py-2.5 px-4 text-xs font-bold transition-all cursor-pointer"
              >
                <MessageCircle aria-hidden="true" className="h-4 w-4" />
                <span>Enviar Cotización a WhatsApp (6989-3055)</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 rounded-full border border-border bg-secondary/80 hover:bg-secondary text-secondary-foreground py-2 px-4 text-xs font-semibold transition-all cursor-pointer"
              >
                <Printer aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Imprimir / Guardar con el Navegador</span>
              </button>
            </div>
          </div>

          {/* Document Sheet Live Preview (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2 px-1 text-xs text-muted-foreground">
              <span className="font-semibold flex items-center gap-1">
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-solar" />
                Vista Previa del Documento Oficial
              </span>
              <span>Formato Carta / A4</span>
            </div>

            {/* The Actual Sheet matching user template */}
            <div
              id="quotation-print-sheet"
              className="relative w-full aspect-[1/1.414] bg-white text-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 p-6 sm:p-8 flex flex-col justify-between selection:bg-blue-100"
            >
              {/* TOP LEFT CORNER ACCENT SVG */}
              <div className="absolute top-0 left-0 w-20 sm:w-24 h-20 sm:h-24 pointer-events-none z-0">
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                  <path d="M 0 0 L 65 0 C 40 22 18 42 0 68 Z" fill="#38567A" />
                  <path d="M 0 0 L 48 0 C 28 15 12 30 0 48 Z" fill="#0F224A" />
                </svg>
              </div>

              {/* BOTTOM RIGHT WAVES SVG */}
              <div className="absolute bottom-0 right-0 w-44 sm:w-56 h-32 sm:h-40 pointer-events-none z-0">
                <svg viewBox="0 0 250 150" className="w-full h-full" fill="none">
                  <path d="M 0 150 C 70 80 160 50 250 80 L 250 150 Z" fill="#38567A" />
                  <path d="M 0 150 C 70 110 150 80 250 110 L 250 150 Z" fill="#0F224A" />
                </svg>
              </div>

              {/* Sheet Header: Meta on Left, Seller Logo on Right */}
              <div className="relative z-10 flex justify-between items-start gap-4">
                <div className="pt-4 sm:pt-6 pl-2 sm:pl-3 max-w-[58%]">
                  <h1 className="text-sm sm:text-base font-black text-slate-950 tracking-tight">
                    COTIZACIÓN OFICIAL
                  </h1>
                  <p className="text-[10px] sm:text-xs font-bold text-blue-900 mt-0.5 font-mono">
                    {quoteNumber}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-600 font-medium mt-1">
                    Fecha: {todayFormatted}
                  </p>

                  <div className="mt-2 space-y-0.5">
                    <p className="text-[10px] sm:text-xs font-bold text-slate-900 truncate">
                      Cliente: <span className="font-extrabold text-[#0F224A]">{sanitizeField(clientName, 80) || "[Nombre del Cliente / Empresa]"}</span>
                    </p>
                    {clientPhone.trim() && (
                      <p className="text-[9px] sm:text-[10px] text-slate-700 font-medium">
                        Contacto: <span className="font-semibold text-slate-900">{sanitizeField(clientPhone, 30)}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Seller and Logo block */}
                <div className="flex flex-col items-center text-center">
                  <img
                    src="/logo-emblem.png"
                    alt="Solar y Hogar"
                    className="h-12 w-12 sm:h-14 sm:w-14 object-contain rounded-full shadow-sm"
                  />
                  <span className="text-[9px] sm:text-[10px] font-black text-[#1B4332] tracking-wider mt-1 block">
                    SOLAR Y HOGAR
                  </span>
                  <div className="w-16 h-0.5 bg-[#2D6A4F] my-0.5" />

                  <span className="text-[11px] sm:text-xs font-serif text-[#0F224A] mt-1 block">
                    Vendedor
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 block">
                    {sanitizeField(sellerName, 60) || "Mabel Hernández"}
                  </span>

                  <div className="text-[8px] sm:text-[9px] text-slate-600 text-left mt-2 space-y-0.5 leading-tight">
                    <p>Vía de pago: Yappy</p>
                    <p>Transferencia ACH: Banco General</p>
                  </div>
                </div>
              </div>

              {/* Sheet Table */}
              <div className="relative z-10 my-4 flex-1 flex flex-col justify-start">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-[#38567A] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-2 px-3 rounded-l">Descripción</th>
                      <th className="py-2 px-2 text-center">Cantidad</th>
                      <th className="py-2 px-2 text-right">Und</th>
                      <th className="py-2 px-3 text-right rounded-r">Total</th>
                    </tr>
                  </thead>
                  <tbody className="text-[9px] sm:text-[10px]">
                    {items.length === 0 ? (
                      <tr className="bg-slate-50 text-slate-400 text-center italic">
                        <td colSpan={4} className="py-8 text-[10px]">
                          Añade lámparas a la izquierda para visualizar el desglose en vivo
                        </td>
                      </tr>
                    ) : (
                      items.map(({ product, quantity }, idx) => (
                        <tr
                          key={product.id}
                          className={
                            idx % 2 === 0
                              ? "bg-[#DDE6EE] text-[#0F224A] font-bold"
                              : "bg-white text-slate-800"
                          }
                        >
                          <td className="py-2 px-3">{product.name}</td>
                          <td className="py-2 px-2 text-center">{quantity}</td>
                          <td className="py-2 px-2 text-right">${product.price.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-black">
                            ${(product.price * quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}

                    <tr className="bg-[#DDE6EE] h-3">
                      <td colSpan={4}></td>
                    </tr>
                  </tbody>
                </table>

                {/* Total Box */}
                <div className="flex justify-end mt-3">
                  <div className="w-40 sm:w-48 bg-[#38567A] text-white flex items-center justify-between px-3 py-1.5 rounded shadow-sm">
                    <span className="text-[10px] sm:text-xs font-extrabold tracking-wider">
                      TOTAL
                    </span>
                    <span className="text-xs sm:text-sm font-black font-mono">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sheet Footer */}
              <div className="relative z-10 pt-2 text-center text-[8px] sm:text-[9px] text-slate-500">
                Solar y Hogar Panamá • WhatsApp Servicio al Cliente: 6989-3055 • Despachos a todo Panamá
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
