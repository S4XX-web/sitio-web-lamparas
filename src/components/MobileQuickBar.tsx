import React, { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { PRODUCTS } from "../data/products";

export const MobileQuickBar: React.FC = () => {
  const { addItem, setIsCartOpen } = useCart();
  const [visible, setVisible] = useState(false);

  // Star product is Rolinger 1200W
  const starProduct = PRODUCTS[0];

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

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 block md:hidden border-t border-border/80 bg-background/95 backdrop-blur-xl px-4 py-2.5 shadow-2xl animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between gap-3">
        {/* Product Info */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <img
            src={starProduct.image}
            alt={starProduct.name}
            className="h-10 w-10 object-cover rounded-xl border border-border bg-card shrink-0"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-foreground truncate font-serif leading-tight">
              Rolinger 1200W
            </h4>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xs font-black text-solar font-serif">
                ${starProduct.price.toFixed(2)}
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold">USD</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            addItem(starProduct, 1);
            setIsCartOpen(true);
          }}
          className="pressable inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/95 cursor-pointer shrink-0"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Añadir al Carrito</span>
        </button>
      </div>
    </div>
  );
};
