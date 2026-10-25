import React, { useState, useEffect } from "react";
import { ShoppingBag, FileText } from "lucide-react";
import { useCart } from "../context/CartContext";
import { PRODUCTS } from "../data/products";
import { formatProductName } from "../utils/productUtils";

export const MobileQuickBar: React.FC = () => {
  const { addItem, setIsCartOpen, setIsQuotationOpen, products, activeDepartment } = useCart();
  const [visible, setVisible] = useState(false);

  // Star product is first catalog product
  const starProduct = products[0] || PRODUCTS[0];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible || activeDepartment !== "solar" || !starProduct) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 block md:hidden border-t border-border/80 bg-background/95 backdrop-blur-xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-2xl animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between gap-2.5">
        {/* Product Info */}
        <div className="flex items-center gap-2 overflow-hidden">
          <img
            src={starProduct.image}
            alt={starProduct.name}
            className="h-10 w-10 object-cover rounded-xl border border-border bg-card shrink-0"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-foreground truncate font-serif leading-tight">
              {formatProductName(starProduct.name)}
            </h4>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xs font-black text-solar-ink font-serif">
                ${starProduct.price.toFixed(2)}
              </span>
              <span className="text-[11px] text-muted-foreground font-semibold">USD</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsQuotationOpen(true)}
            className="pressable inline-flex items-center gap-1 rounded-full border border-solar/40 bg-solar/15 hover:bg-solar hover:text-solar-foreground px-3 py-2 text-xs font-bold text-foreground cursor-pointer transition-colors"
            title="Abrir cotizador oficial"
          >
            <FileText aria-hidden="true" className="h-3.5 w-3.5 text-solar-ink" />
            <span>Cotizar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              addItem(starProduct, 1);
              setIsCartOpen(true);
            }}
            className="pressable inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/95 cursor-pointer"
          >
            <ShoppingBag aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Comprar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
