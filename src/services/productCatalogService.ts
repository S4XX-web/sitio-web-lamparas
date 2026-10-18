import { Product } from "../types/store";
import { PRODUCTS } from "../data/products";

const STORAGE_CATALOG_KEY = "solara_seller_catalog_v2";
const STORAGE_PIN_KEY = "solara_seller_pin_v2";
const SESSION_AUTH_KEY = "solara_seller_auth_session_v2";
const DEFAULT_PIN = "2026";

const CATALOG_CHANGE_EVENT = "solara:catalog_changed";

/**
 * Obtiene el catálogo actual desde localStorage o el catálogo base por defecto.
 */
export function getLiveCatalog(): Product[] {
  if (typeof window === "undefined") return [...PRODUCTS];
  try {
    const raw = localStorage.getItem(STORAGE_CATALOG_KEY);
    if (!raw) {
      // Guardar inicial
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
 * Guarda el catálogo y emite evento global para sincronizar todas las vistas abiertas.
 */
export function saveCatalog(catalog: Product[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(catalog));
    
    // También actualizamos el array PRODUCTS en memoria para componentes síncronos
    PRODUCTS.length = 0;
    catalog.forEach((item) => PRODUCTS.push(item));

    window.dispatchEvent(new CustomEvent(CATALOG_CHANGE_EVENT, { detail: catalog }));
  } catch (err) {
    console.error("Error guardando catálogo:", err);
  }
}

/**
 * Actualiza un producto existente por su ID.
 */
export function updateProductInCatalog(id: string, updates: Partial<Product>): Product[] {
  const current = getLiveCatalog();
  const updated = current.map((prod) => {
    if (prod.id === id) {
      return { ...prod, ...updates };
    }
    return prod;
  });
  saveCatalog(updated);
  return updated;
}

/**
 * Agrega un nuevo producto al catálogo.
 */
export function addProductToCatalog(product: Product): Product[] {
  const current = getLiveCatalog();
  // Evitar duplicados de ID
  const cleanId = product.id.trim() || `prod-${Date.now()}`;
  const exists = current.some((p) => p.id === cleanId);
  const finalId = exists ? `${cleanId}-${Math.floor(Math.random() * 1000)}` : cleanId;

  const newProd: Product = {
    ...product,
    id: finalId,
  };

  const updated = [newProd, ...current];
  saveCatalog(updated);
  return updated;
}

/**
 * Elimina un producto por su ID.
 */
export function deleteProductFromCatalog(id: string): Product[] {
  const current = getLiveCatalog();
  const updated = current.filter((p) => p.id !== id);
  saveCatalog(updated);
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
 * Suscripción para reaccionar a cambios en tiempo real entre componentes o pestañas.
 */
export function subscribeToCatalogChanges(callback: (catalog: Product[]) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<Product[]>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getLiveCatalog());
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_CATALOG_KEY) {
      callback(getLiveCatalog());
    }
  };

  window.addEventListener(CATALOG_CHANGE_EVENT, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(CATALOG_CHANGE_EVENT, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}

// ----------------------------------------------------------------------
// GESTIÓN DE SEGURIDAD Y SESIÓN DEL VENDEDOR
// ----------------------------------------------------------------------

export function getStoredPin(): string {
  if (typeof window === "undefined") return DEFAULT_PIN;
  return localStorage.getItem(STORAGE_PIN_KEY) || DEFAULT_PIN;
}

export function verifyPin(pin: string): boolean {
  const currentPin = getStoredPin();
  return pin.trim() === currentPin.trim();
}

export function changeSellerPin(oldPin: string, newPin: string): { success: boolean; error?: string } {
  if (!verifyPin(oldPin)) {
    return { success: false, error: "El PIN actual es incorrecto" };
  }
  if (!newPin || newPin.trim().length < 4) {
    return { success: false, error: "El nuevo PIN debe tener al menos 4 caracteres" };
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_PIN_KEY, newPin.trim());
  }
  return { success: true };
}

export function isSellerAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_AUTH_KEY) === "true";
}

export function setSellerAuthenticated(auth: boolean): void {
  if (typeof window === "undefined") return;
  if (auth) {
    sessionStorage.setItem(SESSION_AUTH_KEY, "true");
  } else {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
  }
}
