import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Product, ProductDepartment } from "../types/store";
import {
  isSellerAuthenticated,
  setSellerAuthenticated,
  verifyPin,
  changeSellerPin,
  getStoredPin,
  saveCatalog,
} from "../services/productCatalogService";
import { toast } from "sonner";
import {
  Lock,
  Unlock,
  KeyRound,
  Plus,
  Trash2,
  Edit,
  Copy,
  Save,
  RotateCcw,
  Download,
  Upload,
  ArrowLeft,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  Sun,
  Sofa,
  Watch,
  DollarSign,
  Package,
  Layers,
  Image as ImageIcon,
  Tag,
  FileText,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel Privado de Vendedor — Solar y Hogar" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const { products, updateProduct, addProduct, deleteProduct, resetProducts } = useCart();

  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");
  const [showPin, setShowPin] = useState<boolean>(false);

  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("todos");

  // Modal de edición / creación de producto
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Modal para cambiar PIN
  const [isChangePinOpen, setIsChangePinOpen] = useState<boolean>(false);
  const [oldPinInput, setOldPinInput] = useState<string>("");
  const [newPinInput, setNewPinInput] = useState<string>("");
  const [confirmPinInput, setConfirmPinInput] = useState<string>("");

  // Precios en edición rápida inline
  const [inlinePrices, setInlinePrices] = useState<Record<string, { price: string; originalPrice: string }>>({});

  useEffect(() => {
    setIsAuthenticated(isSellerAuthenticated());
  }, []);

  // Actualizar inline prices cuando cambian los productos
  useEffect(() => {
    const map: Record<string, { price: string; originalPrice: string }> = {};
    products.forEach((p) => {
      map[p.id] = {
        price: p.price.toString(),
        originalPrice: p.originalPrice ? p.originalPrice.toString() : p.price.toString(),
      };
    });
    setInlinePrices(map);
  }, [products]);

  // Manejar Login con PIN
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (verifyPin(pinInput)) {
      setSellerAuthenticated(true);
      setIsAuthenticated(true);
      setPinError("");
      setPinInput("");
      toast.success("¡Bienvenido al Panel de Vendedor!", {
        description: "Acceso concedido a la gestión de productos y precios.",
      });
    } else {
      setPinError("El PIN ingresado es incorrecto.");
      toast.error("PIN Incorrecto", {
        description: "Verifica el PIN de acceso del vendedor.",
      });
    }
  };

  const handleLogout = () => {
    setSellerAuthenticated(false);
    setIsAuthenticated(false);
    toast.info("Sesión cerrada");
  };

  const handlePinKeypad = (digit: string) => {
    if (digit === "CLEAR") {
      setPinInput("");
      setPinError("");
    } else if (digit === "BACK") {
      setPinInput((prev) => prev.slice(0, -1));
    } else {
      if (pinInput.length < 8) {
        setPinInput((prev) => prev + digit);
      }
    }
  };

  // Guardado rápido de precio inline
  const handleQuickSavePrice = (productId: string) => {
    const current = inlinePrices[productId];
    if (!current) return;

    const p = parseFloat(current.price.replace(",", "."));
    const orig = parseFloat(current.originalPrice.replace(",", "."));

    if (isNaN(p) || p <= 0) {
      toast.error("Precio inválido", { description: "Ingresa un número mayor a 0." });
      return;
    }

    updateProduct(productId, {
      price: p,
      originalPrice: !isNaN(orig) && orig >= p ? orig : p,
    });

    toast.success("Precio actualizado", {
      description: `El precio ahora es $${p.toFixed(2)} USD`,
    });
  };

  // Toggle Stock directo
  const handleToggleStock = (product: Product) => {
    const nextStock = !product.inStock;
    updateProduct(product.id, { inStock: nextStock });
    toast.info(nextStock ? "Producto marcado en stock" : "Producto marcado como agotado", {
      description: product.name,
    });
  };

  // Duplicar producto
  const handleDuplicateProduct = (product: Product) => {
    const copy: Product = {
      ...product,
      id: `${product.id}-copia-${Math.floor(Math.random() * 1000)}`,
      name: `${product.name} (Copia)`,
      badge: "Nuevo",
    };
    addProduct(copy);
    toast.success("Producto duplicado", {
      description: `Se creó una copia de ${product.name}. Puedes editarla ahora.`,
    });
  };

  // Eliminar producto
  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`¿Estás seguro de eliminar "${product.name}" del catálogo?`)) {
      deleteProduct(product.id);
      toast.warning("Producto eliminado", { description: product.name });
    }
  };

  // Abrir modal para crear nuevo
  const handleStartCreateNew = () => {
    const newTemplate: Product = {
      id: `prod-${Date.now().toString().slice(-6)}`,
      name: "",
      tagline: "",
      department: "solar",
      category: "farolas",
      price: 50.0,
      originalPrice: 50.0,
      rating: 5.0,
      reviewsCount: 1,
      image: "/products/lampara-1200w/image-1.jpg",
      images: ["/products/lampara-1200w/image-1.jpg"],
      badge: "Nuevo",
      inStock: true,
      lumens: "Alta Potencia",
      batteryLife: "10-12 Horas",
      waterproof: "IP66",
      description: "Descripción detallada del producto...",
      features: ["Característica principal 1", "Característica principal 2"],
    };
    setEditingProduct(newTemplate);
    setIsCreatingNew(true);
  };

  // Guardar modal completo de producto
  const handleSaveModalProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
      toast.error("El nombre del producto es obligatorio");
      return;
    }

    if (isCreatingNew) {
      addProduct(editingProduct);
      toast.success("¡Producto creado con éxito!", {
        description: `${editingProduct.name} ya está disponible en la tienda.`,
      });
    } else {
      updateProduct(editingProduct.id, editingProduct);
      toast.success("Producto guardado", {
        description: `Los cambios en ${editingProduct.name} han sido aplicados.`,
      });
    }

    setEditingProduct(null);
    setIsCreatingNew(false);
  };

  // Exportar catálogo JSON
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `catalogo_solara_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Copia de seguridad descargada en JSON");
  };

  // Importar catálogo JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].name) {
          saveCatalog(parsed);
          window.location.reload();
          toast.success("Catálogo importado y restaurado con éxito");
        } else {
          toast.error("El archivo JSON no tiene un formato válido de productos");
        }
      } catch (err) {
        toast.error("Error al leer el archivo JSON", { description: String(err) });
      }
    };
    reader.readAsText(file);
  };

  // Restablecer catálogo original
  const handleResetCatalog = () => {
    if (
      window.confirm(
        "¿Deseas restablecer el catálogo a los productos de fábrica originales? Se perderán las modificaciones no respaldadas."
      )
    ) {
      resetProducts();
      toast.info("Catálogo restablecido a valores iniciales");
    }
  };

  // Cambiar PIN de vendedor
  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput !== confirmPinInput) {
      toast.error("El nuevo PIN y la confirmación no coinciden");
      return;
    }
    const res = changeSellerPin(oldPinInput, newPinInput);
    if (res.success) {
      toast.success("¡PIN de vendedor cambiado correctamente!");
      setIsChangePinOpen(false);
      setOldPinInput("");
      setNewPinInput("");
      setConfirmPinInput("");
    } else {
      toast.error(res.error || "Error al cambiar el PIN");
    }
  };

  // Subir imagen local a Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen supera los 2MB. Te recomendamos una imagen más ligera.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (isGallery) {
        setEditingProduct({
          ...editingProduct,
          images: [...(editingProduct.images || []), dataUrl],
        });
      } else {
        setEditingProduct({
          ...editingProduct,
          image: dataUrl,
          images: editingProduct.images?.length ? [dataUrl, ...editingProduct.images.slice(1)] : [dataUrl],
        });
      }
      toast.success("Foto cargada con éxito");
    };
    reader.readAsDataURL(file);
  };

  // Filtro de productos
  const filteredProducts = products.filter((prod) => {
    const matchesDept =
      selectedDeptFilter === "todos" ||
      (selectedDeptFilter === "solar" && (prod.department === "solar" || !prod.department)) ||
      prod.department === selectedDeptFilter;

    const matchesSearch =
      !searchQuery.trim() ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.tagline?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesSearch;
  });

  // Estadísticas rápidas
  const totalCount = products.length;
  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = totalCount - inStockCount;
  const solarCount = products.filter((p) => p.department === "solar" || !p.department).length;
  const homeCount = products.filter((p) => p.department === "muebles" || p.department === "accesorios").length;

  // ----------------------------------------------------------------------
  // PANTALLA DE ACCESO CON PIN (BLOQUEADO)
  // ----------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 text-center">
          {/* Logo y Encabezado */}
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Lock className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 rounded-full mb-2">
            Área Restringida
          </span>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Panel de Vendedor
          </h1>

          <p className="text-sm text-slate-400 mb-6">
            Ingresa tu PIN de seguridad para gestionar precios, inventario y catálogo.
          </p>

          {/* Formulario PIN */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError("");
                }}
                placeholder="Ingresar PIN"
                className="w-full text-center text-2xl tracking-[0.3em] font-mono py-3.5 px-4 bg-slate-950/70 border border-slate-700 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                title="Mostrar/Ocultar PIN"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {pinError && (
              <p className="text-sm text-red-400 flex items-center justify-center gap-1.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4" />
                {pinError}
              </p>
            )}

            {/* Teclado numérico táctil para celular */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto pt-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLEAR", "0", "BACK"].map((btn) => (
                <button
                  key={btn}
                  type="button"
                  onClick={() => handlePinKeypad(btn)}
                  className={`py-3 rounded-xl font-semibold text-lg transition-all active:scale-95 ${
                    btn === "CLEAR" || btn === "BACK"
                      ? "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white text-xs uppercase"
                      : "bg-slate-800/80 text-white hover:bg-slate-700/80"
                  }`}
                >
                  {btn === "BACK" ? "⌫" : btn === "CLEAR" ? "Borrar" : btn}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-base shadow-lg shadow-amber-500/20 transition-all transform active:scale-98 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-5 h-5" />
              Desbloquear Panel
            </button>
          </form>

          {/* Ayuda de PIN por defecto */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-xs text-slate-500">
            <p>
              PIN inicial predeterminado: <strong className="text-amber-400/90 font-mono">2026</strong>
            </p>
            <p className="mt-1">Podrás cambiarlo en cualquier momento dentro del panel.</p>
          </div>

          {/* Enlace para volver a la tienda */}
          <div className="mt-5">
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Regresar a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // PANEL PRINCIPAL DE ADMINISTRACIÓN (DESBLOQUEADO)
  // ----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased pb-24">
      {/* Barra superior de administración */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">SOLAR & HOGAR</span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 rounded-md">
                  Panel Vendedor
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Control total de precios, inventario y productos</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Ver Tienda
            </Link>

            <button
              onClick={() => setIsChangePinOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5"
              title="Cambiar PIN de seguridad"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Cambiar PIN</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-medium text-red-300 transition-colors flex items-center gap-1.5"
              title="Cerrar Sesión"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8 space-y-6">
        {/* Banner de bienvenida y métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Catálogo Total</p>
              <p className="text-xl font-bold text-white">{totalCount} productos</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">En Stock</p>
              <p className="text-xl font-bold text-emerald-400">{inStockCount} listos</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Energía Solar</p>
              <p className="text-xl font-bold text-amber-400">{solarCount} modelos</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sofa className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Muebles & Hogar</p>
              <p className="text-xl font-bold text-purple-400">{homeCount} publicados</p>
            </div>
          </div>
        </div>

        {/* Barra de herramientas y filtros */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, ID, potencia..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Filtros de departamento */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: "todos", label: "Todos" },
              { id: "solar", label: "Solar" },
              { id: "muebles", label: "Muebles" },
              { id: "accesorios", label: "Accesorios" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedDeptFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedDeptFilter === tab.id
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Acciones principales */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartCreateNew}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Nuevo Producto
            </button>

            {/* Menú de respaldo */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleExportJson}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                title="Descargar respaldo JSON del catálogo"
              >
                <Download className="w-4 h-4" />
              </button>

              <label
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                title="Restaurar catálogo desde JSON"
              >
                <Upload className="w-4 h-4" />
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>

              <button
                onClick={handleResetCatalog}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 hover:text-red-300 text-slate-400 text-xs font-medium transition-colors"
                title="Restablecer productos originales de fábrica"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        {filteredProducts.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-12 text-center">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No se encontraron productos</h3>
            <p className="text-xs text-slate-400 mb-4">
              Prueba cambiando el filtro o agrega un nuevo producto al catálogo.
            </p>
            <button
              onClick={handleStartCreateNew}
              className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl"
            >
              + Crear Producto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((prod) => {
              const currentInline = inlinePrices[prod.id] || {
                price: prod.price.toString(),
                originalPrice: prod.originalPrice.toString(),
              };

              return (
                <div
                  key={prod.id}
                  className={`bg-slate-900/90 border rounded-2xl overflow-hidden transition-all flex flex-col ${
                    prod.inStock ? "border-slate-800 hover:border-slate-700" : "border-red-900/40 opacity-80"
                  }`}
                >
                  {/* Encabezado de la tarjeta con imagen */}
                  <div className="p-4 flex gap-3.5 items-start">
                    <div className="relative w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/products/lampara-1200w/image-1.jpg";
                        }}
                      />
                      {!prod.inStock && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Agotado</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                            prod.department === "muebles"
                              ? "bg-purple-500/20 text-purple-300"
                              : prod.department === "accesorios"
                              ? "bg-sky-500/20 text-sky-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {prod.department || "solar"}
                        </span>
                        {prod.badge && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded-md truncate max-w-[120px]">
                            {prod.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-white leading-snug line-clamp-2" title={prod.name}>
                        {prod.name}
                      </h3>

                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {prod.id}</p>
                    </div>
                  </div>

                  {/* Precios e inventario rápido */}
                  <div className="px-4 py-3 bg-slate-950/60 border-t border-b border-slate-800/80 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-medium text-slate-400 block mb-1">Precio Venta ($)</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-amber-400 font-bold">
                            $
                          </span>
                          <input
                            type="text"
                            value={currentInline.price}
                            onChange={(e) =>
                              setInlinePrices({
                                ...inlinePrices,
                                [prod.id]: { ...currentInline, price: e.target.value },
                              })
                            }
                            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-medium text-slate-400 block mb-1">PVP Tachado ($)</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500">$</span>
                          <input
                            type="text"
                            value={currentInline.originalPrice}
                            onChange={(e) =>
                              setInlinePrices({
                                ...inlinePrices,
                                [prod.id]: { ...currentInline, originalPrice: e.target.value },
                              })
                            }
                            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-6 pr-2 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {/* Switch de stock */}
                      <button
                        type="button"
                        onClick={() => handleToggleStock(prod)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                          prod.inStock
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {prod.inStock ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {prod.inStock ? "Disponible" : "Agotado"}
                      </button>

                      {/* Botón aplicar precio */}
                      <button
                        type="button"
                        onClick={() => handleQuickSavePrice(prod.id)}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Save className="w-3 h-3" />
                        Guardar Precio
                      </button>
                    </div>
                  </div>

                  {/* Acciones de la tarjeta */}
                  <div className="p-3 mt-auto flex items-center justify-between gap-1.5 bg-slate-900/40 text-xs">
                    <button
                      onClick={() => {
                        setEditingProduct({ ...prod });
                        setIsCreatingNew(false);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 text-amber-400" />
                      Editar Todo
                    </button>

                    <button
                      onClick={() => handleDuplicateProduct(prod)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Duplicar producto"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(prod)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL COMPLETO DE CREACIÓN / EDICIÓN DE PRODUCTO                       */}
      {/* ---------------------------------------------------------------------- */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
            {/* Cabecera del modal */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  {isCreatingNew ? "Nuevo Producto" : "Editar Ficha de Producto"}
                </span>
                <h2 className="text-xl font-bold text-white">
                  {isCreatingNew ? "Agregar Producto al Catálogo" : editingProduct.name || "Sin nombre"}
                </h2>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModalProduct} className="space-y-5">
              {/* Información básica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="Ej: Farola Solar 1200W Rolinger / Sillón Nórdico Teca"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Departamento</label>
                  <select
                    value={editingProduct.department || "solar"}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        department: e.target.value as ProductDepartment,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="solar">Iluminación Solar</option>
                    <option value="muebles">Muebles para el Hogar</option>
                    <option value="accesorios">Accesorios del Hogar</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Categoría / Tipo</label>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value as any,
                      })
                    }
                    placeholder="farolas, reflector, muebles, decoracion..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Etiqueta / Badge</label>
                  <input
                    type="text"
                    value={editingProduct.badge || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    placeholder="Ej: Más Vendido, Oferta Especial, 1200W"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">ID del Producto (único)</label>
                  <input
                    type="text"
                    value={editingProduct.id}
                    onChange={(e) => setEditingProduct({ ...editingProduct, id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Precios e inventario */}
              <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Precio de Venta ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Precio Anterior Tachado ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProduct.originalPrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        originalPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Estado de Stock</label>
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, inStock: !editingProduct.inStock })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      editingProduct.inStock
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {editingProduct.inStock ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {editingProduct.inStock ? "Disponible para Venta" : "Marcado como Agotado"}
                  </button>
                </div>
              </div>

              {/* Subtítulo y Descripción */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Frase Resumen (Tagline)</label>
                  <input
                    type="text"
                    value={editingProduct.tagline}
                    onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                    placeholder="Ej: Iluminación inteligente de gran alcance con sensor y cero consumo eléctrico"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Descripción Detallada</label>
                  <textarea
                    rows={4}
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Escribe los detalles completos, materiales, usos recomendados..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>
              </div>

              {/* Especificaciones rápidas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Potencia / Lúmenes</label>
                  <input
                    type="text"
                    value={editingProduct.lumens}
                    onChange={(e) => setEditingProduct({ ...editingProduct, lumens: e.target.value })}
                    placeholder="Ej: 1200W • Matriz LED"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Batería / Material</label>
                  <input
                    type="text"
                    value={editingProduct.batteryLife}
                    onChange={(e) => setEditingProduct({ ...editingProduct, batteryLife: e.target.value })}
                    placeholder="Ej: 10-12h (Radar) / Madera Teca"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Protección / Garantía</label>
                  <input
                    type="text"
                    value={editingProduct.waterproof}
                    onChange={(e) => setEditingProduct({ ...editingProduct, waterproof: e.target.value })}
                    placeholder="Ej: IP66 Impermeable / Garantía 1 año"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Imagen principal y galería */}
              <div className="space-y-3 p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Foto Principal del Producto</label>
                  <label className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer inline-flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    Subir foto desde dispositivo
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} className="hidden" />
                  </label>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0">
                    <img
                      src={editingProduct.image}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/products/lampara-1200w/image-1.jpg";
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    value={editingProduct.image}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        image: e.target.value,
                        images: editingProduct.images?.length
                          ? [e.target.value, ...editingProduct.images.slice(1)]
                          : [e.target.value],
                      })
                    }
                    placeholder="URL de la imagen (ej: /products/lampara-1200w/image-1.jpg o enlace web)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Botones de acción modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isCreatingNew ? "Publicar Producto" : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL CAMBIAR PIN DE VENDEDOR                                          */}
      {/* ---------------------------------------------------------------------- */}
      {isChangePinOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                Cambiar PIN de Vendedor
              </h3>
              <button
                onClick={() => setIsChangePinOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePinSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">PIN Actual</label>
                <input
                  type="password"
                  required
                  value={oldPinInput}
                  onChange={(e) => setOldPinInput(e.target.value)}
                  placeholder="PIN actual"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Nuevo PIN (Mínimo 4 caracteres)</label>
                <input
                  type="password"
                  required
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="Nuevo PIN"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Confirmar Nuevo PIN</label>
                <input
                  type="password"
                  required
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  placeholder="Repite el nuevo PIN"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePinOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  Guardar PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
