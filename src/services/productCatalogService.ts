import { Product } from "../types/store";
import { PRODUCTS } from "../data/products";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";

const STORAGE_CATALOG_KEY = "solara_seller_catalog_v2";

const CATALOG_CHANGE_EVENT = "solara:catalog_changed";

/**
 * Error de escritura contra la nube. Se lanza para que el panel pueda mostrar
 * el motivo real (permiso, sesión vencida, red) en vez de un éxito falso.
 */
export class CatalogWriteError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "CatalogWriteError";
    if (code) this.code = code;
  }
}

function toWriteError(error: { message?: string; code?: string }): CatalogWriteError {
  const message = error.message ?? "";
  const code = error.code;

  if (code === "42501" || /row-level security|permission denied|violates row-level/i.test(message)) {
    return new CatalogWriteError(
      "Tu cuenta no tiene permiso para modificar el catálogo. Pide que te agreguen como vendedor.",
      code,
    );
  }
  if (/jwt|token|expired|invalid claim/i.test(message)) {
    return new CatalogWriteError("Tu sesión venció. Cierra sesión y vuelve a entrar.", code);
  }
  if (/failed to fetch|network|load failed/i.test(message)) {
    return new CatalogWriteError("Sin conexión con la nube. Revisa tu internet e inténtalo de nuevo.", code);
  }
  return new CatalogWriteError(message || "No se pudo guardar el cambio en la nube.", code);
}

/**
 * Convierte un objeto Product al formato de fila de base de datos Supabase
 */
export function productToSupabaseRow(p: Product) {
  return {
    id: p.id,
    name: p.name,
    tagline: p.tagline || "",
    department: p.department || "solar",
    category: p.category || "farolas",
    price: p.price,
    original_price: p.originalPrice ?? p.price,
    rating: p.rating ?? 5.0,
    reviews_count: p.reviewsCount ?? 0,
    image: p.image || "",
    images: p.images || [],
    badge: p.badge || "",
    in_stock: p.inStock,
    lumens: p.lumens || "",
    battery_life: p.batteryLife || "",
    waterproof: p.waterproof || "",
    description: p.description || "",
    features: p.features || [],
    material: p.material || "",
    dimensions: p.dimensions || "",
    updated_at: new Date().toISOString(),
  };
}

/**
 * Convierte una fila de Supabase a un objeto Product
 */
export function supabaseRowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || "",
    department: row.department || "solar",
    category: row.category || "farolas",
    price: Number(row.price),
    originalPrice: Number(row.original_price ?? row.price),
    rating: Number(row.rating ?? 5.0),
    reviewsCount: Number(row.reviews_count ?? 0),
    image: row.image || "",
    images: Array.isArray(row.images) ? row.images : [],
    badge: row.badge || undefined,
    inStock: Boolean(row.in_stock),
    lumens: row.lumens || undefined,
    batteryLife: row.battery_life || undefined,
    waterproof: row.waterproof || undefined,
    description: row.description || "",
    features: Array.isArray(row.features) ? row.features : [],
    material: row.material || undefined,
    dimensions: row.dimensions || undefined,
  };
}

/**
 * Obtiene el catálogo actual desde la caché local o el catálogo base inicial.
 */
export function getLiveCatalog(): Product[] {
  if (typeof window === "undefined") return [...PRODUCTS];
  try {
    const raw = localStorage.getItem(STORAGE_CATALOG_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(PRODUCTS));
      return [...PRODUCTS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [...PRODUCTS];
  } catch (err) {
    console.warn("Error leyendo catálogo local:", err);
    return [...PRODUCTS];
  }
}

/**
 * Guarda el catálogo en la caché local y sincroniza la memoria.
 */
export function saveCatalog(catalog: Product[], broadcast = true): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(catalog));

    // Nota: no se muta el array PRODUCTS. El catálogo estático es inmutable y
    // sirve solo como semilla/fallback; el estado vive en React y en Supabase.

    if (broadcast) {
      window.dispatchEvent(new CustomEvent(CATALOG_CHANGE_EVENT, { detail: catalog }));
    }
  } catch (err) {
    console.error("Error guardando catálogo local:", err);
  }
}

/**
 * Descarga el catálogo en vivo desde Supabase y actualiza la tienda.
 */
export async function fetchLiveCatalogFromSupabase(): Promise<Product[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Aviso al consultar Supabase:", error.message);
      return null;
    }

    if (Array.isArray(data) && data.length > 0) {
      const remoteProducts = data.map(supabaseRowToProduct);
      saveCatalog(remoteProducts, true);
      return remoteProducts;
    }

    return null;
  } catch (err) {
    console.warn("Fallo conectando a Supabase:", err);
    return null;
  }
}

