import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Star,
  ShoppingBag,
  Zap,
  BatteryCharging,
  Shield,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  Wrench,
} from "lucide-react";
import { PRODUCTS } from "../data/products";
import { useCart } from "../context/CartContext";
import { PromoBanner } from "../components/PromoBanner";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ProductCard } from "../components/ProductCard";

export const Route = createFileRoute("/producto/$productId")({
  head: ({ params }) => {
    const product = PRODUCTS.find((p) => p.id === params.productId);
    return {
      meta: [
        {
          title: product
            ? `${product.name} • Solar y Hogar Panamá`
            : "Lámpara Solar • Solar y Hogar Panamá",
        },
        {
          name: "description",
          content: product?.tagline || "Lámparas solares de alta potencia en Panamá con despacho a nivel nacional.",
        },
      ],
    };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const product = PRODUCTS.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
        <Navbar />
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 my-20">
          <h1 className="font-serif text-3xl font-bold">Lámpara no encontrada</h1>
          <p className="text-muted-foreground text-sm max-w-md">
            El modelo que buscas no existe o ha sido reubicado en nuestro catálogo.
          </p>
          <Link
            to="/"
            className="pressable inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Volver al catálogo
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { addItem, nightMode, setNightMode, setIsCartOpen } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    setIsCartOpen(true);
  };

  const handleWhatsAppOrder = () => {
    const totalLine = (product.price * quantity).toFixed(2);
    const message = `*CONSULTA DE PEDIDO - SOLAR Y HOGAR PANAMA*
Hola equipo de Solar y Hogar, me gustaria pedir el siguiente producto:
- Producto: ${product.name}
- Cantidad: ${quantity} unidad(es)
- Precio unitario: $${product.price.toFixed(2)} USD
- Subtotal: $${totalLine} USD
- Envio: Transporte Ferguson / Uno Express (sucursal) o Servientrega (puerta a puerta o sucursal)

Me confirman disponibilidad y datos para coordinar el despacho? Muchas gracias.`;

    window.open(`https://wa.me/50769893055?text=${encodeURIComponent(message)}`, "_blank");
  };

  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-solar/30 selection:text-solar-foreground">
      {/* Top Banner */}
      <PromoBanner />

      {/* Main Navbar */}
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-solar transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <a href="/#catalogo" className="hover:text-solar transition-colors">
            Catálogo
          </a>
          <span>/</span>
          <span className="font-semibold text-foreground truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Product Image Carousel (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Showcase Image Container */}
            <div className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
              <img
                src={images[activeImageIndex]}
                alt={`${product.name} - Foto ${activeImageIndex + 1}`}
                className="h-full w-full object-cover transition-all duration-500 ease-out"
              />

              {nightMode && (
                <div className="absolute inset-0 bg-amber-500/10 pointer-events-none mix-blend-color-dodge transition-opacity duration-700" />
              )}

              {/* Badges on Image */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                {product.badge && (
                  <span className="glass-chip rounded-full px-3.5 py-1 text-xs font-extrabold text-solar-foreground shadow-md backdrop-blur-md">
                    {product.badge}
                  </span>
                )}
                <span className="rounded-full bg-emerald-600/90 px-3 py-0.5 text-xs font-bold text-white shadow-md self-start">
                  Disponible
                </span>
              </div>

              {/* Night View Preview Button */}
              <button
                type="button"
                onClick={() => setNightMode((prev) => !prev)}
                className="pressable absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/80 transition-all shadow-md cursor-pointer"
                title="Alternar vista de iluminación nocturna"
              >
                {nightMode ? (
                  <>
                    <Sun aria-hidden="true" className="h-3.5 w-3.5 text-solar" />
                    <span>Luz Diurna</span>
                  </>
                ) : (
                  <>
                    <Moon aria-hidden="true" className="h-3.5 w-3.5 text-solar" />
                    <span>Simular Encendida</span>
                  </>
                )}
              </button>

              {/* Prev / Next Carousel Controls */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="pressable absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/80 transition-all cursor-pointer shadow-md"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="pressable absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/80 transition-all cursor-pointer shadow-md"
                    aria-label="Siguiente foto"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Image Counter Badge */}
              <div className="absolute bottom-4 right-4 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white font-mono">
                {activeImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`pressable relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl border-2 cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-solar ring-2 ring-solar/40 scale-102"
                        : "border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1} de ${product.name}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Information & Purchase (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} aria-hidden="true" className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-foreground">{product.rating.toFixed(1)}</span>
                <span>({product.reviewsCount} reseñas verificadas)</span>
              </div>

              {/* Title & Tagline */}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                {product.name}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {product.tagline}
              </p>
            </div>

            {/* Pricing Section */}
            <div className="rounded-3xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-solar font-serif">
                  ${product.price.toFixed(2)} USD
                </span>
                <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-xs font-bold">
                  Despachos a todo Panamá
                </span>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-full border border-border bg-card p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="pressable flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-secondary font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-sm">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="pressable flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-secondary font-bold text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="pressable flex-1 flex items-center justify-center gap-2.5 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground py-3.5 px-6 font-bold text-sm sm:text-base shadow-lg cursor-pointer"
                >
                  <ShoppingBag aria-hidden="true" className="h-5 w-5" />
                  <span>Añadir al Carrito</span>
                </button>
              </div>

              {/* Direct WhatsApp Order Button */}
              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="pressable w-full flex items-center justify-center gap-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-6 font-bold text-sm shadow-md cursor-pointer"
              >
                <MessageCircle aria-hidden="true" className="h-5 w-5" />
                <span>Pedir este Modelo por WhatsApp</span>
              </button>
            </div>

            {/* Payment & Guarantees Badges */}
            <div className="rounded-2xl border border-border bg-sand/40 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Pago seguro: Yappy (Banco General) o transferencia bancaria ACH</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wrench aria-hidden="true" className="h-4 w-4 text-solar shrink-0" />
                <span>Instalación práctica sin cables (incluye tornillería; requiere herramientas básicas)</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield aria-hidden="true" className="h-4 w-4 text-solar shrink-0" />
                <span>Envíos por Ferguson y Uno Express (sucursal) o Servientrega (puerta a puerta)</span>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="spring-card rounded-2xl border border-border bg-card p-3.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Zap aria-hidden="true" className="h-4 w-4 text-solar" />
                  Luminosidad
                </span>
                <span className="font-bold text-foreground text-sm font-mono">{product.lumens}</span>
              </div>

              <div className="spring-card rounded-2xl border border-border bg-card p-3.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <BatteryCharging aria-hidden="true" className="h-4 w-4 text-emerald-500" />
                  Autonomía
                </span>
                <span className="font-bold text-foreground text-sm font-mono">{product.batteryLife}</span>
              </div>

              <div className="spring-card rounded-2xl border border-border bg-card p-3.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Shield aria-hidden="true" className="h-4 w-4 text-primary" />
                  Resistencia
                </span>
                <span className="font-bold text-foreground text-sm font-mono">{product.waterproof}</span>
              </div>

              <div className="spring-card rounded-2xl border border-border bg-card p-3.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Sun aria-hidden="true" className="h-4 w-4 text-amber-500" />
                  Días Nublados
                </span>
                <span className="font-bold text-foreground text-sm">40-60% carga (6-8h)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Accordions / Tabs */}
        <div className="mt-16 border-t border-border pt-12 space-y-8">
          <div className="max-w-3xl">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
              Descripción detallada
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              {product.description}
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-8 mb-4">
              Características y beneficios principales
            </h3>
            <ul className="space-y-2.5">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Sparkles aria-hidden="true" className="h-4 w-4 text-solar shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Related Products Carousel */}
        <div className="mt-20 border-t border-border pt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Otras lámparas que te pueden gustar
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Completa la iluminación exterior de tu propiedad
              </p>
            </div>
            <Link
              to="/"
              className="pressable text-xs font-bold text-solar hover:underline flex items-center gap-1"
            >
              <span>Ver catálogo completo</span>
              <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5 rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      </main>

      {/* Main Footer */}
      <Footer />
    </div>
  );
}
