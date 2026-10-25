import { PRICING_SHEET_CONFIG } from "../config/pricingSheet";
import { PRODUCTS } from "../data/products";
import { Product } from "../types/store";

export interface LivePriceEntry {
  productId: string;
  price: number;
  originalPrice?: number;
  inStock?: boolean;
  description?: string;
  badge?: string;
  updatedAt: string;
}

export type LivePricesMap = Record<string, LivePriceEntry>;

/**
 * Parsea una línea de texto CSV considerando comillas y comas internas.
 */
function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Limpia y convierte un string numérico a precio (ej: "$55.00" -> 55, "40,50" -> 40.5)
 */
function parsePrice(value: string | undefined): number | null {
  if (!value) return null;
  const clean = value.replace(/[^0-9.,]/g, "").replace(",", ".");
  const num = parseFloat(clean);
  return !isNaN(num) && num > 0 ? num : null;
}

/**
 * Asocia un identificador escrito por el usuario con el ID real del catálogo.
 */
function matchProductId(rawText: string): string | null {
  const normalized = rawText.toLowerCase().trim();
  const directMatch = PRODUCTS.find((p) => p.id.toLowerCase() === normalized);
  if (directMatch) return directMatch.id;

  // Búsqueda flexible por potencia o nombre
  if (normalized.includes("1200")) return "lampara-solar-1200w";
  if (normalized.includes("800")) return "lampara-solar-800w";
  if (normalized.includes("300") || normalized.includes("reflector") || normalized.includes("proyector")) {
    return "reflector-solar-industrial";
  }

  return null;
}

/**
 * Aplica los precios en vivo a una copia del catálogo (sin mutar nada global).
 * Devuelve un catálogo nuevo; nunca modifica el array recibido.
 */
export function mergeLivePrices(products: Product[], prices: LivePricesMap): Product[] {
  return products.map((product) => {
    const entry = prices[product.id];
    if (!entry || entry.price <= 0) return product;

    const merged: Product = { ...product, price: entry.price };

    if (entry.originalPrice && entry.originalPrice > entry.price) {
      merged.originalPrice = entry.originalPrice;
    }
    if (typeof entry.inStock === "boolean") {
      merged.inStock = entry.inStock;
    }
    if (entry.description && entry.description.trim().length > 5) {
      merged.description = entry.description.trim();
    }
    if (entry.badge && entry.badge.trim().length > 0) {
      merged.badge = entry.badge.trim();
    }

    return merged;
  });
}

/**
 * Intenta descargar el texto CSV probando los dos endpoints públicos de Google Sheets.
 */
async function fetchGoogleSheetCsv(sheetId: string, sheetName?: string): Promise<string | null> {
  const tabParam = sheetName?.trim() ? `&sheet=${encodeURIComponent(sheetName.trim())}` : "";
  const endpoints = [
    `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/gviz/tq?tqx=out:csv${tabParam}&t=${Date.now()}`,
    `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/export?format=csv&t=${Date.now()}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "text/csv, text/plain" },
        cache: "no-store",
      });
      if (res.ok) {
        const text = await res.text();
        if (text && !text.includes("<!DOCTYPE html>") && text.trim().length > 0) {
          return text;
        }
      }
    } catch {
      // Intentar el siguiente endpoint
    }
  }
  return null;
}

/**
 * Descarga y sincroniza los precios en vivo desde Google Sheets.
 */
export async function syncPricesFromGoogleSheet(): Promise<LivePricesMap | null> {
  if (!PRICING_SHEET_CONFIG.enabled || !PRICING_SHEET_CONFIG.sheetId) {
    return null;
  }

  try {
    const csvText = await fetchGoogleSheetCsv(
      PRICING_SHEET_CONFIG.sheetId,
      PRICING_SHEET_CONFIG.sheetName
    );

    if (!csvText) {
      // La hoja aún no tiene filas o no está accesible; se mantienen los precios base
      return null;
    }

    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return null;

    // Detectar posiciones de columnas por encabezado
    const header = parseCsvLine(lines[0] ?? "").map((h) => h.toLowerCase().replace(/["']/g, ""));
    const idIdx = header.findIndex(
      (h) => h.includes("id") || h.includes("codigo") || h.includes("código") || h.includes("modelo") || h.includes("producto")
    );
    const priceIdx = header.findIndex(
      (h) => h.includes("precio") || h.includes("price") || h.includes("costo") || h.includes("venta") || h.includes("actual")
    );
    const origPriceIdx = header.findIndex(
      (h) => h.includes("original") || h.includes("anterior") || h.includes("antes") || h.includes("tachado") || h.includes("pvp")
    );
    const stockIdx = header.findIndex(
      (h) => h.includes("stock") || h.includes("disponible") || h.includes("activo") || h.includes("disponibilidad")
    );

    const effectiveIdIdx = idIdx >= 0 ? idIdx : 0;
    const effectivePriceIdx = priceIdx >= 0 ? priceIdx : 2;

    const livePrices: LivePricesMap = {};

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i] ?? "").map((c) => c.replace(/^["']|["']$/g, ""));
      if (cols.length === 0 || cols.every((c) => !c.trim())) continue;

      // Buscar ID en la columna esperada, o buscar en cualquier columna si no coincide
      let matchedId = matchProductId(cols[effectiveIdIdx] || "");
      if (!matchedId) {
        for (const col of cols) {
          const testId = matchProductId(col);
          if (testId) {
            matchedId = testId;
            break;
          }
        }
      }

      // Buscar precio en la columna esperada, o escanear las columnas
      let parsedPrice = parsePrice(cols[effectivePriceIdx]);
      if (parsedPrice === null) {
        for (let colIdx = 0; colIdx < cols.length; colIdx++) {
          if (colIdx === effectiveIdIdx) continue;
          const candidate = parsePrice(cols[colIdx]);
          if (candidate !== null) {
            parsedPrice = candidate;
            break;
          }
        }
      }

      if (matchedId && parsedPrice !== null) {
        const origPrice = origPriceIdx >= 0 ? parsePrice(cols[origPriceIdx]) : null;
        let inStock: boolean | undefined = undefined;

        if (stockIdx >= 0 && cols[stockIdx]) {
          const val = cols[stockIdx]?.toLowerCase() || "";
          inStock = val.includes("si") || val.includes("yes") || val === "1" || val.includes("stock") || val.includes("disp");
        }

        const entry: LivePriceEntry = {
          productId: matchedId,
          price: parsedPrice,
          updatedAt: new Date().toISOString(),
        };
        if (origPrice && origPrice > parsedPrice) {
          entry.originalPrice = origPrice;
        }
        if (typeof inStock === "boolean") {
          entry.inStock = inStock;
        }

        livePrices[matchedId] = entry;
      }
    }

    if (Object.keys(livePrices).length > 0) {
      return livePrices;
    }

    return null;
  } catch (err) {
    console.warn("Fallo de conexión con Google Sheets (usando precios locales):", err);
    return null;
  }
}
