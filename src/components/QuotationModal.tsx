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
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { generateQuotationPDF } from "../utils/quotationPdf";
import { toast } from "sonner";

export const QuotationModal: React.FC = () => {
  const { isQuotationOpen, setIsQuotationOpen, items, updateQuantity, total } = useCart();

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
      toast.error("Agrega al menos una lámpara al carrito para cotizar");
      return;
    }
    if (!clientName.trim()) {
      toast.error("Por favor ingresa el nombre del cliente o empresa");
      return;
    }

    try {
      setIsGenerating(true);
      await generateQuotationPDF({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        sellerName: sellerName.trim(),
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
    const itemsList = items
      .map(
        (i) =>
          `- ${i.quantity}x ${i.product.name} (Und: $${i.product.price.toFixed(2)}) = $${(
            i.product.price * i.quantity
          ).toFixed(2)} USD`
      )
      .join("\n");

    const message = `*SOLICITUD DE COTIZACIÓN OFICIAL - SOLAR Y HOGAR PANAMÁ*
*Cotización No.:* ${quoteNumber}
*Fecha:* ${todayFormatted}
*Cliente / Empresa:* ${clientName || "Cliente Particular"}
${clientPhone ? `*Teléfono:* ${clientPhone}\n` : ""}*Vendedor de Referencia:* ${sellerName}
----------------------------------------
*LÁMPARAS COTIZADAS*
${itemsList}

*TOTAL ESTIMADO:* $${total.toFixed(2)} USD
----------------------------------------
*Métodos de pago habilitados:*
- Vía de pago: Yappy (Banco General)
- Transferencia ACH (Banco General)
- Cheques

Hola equipo de Solar y Hogar, les comparto esta cotización generada desde su portal web. Quedo atento a su confirmación de disponibilidad y tiempos de despacho. Muchas gracias.`;

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
              <FileText className="h-5 w-5" />
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
                <User className="h-4 w-4 text-solar" />
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

            {/* Items in Cart Quick Adjust */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>2. Lámparas a Cotizar ({items.length})</span>
                <span className="text-solar font-mono font-bold">${total.toFixed(2)} USD</span>
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2 text-center">
                    No tienes productos en el carrito. Agrega una lámpara desde el catálogo.
                  </p>
                ) : (
                  items.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-background border border-border/80 text-xs gap-2"
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
                            onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1))}
                            className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center font-bold text-xs">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-bold text-solar w-14 text-right">
                          ${(product.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isGenerating || items.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-5 text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>{isGenerating ? "Generando PDF..." : "Descargar Cotización en PDF"}</span>
              </button>

              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full flex items-center justify-center gap-2 rounded-full border border-emerald-600/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 py-2.5 px-4 text-xs font-bold transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Enviar Cotización a WhatsApp (6989-3055)</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 rounded-full border border-border bg-secondary/80 hover:bg-secondary text-secondary-foreground py-2 px-4 text-xs font-semibold transition-all cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Imprimir / Guardar con el Navegador</span>
              </button>
            </div>
          </div>

          {/* Document Sheet Live Preview (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2 px-1 text-xs text-muted-foreground">
              <span className="font-semibold flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-solar" />
                Vista Previa del Documento Oficial
              </span>
              <span>Formato Carta / A4</span>
            </div>

            {/* The Actual Sheet matching user template */}
            <div
              id="quotation-print-sheet"
              className="relative w-full aspect-[1/1.414] bg-white text-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 p-6 sm:p-8 flex flex-col justify-between selection:bg-blue-100"
            >
                            {/* TOP LEFT CORNER ACCENT SVG (Compact corner design - zero text overlap) */}
              <div className="absolute top-0 left-0 w-20 sm:w-24 h-20 sm:h-24 pointer-events-none z-0">
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                  <path
                    d="M 0 0 L 65 0 C 40 22 18 42 0 68 Z"
                    fill="#38567A"
                  />
                  <path
                    d="M 0 0 L 48 0 C 28 15 12 30 0 48 Z"
                    fill="#0F224A"
                  />
                </svg>
              </div>

              {/* BOTTOM RIGHT WAVES SVG */}
              <div className="absolute bottom-0 right-0 w-44 sm:w-56 h-32 sm:h-40 pointer-events-none z-0">
                <svg viewBox="0 0 250 150" className="w-full h-full" fill="none">
                  <path
                    d="M 0 150 C 70 80 160 50 250 80 L 250 150 Z"
                    fill="#38567A"
                  />
                  <path
                    d="M 0 150 C 70 110 150 80 250 110 L 250 150 Z"
                    fill="#0F224A"
                  />
                </svg>
              </div>

              {/* Sheet Header: Meta on Left, Seller Logo on Right */}
              <div className="relative z-10 flex justify-between items-start gap-4">
                                {/* Meta details (100% clean white background with maximum contrast) */}
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
                      Cliente: <span className="font-extrabold text-[#0F224A]">{clientName.trim() || "[Nombre del Cliente / Empresa]"}</span>
                    </p>
                    {clientPhone.trim() && (
                      <p className="text-[9px] sm:text-[10px] text-slate-700 font-medium">
                        Contacto: <span className="font-semibold text-slate-900">{clientPhone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Seller and Logo block (matching template) */}
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
                    vendedor
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 block">
                    {sellerName}
                  </span>

                  <div className="text-[8px] sm:text-[9px] text-slate-600 text-left mt-2 space-y-0.5 leading-tight">
                    <p>vía de pago: yappy</p>
                    <p>transferencia: Banco General</p>
                    <p>Cheques</p>
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
                    {items.map(({ product, quantity }, idx) => (
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
                    ))}

                    {/* Spacer row matching template */}
                    <tr className="bg-[#DDE6EE] h-3">
                      <td colSpan={4}></td>
                    </tr>
                  </tbody>
                </table>

                {/* Total Box (on the right half, matching template) */}
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
                Solar y Hogar Panamá • WhatsApp Servicio al Cliente: 6989-3055 • Encomiendas a todo el país
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
