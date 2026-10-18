import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem } from "../types/store";
import { PRODUCTS } from "../data/products";
import { toast } from "sonner";

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "solara_cart_items_v1";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      // Revalidate product data and price against official catalog to prevent localStorage price tampering
      return parsed
        .map((entry: { product?: { id?: string }; productId?: string; quantity?: number }) => {
          const id = entry.productId || entry.product?.id;
          const officialProduct = PRODUCTS.find((p) => p.id === id);
          const qty = typeof entry.quantity === "number" && entry.quantity > 0 ? Math.min(999, Math.floor(entry.quantity)) : 1;
          if (!officialProduct) return null;
          return { product: officialProduct, quantity: qty };
        })
        .filter((item): item is CartItem => item !== null);
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [nightMode, setNightMode] = useState(true);
  const [couponCode, setCouponCode] = useState<string>("");

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

  // Save only validated items to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save cart to localStorage", e);
      }
    }
  }, [items]);

  const addItem = (product: Product, quantity = 1) => {
    const officialProduct = PRODUCTS.find((p) => p.id === product.id) || product;
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