/**
 * Agrega un nuevo producto tanto localmente como en Supabase Cloud.
 */
export async function addProductToCatalog(product: Product): Promise<Product[]> {
  const current = getLiveCatalog();
  const cleanId = product.id.trim() || `prod-${Date.now()}`;
  const exists = current.some((p) => p.id === cleanId);
  const finalId = exists ? `${cleanId}-${Math.floor(Math.random() * 1000)}` : cleanId;

  const newProd: Product = {
    ...product,
    id: finalId,
  };

  // La nube manda: si el guardado remoto falla, NO tocamos la caché local
  // para que el panel nunca muestre un producto que no existe en el servidor.
  const supabase = getSupabase();
  if (supabase) {
    const row = productToSupabaseRow(newProd);
    const { data, error } = await supabase.from("products").upsert(row).select("id");
    if (error) throw toWriteError(error);
    if (!Array.isArray(data) || data.length === 0) {
      throw new CatalogWriteError(
        "La nube no confirmó el guardado. Vuelve a iniciar sesión como vendedor.",
      );
    }
  }

  const updated = [newProd, ...current];
  saveCatalog(updated, true);
  return updated;
}

/**
 * Actualiza un producto existente por su ID localmente y en Supabase.
 */
export async function updateProductInCatalog(id: string, updates: Partial<Product>): Promise<Product[]> {
  const current = getLiveCatalog();
  let updatedProd: Product | null = null;

  const updated = current.map((prod) => {
    if (prod.id === id) {
      updatedProd = { ...prod, ...updates };
      return updatedProd;
    }
    return prod;
  });

  if (!updatedProd) {
    throw new CatalogWriteError("Ese producto ya no existe en el catálogo. Actualiza la página.");
  }

  // Escritura remota primero. `.select("id")` confirma que RLS permitió el
  // cambio; si devuelve 0 filas, el update no tocó nada (producto borrado).
  const supabase = getSupabase();
  if (supabase) {
    const row = productToSupabaseRow(updatedProd);
    const { data, error } = await supabase.from("products").update(row).eq("id", id).select("id");
    if (error) throw toWriteError(error);
    if (!Array.isArray(data) || data.length === 0) {
      throw new CatalogWriteError(
        "El servidor no encontró ese producto. Actualiza la página e inténtalo de nuevo.",
      );
    }
  }

  saveCatalog(updated, true);
  return updated;
}

/**
 * Elimina un producto por su ID localmente y en Supabase Cloud.
 */
export async function deleteProductFromCatalog(id: string): Promise<Product[]> {
  const current = getLiveCatalog();
  const updated = current.filter((p) => p.id !== id);

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.from("products").delete().eq("id", id).select("id");
    if (error) throw toWriteError(error);
    if (!Array.isArray(data) || data.length === 0) {
      throw new CatalogWriteError(
        "El servidor no encontró ese producto (puede que ya estuviera borrado).",
      );
    }
  }

  saveCatalog(updated, true);
  return updated;
}

/**
 * Restablece el catálogo a los productos originales de fábrica.
 */
export function resetCatalogToDefault(): Product[] {
  if (typeof window === "undefined") return [...PRODUCTS];
  localStorage.removeItem(STORAGE_CATALOG_KEY);
  return getLiveCatalog();
}

/**
 * Suscripción para reaccionar a cambios en tiempo real entre componentes,
 * pestañas del navegador Y entre distintos dispositivos a través de Supabase Realtime.
 */
export function subscribeToCatalogChanges(callback: (catalog: Product[]) => void): () => void {
  if (typeof window === "undefined") return () => {};

  // Evento local entre componentes de la misma página
  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<Product[]>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getLiveCatalog());
    }
  };

  // Evento storage entre pestañas del mismo navegador
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_CATALOG_KEY) {
      callback(getLiveCatalog());
    }
  };

  window.addEventListener(CATALOG_CHANGE_EVENT, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  // Inicializar consulta y canal en tiempo real con Supabase
  let channelSubscription: any = null;
  const supabase = getSupabase();

  if (supabase) {
    // 1. Cargar datos frescos de la nube al iniciar
    fetchLiveCatalogFromSupabase().then((data) => {
      if (data) callback(data);
    });

    // 2. Canal Realtime: cualquier cambio en cualquier dispositivo avisa inmediatamente
    try {
      channelSubscription = supabase
        .channel("solara-products-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "products" },
          async () => {
            const fresh = await fetchLiveCatalogFromSupabase();
            if (fresh) {
              callback(fresh);
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn("No se pudo iniciar canal Realtime de Supabase:", err);
    }
  }

  return () => {
    window.removeEventListener(CATALOG_CHANGE_EVENT, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
    if (channelSubscription && supabase) {
      supabase.removeChannel(channelSubscription);
    }
  };
}

