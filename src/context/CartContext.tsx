import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem } from "../types/store";
import { PRODUCTS } from "../data/products";
import { toast } from "sonner";
import { mergeLivePrices, syncPricesFromGoogleSheet } from "../services/pricingSync";
import { PRICING_SHEET_CONFIG } from "../config/pricingSheet";
import { isSupabaseConfigured } from "../lib/supabase";
import {
  updateProductInCatalog,
  addProductToCatalog,
  deleteProductFromCatalog,
  resetCatalogToDefault,
  subscribeToCatalogChanges,
} from "../services/productCatalogService";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  freeShippingThreshold: number;
  couponCode: string;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isQuotationOpen: boolean;
  setIsQuotationOpen: (open: boolean) => void;
  nightMode: boolean;
  setNightMode: (mode: boolean | ((prev: boolean) => boolean)) => void;
  activeDepartment: "general" | "solar" | "muebles" | "accesorios";
  setActiveDepartment: (dept: "general" | "solar" | "muebles" | "accesorios") => void;
  isSyncingPrices: boolean;
  syncLivePricesNow: () => Promise<void>;
  lastPriceSyncTime: Date | null;
  products: Product[];
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetProducts: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "solara_cart_items_v1";

/**
 * Formato persistido: solo id + cantidad. Nunca se guardan precios ni
 * nombres en localStorage, para que nadie pueda alterar el total editando
 * el almacenamiento del navegador.
 */
