import { getSupabase } from "../lib/supabase";
import { CartItem } from "../types/store";

/**
 * Registro de cotizaciones y pedidos en el servidor.
 *
 * El navegador solo envía `productId` + `quantity`. La función
 * `public.create_request` de Supabase lee el precio real de `public.products`,
 * calcula los totales y devuelve el documento con su número oficial.
 * Si Supabase no está configurado (o el SQL aún no se ejecutó) se devuelve
 * `null` y la app funciona en modo local.
 */

export type RequestKind = "cotizacion" | "pedido";

export interface RequestItemInput {
  productId: string;
  quantity: number;
  /**
   * Precio negociado. Solo se aplica si quien registra la solicitud es un
   * vendedor autenticado; para el resto el servidor usa el precio del catálogo.
   */
  unitPrice?: number;
}

export interface RegisteredRequestItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  inStock?: boolean;
  /** Precio de catálogo, para comparar con un precio negociado. */
  catalogPrice?: number;
}

export interface RegisteredRequest {
  id: string;
  code: string;
  kind: RequestKind;
  customerName: string;
  items: RegisteredRequestItem[];
  subtotal: number;
  total: number;
  createdAt: string;
}

export interface RegisterRequestInput {
  kind: RequestKind;
  customerName: string;
  customerPhone?: string;
  notes?: Record<string, unknown>;
  items: RequestItemInput[];
}

export class RequestRegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestRegistrationError";
  }
}

/** Convierte el carrito al payload mínimo que acepta el servidor. */
export function toRequestItems(items: CartItem[]): RequestItemInput[] {
  return items.map((item) => ({
    productId: item.product.id,
    quantity: Math.max(1, Math.floor(item.quantity)),
  }));
}

/**
 * Sustituye los precios del carrito por los que devolvió el servidor.
 * El PDF y el mensaje de WhatsApp se generan siempre con estos valores.
 */
export function applyServerPrices(items: CartItem[], request: RegisteredRequest): CartItem[] {
  return items.map((item) => {
    const serverItem = request.items.find((i) => i.productId === item.product.id);
    if (!serverItem) return item;
    return {
      ...item,
      product: {
        ...item.product,
        name: serverItem.name,
        price: serverItem.unitPrice,
      },
    };
  });
}

/**
 * Convierte una solicitud ya registrada en ítems de carrito para volver a
 * generar su PDF con los precios que quedaron guardados en el servidor.
 */
export function requestToCartItems(request: RegisteredRequest): CartItem[] {
  return request.items.map((item) => ({
    product: {
      id: item.productId,
      name: item.name,
      tagline: "",
      category: "farolas",
      price: item.unitPrice,
      originalPrice: item.unitPrice,
      rating: 5,
      reviewsCount: 0,
      image: "",
      images: [],
      inStock: item.inStock ?? true,
      description: "",
      features: [],
    },
    quantity: item.quantity,
  }));
}

function isMissingFunction(error: { code?: string; message?: string }): boolean {
  if (error.code === "PGRST202") return true;
  const message = error.message ?? "";
  return /could not find the function|function .* does not exist/i.test(message);
}

interface RawRequestItem {
  productId?: string;
  name?: string;
  unitPrice?: number | string;
  catalogPrice?: number | string;
  quantity?: number | string;
  lineTotal?: number | string;
  inStock?: boolean;
}

interface CreateRequestResponse {
  id?: string;
  code?: string;
  kind?: string;
  customerName?: string;
  items?: RawRequestItem[];
  subtotal?: number | string;
  total?: number | string;
  createdAt?: string;
}

interface RawRequestRow {
  id?: string;
  code?: string;
  kind?: string;
  customer_name?: string;
  customer_phone?: string;
  items?: RawRequestItem[];
  subtotal?: number | string;
  total?: number | string;
  status?: string;
  created_at?: string;
}

function mapItems(raw: RawRequestItem[] | undefined): RegisteredRequestItem[] {
  return (raw ?? []).map((item) => {
    const mapped: RegisteredRequestItem = {
      productId: String(item.productId ?? ""),
      name: String(item.name ?? ""),
      unitPrice: Number(item.unitPrice ?? 0),
      quantity: Number(item.quantity ?? 0),
      lineTotal: Number(item.lineTotal ?? 0),
    };
    if (typeof item.inStock === "boolean") mapped.inStock = item.inStock;
    if (item.catalogPrice !== undefined && item.catalogPrice !== null) {
      mapped.catalogPrice = Number(item.catalogPrice);
    }
    return mapped;
  });
}

export async function registerRequest(
  input: RegisterRequestInput,
): Promise<RegisteredRequest | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("create_request", {
    payload: {
      kind: input.kind,
      customerName: input.customerName,
      customerPhone: input.customerPhone ?? "",
      notes: input.notes ?? {},
      items: input.items,
    },
  });

  if (error) {
    // El SQL todavía no se ejecutó en este proyecto: modo local.
    if (isMissingFunction(error)) return null;
    throw new RequestRegistrationError(error.message);
  }

  const row = data as CreateRequestResponse | null;
  if (!row || typeof row.code !== "string") {
    throw new RequestRegistrationError("El servidor devolvió una respuesta inválida.");
  }

  return {
    id: String(row.id ?? ""),
    code: row.code,
    kind: row.kind === "pedido" ? "pedido" : "cotizacion",
    customerName: String(row.customerName ?? input.customerName),
    items: mapItems(row.items),
    subtotal: Number(row.subtotal ?? 0),
    total: Number(row.total ?? 0),
    createdAt: String(row.createdAt ?? new Date().toISOString()),
  };
}

export interface RequestSummary extends RegisteredRequest {
  customerPhone: string;
  status: string;
}

function isMissingTable(error: { code?: string; message?: string }): boolean {
  if (error.code === "PGRST205" || error.code === "42P01") return true;
  return /relation .*requests.* does not exist|could not find the table/i.test(error.message ?? "");
}

/**
 * Últimas solicitudes registradas. La política RLS de public.requests solo
 * permite leerlas a un vendedor autenticado. Devuelve null si Supabase no está
 * configurado o si el SQL todavía no se ejecutó.
 */
export async function listRequests(limit = 50): Promise<RequestSummary[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("requests")
    .select(
      "id, code, kind, customer_name, customer_phone, items, subtotal, total, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTable(error)) return null;
    throw new RequestRegistrationError(error.message);
  }

  return ((data ?? []) as RawRequestRow[]).map((row) => ({
    id: String(row.id ?? ""),
    code: String(row.code ?? ""),
    kind: row.kind === "pedido" ? "pedido" : "cotizacion",
    customerName: String(row.customer_name ?? "Cliente Particular"),
    customerPhone: String(row.customer_phone ?? ""),
    items: mapItems(row.items),
    subtotal: Number(row.subtotal ?? 0),
    total: Number(row.total ?? 0),
    status: String(row.status ?? "pendiente"),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  }));
}
