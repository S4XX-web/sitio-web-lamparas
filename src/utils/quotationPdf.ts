import { CartItem } from "../types/store";

interface QuotationOptions {
  clientName: string;
  clientPhone?: string;
  sellerName?: string;
  items: CartItem[];
  quoteNumber?: string;
}

export async function generateQuotationPDF({
  clientName,
  clientPhone = "",
  sellerName = "Mabel Hernández",
  items,
  quoteNumber = `COT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
}: QuotationOptions): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;

    // --- 1. Top-Left Wave Curves (Compact corner accent - ends before y=42mm) ---
  // Secondary background wave (medium slate blue #38567A)
  doc.setFillColor(56, 86, 122);
  doc.moveTo(0, 0);
  doc.lineTo(36, 0);
  doc.curveTo(22, 14, 11, 26, 0, 40);
  doc.lineTo(0, 0);
  doc.fill();

  // Primary foreground wave (deep navy #0F224A)
  doc.setFillColor(15, 34, 74);
  doc.moveTo(0, 0);
  doc.lineTo(26, 0);
  doc.curveTo(16, 10, 8, 18, 0, 28);
  doc.lineTo(0, 0);
  doc.fill();

  // Primary foreground wave (deep navy #0F224A)
  doc.setFillColor(15, 34, 74);
  doc.moveTo(0, 0);
  doc.lineTo(36, 0);
  doc.curveTo(22, 14, 10, 24, 0, 36);
  doc.lineTo(0, 0);
  doc.fill();

  // --- 2. Bottom Wave Curves (Matching provided template) ---
  // Secondary wave (slate blue #38567A)
  doc.setFillColor(56, 86, 122);
  doc.moveTo(0, pageHeight);
  doc.curveTo(60, pageHeight - 35, 140, pageHeight - 55, pageWidth, pageHeight - 40);
  doc.lineTo(pageWidth, pageHeight);
  doc.lineTo(0, pageHeight);
  doc.fill();

  // Primary wave (deep navy #0F224A)
  doc.setFillColor(15, 34, 74);
  doc.moveTo(0, pageHeight);
  doc.curveTo(50, pageHeight - 20, 120, pageHeight - 40, pageWidth, pageHeight - 25);
  doc.lineTo(pageWidth, pageHeight);
  doc.lineTo(0, pageHeight);
  doc.fill();

  // --- 3. Top-Right Header (Logo & Seller Info) ---
  const logoX = 152;
  const logoY = 12;
  const logoW = 28;
  const logoH = 28;

  try {
    const res = await fetch("/logo-emblem.png");
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    doc.addImage(dataUrl, "PNG", logoX, logoY, logoW, logoH);
  } catch (err) {
    console.warn("Logo load fallback for PDF", err);
  }

  const rightCenterX = logoX + logoW / 2;

  // SOLAR Y HOGAR brand title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(27, 67, 50); // Forest green
  doc.text("SOLAR Y HOGAR", rightCenterX, logoY + logoH + 4, { align: "center" });

  // Underline
  doc.setDrawColor(45, 106, 79);
  doc.setLineWidth(0.4);
  doc.line(rightCenterX - 18, logoY + logoH + 5.5, rightCenterX + 18, logoY + logoH + 5.5);

  // Vendedor title
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text("vendedor", rightCenterX, logoY + logoH + 13, { align: "center" });

  // Seller name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text(sellerName, rightCenterX, logoY + logoH + 19, { align: "center" });

  // Payment methods
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(75, 75, 75);
  doc.text("vía de pago: yappy", rightCenterX - 18, logoY + logoH + 26);
  doc.text("transferencia: Banco General", rightCenterX - 18, logoY + logoH + 30.5);
  doc.text("Cheques", rightCenterX - 18, logoY + logoH + 35);

  // --- 4. Customer & Quotation Meta (Left Side, 100% clean white background) ---
  const leftX = 22;
  let currentY = 52;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Deep crisp navy
  doc.text("COTIZACIÓN OFICIAL", leftX, currentY);

  currentY += 6;
  doc.setFontSize(9.5);
  doc.setTextColor(30, 58, 138); // Bold vivid blue #1E3A8A for quote number
  doc.text(`No. ${quoteNumber}`, leftX, currentY);

  currentY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81); // Slate gray #374151 for crystal clear legibility
  const todayStr = new Date().toLocaleDateString("es-PA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Fecha: ${todayStr}`, leftX, currentY);

  currentY += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Cliente: ${clientName || "Cliente Particular"}`, leftX, currentY);

  if (clientPhone.trim()) {
    currentY += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(90, 90, 90);
    doc.text(`Contacto: ${clientPhone}`, leftX, currentY);
  }

  // --- 5. Table of Products ---
  const tableX = 20;
  const tableW = 170;
  let tableY = 96;

  // Header Bar (Solid slate navy)
  doc.setFillColor(56, 86, 122); // #38567A
  doc.rect(tableX, tableY, tableW, 9.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text("Descripción", tableX + 5, tableY + 6.5);
  doc.text("Cantidad", tableX + 90, tableY + 6.5, { align: "center" });
  doc.text("Und", tableX + 130, tableY + 6.5, { align: "right" });
  doc.text("Total", tableX + tableW - 5, tableY + 6.5, { align: "right" });

  tableY += 9.5;

  let totalSum = 0;

  items.forEach((item, index) => {
    const rowH = 11;
    const isOdd = index % 2 === 0;

    // Zebra stripe: soft light-blue #DDE6EE on odd rows
    if (isOdd) {
      doc.setFillColor(221, 230, 238);
      doc.rect(tableX, tableY, tableW, rowH, "F");
    } else {
      doc.setFillColor(248, 250, 252);
      doc.rect(tableX, tableY, tableW, rowH, "F");
    }

    const itemTotal = item.quantity * item.product.price;
    totalSum += itemTotal;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);

    // Truncate long descriptions if needed
    const maxTextWidth = 75;
    const desc = doc.splitTextToSize(item.product.name, maxTextWidth)[0];
    doc.text(desc, tableX + 5, tableY + 7);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(String(item.quantity), tableX + 90, tableY + 7, { align: "center" });
    doc.text(item.product.price.toFixed(2), tableX + 130, tableY + 7, { align: "right" });
    doc.text(itemTotal.toFixed(2), tableX + tableW - 5, tableY + 7, { align: "right" });

    tableY += rowH;
  });

  // Empty spacer bar row (matches the visual rhythm in template)
  tableY += 4;
  doc.setFillColor(221, 230, 238);
  doc.rect(tableX, tableY, tableW, 7, "F");
  tableY += 11;

  // --- 6. Total Box (Right-aligned dark navy container) ---
  const totalBoxW = 75;
  const totalBoxX = tableX + tableW - totalBoxW;
  const totalBoxH = 10.5;

  doc.setFillColor(56, 86, 122);
  doc.rect(totalBoxX, tableY, totalBoxW, totalBoxH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL", totalBoxX + 10, tableY + 7);
  doc.text(`$${totalSum.toFixed(2)}`, totalBoxX + totalBoxW - 8, tableY + 7, {
    align: "right",
  });

  // --- 7. Footer Note ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Solar y Hogar Panamá • WhatsApp Servicio al Cliente: 6989-3055 • Despachos a todo el país",
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" }
  );

  // Download PDF file
  const sanitizedClient = (clientName || "Cliente")
    .replace(/[^a-zA-Z0-9_\-]/g, "_")
    .substring(0, 25);
  doc.save(`Cotizacion_Solar_y_Hogar_${sanitizedClient}.pdf`);
}