interface StoredCartEntry {
  productId?: string;
  quantity?: number;
  product?: { id?: string };
}

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry: StoredCartEntry) => {
        const id = entry.productId || entry.product?.id;
        if (!id) return null;

        const officialProduct = PRODUCTS.find((p) => p.id === id);
        if (!officialProduct) return null;

        const qty =
          typeof entry.quantity === "number" && entry.quantity > 0
            ? Math.min(999, Math.floor(entry.quantity))
            : 1;

        return { product: officialProduct, quantity: qty } as CartItem;
      })
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // El carrito arranca vacío también en el cliente: así el HTML del servidor y
  // el primer render del cliente coinciden (sin hydration mismatch). Lo
  // guardado se restaura en un efecto, ya con el componente montado.
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [nightMode, setNightMode] = useState(true);
  const [couponCode, setCouponCode] = useState<string>("");
  const [isSyncingPrices, setIsSyncingPrices] = useState(false);
  const [lastPriceSyncTime, setLastPriceSyncTime] = useState<Date | null>(null);

  // Catálogo reactivo. Arranca con el catálogo estático (idéntico en servidor y
  // cliente, sin hydration mismatch) y se sustituye por el de Supabase al montar.
  const [products, setProducts] = useState<Product[]>(() => [...PRODUCTS]);

  // Restaurar el carrito guardado después del montaje (solo id + cantidad).
  // `cartReady` evita que el efecto de guardado escriba un carrito vacío antes
  // de que termine la restauración.
  useEffect(() => {
    const restored = readStoredCart();
    if (restored.length > 0) {
      setItems(restored);
    }
    setCartReady(true);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToCatalogChanges((updated) => {
      setProducts(updated);
      setItems((prevItems) =>
        prevItems.map((cartItem) => {
          const fresh = updated.find((p) => p.id === cartItem.product.id);
          return fresh ? { ...cartItem, product: fresh } : cartItem;
        })
      );
    });
    return unsubscribe;
  }, []);

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    const updated = await updateProductInCatalog(id, updates);
    setProducts(updated);
  };

  const handleAddProduct = async (newProd: Product) => {
    const updated = await addProductToCatalog(newProd);
    setProducts(updated);
  };

  const handleDeleteProduct = async (id: string) => {
    const updated = await deleteProductFromCatalog(id);
    setProducts(updated);
  };

  const handleResetProducts = () => {
    const defaultCatalog = resetCatalogToDefault();
    setProducts(defaultCatalog);
  };

  // Precios desde Google Sheets SOLO cuando Supabase no está configurado.
  // Con Supabase, el catálogo (y sus precios) es la única fuente autoritativa.
  const syncLivePricesNow = async () => {
    if (isSupabaseConfigured()) return;
    if (!PRICING_SHEET_CONFIG.enabled || !PRICING_SHEET_CONFIG.sheetId) return;

    setIsSyncingPrices(true);
    try {
      const live = await syncPricesFromGoogleSheet();
      if (live) {
        setProducts((prev) => mergeLivePrices(prev, live));
        setItems((prev) =>
          prev.map((item) => {
            const updated = live[item.product.id];
            if (updated && updated.price > 0 && item.product.price !== updated.price) {
              return {
                ...item,
                product: { ...item.product, price: updated.price },
              };
            }
            return item;
          }),
        );
        setLastPriceSyncTime(new Date());
      }
    } catch (err) {
      console.warn("Pricing sync failed:", err);
    } finally {
      setIsSyncingPrices(false);
    }
  };

  // Sincronización periódica y al volver a la pestaña (solo modo sin Supabase).
  useEffect(() => {
    if (isSupabaseConfigured()) return;
    if (!PRICING_SHEET_CONFIG.enabled || !PRICING_SHEET_CONFIG.sheetId) return;

    syncLivePricesNow();

    const interval = setInterval(() => {
      syncLivePricesNow();
    }, PRICING_SHEET_CONFIG.autoSyncIntervalMs);

    const handleVisibility = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        syncLivePricesNow();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [activeDepartment, setActiveDepartmentState] = useState<"general" | "solar" | "muebles" | "accesorios">(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes("solar") || hash.includes("catalogo")) return "solar";
      if (hash.includes("mueble")) return "muebles";
      if (hash.includes("accesorio")) return "accesorios";
    }
    return "general";
  });

  const setActiveDepartment = (dept: "general" | "solar" | "muebles" | "accesorios") => {
    setActiveDepartmentState(dept);
    if (typeof window !== "undefined") {
      const targetHash = dept === "general" ? "" : `#${dept}`;
      if (window.location.pathname !== "/" && window.location.pathname !== "") {
        window.location.href = `/${targetHash}`;
      } else {
        if (dept === "general") {
          window.history.replaceState(null, "", window.location.pathname);
        } else {
          window.history.replaceState(null, "", `${window.location.pathname}#${dept}`);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // Sync hash changes from browser history back/forward
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes("solar") || hash.includes("catalogo")) setActiveDepartmentState("solar");
      else if (hash.includes("mueble")) setActiveDepartmentState("muebles");
      else if (hash.includes("accesorio")) setActiveDepartmentState("accesorios");
      else if (hash === "" || hash.includes("departamentos") || hash.includes("general")) setActiveDepartmentState("general");
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Sync nightMode to document dark class for complete ambient theme
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (nightMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [nightMode]);

  // Persistir SOLO id + cantidad. Nunca se guardan precios ni objetos de
  // producto: así manipular localStorage no puede alterar el total.
  useEffect(() => {
    if (!cartReady) return;
    if (typeof window === "undefined") return;
    try {
      const payload = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items, cartReady]);

  const addItem = (product: Product, quantity = 1) => {
    // Se resuelve contra el catálogo vivo (Supabase), no contra PRODUCTS.
    const officialProduct = products.find((p) => p.id === product.id) || product;
    const validQty = Math.max(1, Math.floor(quantity));

    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === officialProduct.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === officialProduct.id
            ? { product: officialProduct, quantity: item.quantity + validQty }
            : item
        );
      }
      return [...prev, { product: officialProduct, quantity: validQty }];
    });

    toast.success(`¡"${officialProduct.name}" añadido al carrito!`, {
      description: `${validQty} unidad${validQty > 1 ? "es" : ""} lista${validQty > 1 ? "s" : ""}. Precio: $${officialProduct.price.toFixed(2)} USD`,
      action: {
        label: "Ver carrito",
        onClick: () => setIsCartOpen(true),
      },
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (item) {
        toast.info(`Se eliminó "${item.product.name}" del carrito`);
      }
      return prev.filter((i) => i.product.id !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    const validQty = Math.min(999, Math.floor(quantity));
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: validQty } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode("");
  };

  const applyCoupon = (_code: string): boolean => false;
  const removeCoupon = () => {
    setCouponCode("");
    toast.info("Cupón retirado");
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const discount = 0;
  // Por el momento no hay envíos gratis; el costo de envío se coordina según la empresa de encomienda
  const shipping = 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount,
        shipping,
        total,
        freeShippingThreshold: 0,
        couponCode,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
        quickViewProduct,
        setQuickViewProduct,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isQuotationOpen,
        setIsQuotationOpen,
        nightMode,
        setNightMode,
        activeDepartment,
        setActiveDepartment,
        isSyncingPrices,
        syncLivePricesNow,
        lastPriceSyncTime,
        products,
        updateProduct: handleUpdateProduct,
        addProduct: handleAddProduct,
        deleteProduct: handleDeleteProduct,
        resetProducts: handleResetProducts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
