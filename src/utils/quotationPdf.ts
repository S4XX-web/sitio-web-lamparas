import { CartItem } from "../types/store";

interface QuotationOptions {
  clientName: string;
  clientPhone?: string;
  sellerName?: string;
  items: CartItem[];
  quoteNumber?: string;
}

function cleanPdfText(value: string, maxLen = 90): string {
  // Strip control characters and HTML brackets before drawing to PDF
  return value
    .replace(/[\u0000-\u001F\u007F<>]/g, "")
    .trim()
    .slice(0, maxLen);
}

export async function generateQuotationPDF({
  clientName,
  clientPhone = "",
  sellerName = "Mabel Hernández",
  items,
  quoteNumber = `COT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
}: QuotationOptions): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const safeClientName = cleanPdfText(clientName, 80) || "Cliente Particular";
  const safeClientPhone = cleanPdfText(clientPhone, 35);
  const safeSellerName = cleanPdfText(sellerName, 60) || "Mabel Hernández";
  const safeQuoteNumber = cleanPdfText(quoteNumber, 30);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // --- 1. Top-Left Wave Curves ---
  doc.setFillColor(56, 86, 122);
  doc.moveTo(0, 0);
  doc.lineTo(36, 0);
  doc.curveTo(22, 14, 11, 26, 0, 40);
  doc.lineTo(0, 0);
  doc.fill();

  doc.setFillColor(15, 34, 74);
  doc.moveTo(0, 0);
  doc.lineTo(26, 0);
  doc.curveTo(16, 10, 8, 18, 0, 28);
  doc.lineTo(0, 0);
  doc.fill();

  doc.setFillColor(15, 34, 74);
  doc.moveTo(0, 0);
  doc.lineTo(36, 0);
  doc.curveTo(22, 14, 10, 24, 0, 36);
  doc.lineTo(0, 0);
  doc.fill();

  // --- 2. Bottom Wave Curves ---
  doc.setFillColor(56, 86, 122);
  doc.moveTo(0, pageHeight);
  doc.curveTo(60, pageHeight - 35, 140, pageHeight - 55, pageWidth, pageHeight - 40);
  doc.lineTo(pageWidth, pageHeight);
  doc.lineTo(0, pageHeight);
  doc.fill();

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

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(27, 67, 50);
  doc.text("SOLAR Y HOGAR", rightCenterX, logoY + logoH + 4, { align: "center" });

  doc.setDrawColor(45, 106, 79);
  doc.setLineWidth(0.4);
  doc.line(rightCenterX - 18, logoY + logoH + 5.5, rightCenterX + 18, logoY + logoH + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Vendedor", rightCenterX, logoY + logoH + 12, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(40, 40, 40);
  doc.text(safeSellerName, rightCenterX, logoY + logoH + 18, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(75, 75, 75);
  doc.text("Vía de pago: Yappy (Banco General)", rightCenterX - 22, logoY + logoH + 25);
  doc.text("Transferencia ACH: Banco General", rightCenterX - 22, logoY + logoH + 29.5);

  // --- 4. Customer & Quotation Meta ---
  const leftX = 22;
  let currentY = 52;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("COTIZACIÓN OFICIAL", leftX, currentY);

  currentY += 6;
  doc.setFontSize(9.5);
  doc.setTextColor(30, 58, 138);
  doc.text(`No. ${safeQuoteNumber}`, leftX, currentY);

  currentY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
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
  doc.text(`Cliente: ${safeClientName}`, leftX, currentY);

  if (safeClientPhone) {
    currentY += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(90, 90, 90);
    doc.text(`Contacto: ${safeClientPhone}`, leftX, currentY);
  }

  // --- 5. Table of Products ---
  const tableX = 20;
  const tableW = 170;
  let tableY = 96;

  doc.setFillColor(56, 86, 122);
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

    const maxTextWidth = 75;
    const desc = doc.splitTextToSize(cleanPdfText(item.product.name, 90), maxTextWidth)[0];
    doc.text(desc, tableX + 5, tableY + 7);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(String(item.quantity), tableX + 90, tableY + 7, { align: "center" });
    doc.text(item.product.price.toFixed(2), tableX + 130, tableY + 7, { align: "right" });
    doc.text(itemTotal.toFixed(2), tableX + tableW - 5, tableY + 7, { align: "right" });

    tableY += rowH;
  });

  tableY += 4;
  doc.setFillColor(221, 230, 238);
  doc.rect(tableX, tableY, tableW, 7, "F");
  tableY += 11;

  // --- 6. Total Box ---
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
    "Solar y Hogar Panamá • WhatsApp Servicio al Cliente: 6989-3055 • Despachos a todo Panamá",
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" }
  );

  const sanitizedClient = safeClientName
    .replace(/[^a-zA-Z0-9_\-]/g, "_")
    .substring(0, 25);
  doc.save(`Cotizacion_Solar_y_Hogar_${sanitizedClient}.pdf`);
}
