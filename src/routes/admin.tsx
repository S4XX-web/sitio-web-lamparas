import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Product, ProductDepartment } from "../types/store";
import { saveCatalog } from "../services/productCatalogService";
import {
  getSellerSession,
  signInSeller,
  signOutSeller,
  onSellerAuthChange,
  isCloudAuthAvailable,
  type SellerSession,
} from "../services/sellerAuth";
import { toast } from "sonner";
import {
  Lock,
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
  Smartphone,
  Share2,
  ClipboardCopy,
  RefreshCw,
  Zap,
  BatteryCharging,
  Shield,
  Database,
  ExternalLink,
  Cloud,
  CloudOff,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import { isSolarProduct, getDepartmentLabel } from "../utils/productUtils";
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  isSupabaseConfigured,
  uploadImageToSupabase,
} from "../lib/supabase";
import { fetchLiveCatalogFromSupabase } from "../services/productCatalogService";
import { listRequests, type RequestSummary } from "../services/requestService";
import schemaSql from "../../supabase-schema.sql?raw";

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

  // Estado de autenticación (Supabase Auth: correo + contraseña)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState<boolean>(false);
  const [sellerEmail, setSellerEmail] = useState<string>("");

  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("todos");

  // Modal de edición / creación de producto
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Modal para sincronizar entre dispositivos (móvil y PC)
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [syncCodeInput, setSyncCodeInput] = useState<string>("");
  const [isCopiedCode, setIsCopiedCode] = useState<boolean>(false);

  // Modal y credenciales de Supabase Cloud
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState<string>("");
  const [supabaseKeyInput, setSupabaseKeyInput] = useState<string>("");
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(isSupabaseConfigured());
  const [isTestingSupabase, setIsTestingSupabase] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  // Precios en edición rápida inline
  const [inlinePrices, setInlinePrices] = useState<Record<string, { price: string; originalPrice: string }>>({});

  useEffect(() => {
    let active = true;
    let settled = false;

    const applySession = (session: SellerSession | null) => {
      if (!active) return;
      settled = true;
      setIsAuthenticated(Boolean(session));
      setSellerEmail(session?.email ?? "");
      setIsAuthChecking(false);
    };

    getSellerSession()
      .then(applySession)
      .catch(() => {
        if (active) setIsAuthChecking(false);
      });
    const unsubscribe = onSellerAuthChange(applySession);

    // Red de seguridad: si la comprobación de sesión no responde (red lenta,
    // Supabase inaccesible), mostramos el formulario en vez de quedarnos colgados.
    const timeout = window.setTimeout(() => {
      if (active && !settled) setIsAuthChecking(false);
    }, 3000);

    const cfg = getSupabaseConfig();
    if (cfg) {
      setSupabaseUrlInput(cfg.url);
      setSupabaseKeyInput(cfg.anonKey);
      setSupabaseConnected(true);
    }

    return () => {
      active = false;
      window.clearTimeout(timeout);
      unsubscribe();
    };
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

  // Solicitudes (cotizaciones y pedidos) registradas en el servidor
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [requestsLoading, setRequestsLoading] = useState<boolean>(false);
  const [requestsError, setRequestsError] = useState<string>("");
  const [isRequestsOpen, setIsRequestsOpen] = useState<boolean>(true);

  const loadRequests = React.useCallback(async () => {
    if (!isAuthenticated || !supabaseConnected) return;
    setRequestsLoading(true);
    setRequestsError("");
    try {
      const list = await listRequests(50);
      if (list === null) {
        setRequests([]);
        setRequestsError(
          "Ejecuta la sección 9 de supabase-schema.sql para activar el registro de solicitudes.",
        );
      } else {
        setRequests(list);
      }
    } catch (err) {
      console.error(err);
      setRequestsError(
        err instanceof Error ? err.message : "No se pudieron cargar las solicitudes.",
      );
    } finally {
      setRequestsLoading(false);
    }
  }, [isAuthenticated, supabaseConnected]);

  useEffect(() => {
    if (isAuthenticated && supabaseConnected) void loadRequests();
  }, [isAuthenticated, supabaseConnected, loadRequests]);

  // Manejar inicio de sesión con Supabase Auth
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAuthSubmitting) return;

    setAuthError("");
    setIsAuthSubmitting(true);

    const res = await signInSeller(emailInput, passwordInput);
    setIsAuthSubmitting(false);

    if (res.session) {
      setIsAuthenticated(true);
      setSellerEmail(res.session.email ?? emailInput.trim());
      setPasswordInput("");
      toast.success("¡Bienvenido al Panel de Vendedor!", {
        description: "Acceso concedido a la gestión de productos y precios.",
      });
    } else {
      setAuthError(res.error || "No se pudo iniciar sesión.");
      toast.error("Acceso denegado", {
        description: res.error || "Verifica tus credenciales de vendedor.",
      });
    }
  };

  const handleLogout = async () => {
    await signOutSeller();
    setIsAuthenticated(false);
    setSellerEmail("");
    toast.info("Sesión cerrada");
  };

  // Guardar credenciales de Supabase desde la pantalla de acceso
  const handleSaveSupabaseFromLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = supabaseUrlInput.trim().replace(/\/+$/, "");
    const cleanKey = supabaseKeyInput.trim();

    if (!cleanUrl || !cleanKey) {
      toast.error("Completa la URL y la clave pública de Supabase");
      return;
    }

    saveSupabaseConfig(cleanUrl, cleanKey);
    toast.success("Conexión guardada", {
      description: "Ahora inicia sesión con tu cuenta de vendedor.",
    });
    setTimeout(() => window.location.reload(), 600);
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
    const isSolarDept = selectedDeptFilter === "solar" || selectedDeptFilter === "todos";
    const dept: ProductDepartment = selectedDeptFilter === "muebles" ? "muebles" : selectedDeptFilter === "accesorios" ? "accesorios" : "solar";
    const cat = dept === "muebles" ? "muebles" : dept === "accesorios" ? "accesorios" : "farolas";

    const newTemplate: Product = {
      id: `prod-${Date.now().toString().slice(-6)}`,
      name: "",
      tagline: "",
      department: dept,
      category: cat,
      price: 50.0,
      originalPrice: 50.0,
      rating: 5.0,
      reviewsCount: 1,
      image: "",
      images: [],
      badge: "Nuevo",
      inStock: true,
      lumens: dept === "solar" ? "Alta Potencia" : "",
      batteryLife: dept === "solar" ? "10-12 Horas" : "",
      waterproof: dept === "solar" ? "IP66" : "",
      material: "",
      dimensions: "",
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

  // Copiar código de sincronización para transferir de móvil a PC o viceversa
  const handleCopySyncCode = () => {
    try {
      const code = btoa(unescape(encodeURIComponent(JSON.stringify(products))));
      navigator.clipboard.writeText(code);
      setIsCopiedCode(true);
      toast.success("Código de sincronización copiado", {
        description: "Pégalo en el panel /admin de tu computador para transferir el catálogo.",
      });
      setTimeout(() => setIsCopiedCode(false), 3000);
    } catch {
      navigator.clipboard.writeText(JSON.stringify(products));
      toast.success("Catálogo copiado en texto JSON");
    }
  };

  // Enviar respaldo a WhatsApp para abrir en la computadora
  const handleShareToWhatsApp = () => {
    const jsonStr = JSON.stringify(products);
    let code = "";
    try {
      code = btoa(unescape(encodeURIComponent(jsonStr)));
    } catch {
      code = jsonStr;
    }

    const message = `*CATALOGO SOLAR Y HOGAR - SINCRONIZACION MULTI-DISPOSITIVO*
Hola! Aquí tienes el código para transferir los productos a tu computadora:

${code}

Instrucciones:
1. Abre tu web en la computadora en la ruta /admin
2. Haz clic en "Sincronizar Dispositivos"
3. Pega este código y haz clic en "Aplicar y Sincronizar"`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  // Aplicar código de sincronización pegado desde otro dispositivo
  const handleApplySyncCode = () => {
    if (!syncCodeInput.trim()) {
      toast.error("Pega un código de sincronización primero");
      return;
    }

    try {
      let rawJson = syncCodeInput.trim();
      // Si está en base64
      if (!rawJson.startsWith("[") && !rawJson.startsWith("{")) {
        try {
          rawJson = decodeURIComponent(escape(atob(rawJson)));
        } catch {
          // Si no es base64, continuar
        }
      }

      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
        saveCatalog(parsed);
        toast.success("¡Catálogo sincronizado con éxito!", {
          description: `Se han restaurado ${parsed.length} productos en este dispositivo.`,
        });
        setIsSyncModalOpen(false);
        setSyncCodeInput("");
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error("El código no contiene un catálogo válido de productos");
      }
    } catch (err) {
      toast.error("Código no válido", {
        description: "Asegúrate de copiar el código completo generado en el otro dispositivo.",
      });
    }
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

  // Subir una o múltiples fotos a la galería (Nube o local)
  const handleMultipleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !editingProduct) return;

    const oversized = files.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.warning(`${oversized.length} imagen(es) superan 10MB. Te recomendamos comprimirlas.`);
    }

    const validFiles = files.filter((f) => f.size <= 10 * 1024 * 1024);
    if (!validFiles.length) return;

    setIsUploadingImage(true);
    const toastId = toast.loading(`Subiendo ${validFiles.length} imagen(es)...`);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        let fileUrl = "";

        // 1. Si Supabase está conectado, subimos a la nube
        if (isSupabaseConfigured()) {
          const uploadRes = await uploadImageToSupabase(file, editingProduct.id || "producto");
          if (uploadRes && uploadRes.url) {
            fileUrl = uploadRes.url;
          } else if (uploadRes?.error) {
            console.warn("Fallo subiendo archivo a Supabase:", uploadRes.error);
          }
        }

        // 2. Si no hay Supabase o falló la subida remota, convertimos a Base64 local
        if (!fileUrl) {
          fileUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }

        uploadedUrls.push(fileUrl);
      }

      setEditingProduct((prev) => {
        if (!prev) return null;
        const currentGallery =
          prev.images && prev.images.length > 0
            ? prev.images
            : prev.image && prev.image.trim()
            ? [prev.image]
            : [];

        const nextGallery = [...currentGallery, ...uploadedUrls];
        const nextCover = prev.image && prev.image.trim() ? prev.image : uploadedUrls[0] || "";

        return {
          ...prev,
          image: nextCover,
          images: nextGallery,
        };
      });

      toast.success(`¡${uploadedUrls.length} foto(s) agregada(s) con éxito!`, { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error("Error al subir las imágenes", { id: toastId, description: err?.message });
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  // Establecer una foto existente como portada principal
  const handleSetCoverImage = (imgUrl: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      image: imgUrl,
    });
    toast.info("Foto asignada como portada");
  };

  // Eliminar una foto de la galería
  const handleRemoveGalleryImage = (indexToRemove: number) => {
    if (!editingProduct) return;
    const currentImages = editingProduct.images?.length
      ? editingProduct.images
      : editingProduct.image
      ? [editingProduct.image]
      : [];

    const removedUrl = currentImages[indexToRemove];
    const updatedImages = currentImages.filter((_, idx) => idx !== indexToRemove);

    let nextCover = editingProduct.image;
    if (removedUrl === editingProduct.image) {
      nextCover = updatedImages[0] || "";
    }

    setEditingProduct({
      ...editingProduct,
      image: nextCover,
      images: updatedImages,
    });
    toast.warning("Foto eliminada de la galería");
  };

  // Guardar y probar conexión con Supabase
  const handleSaveSupabase = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = supabaseUrlInput.trim().replace(/\/+$/, "");
    const cleanKey = supabaseKeyInput.trim();

    if (!cleanUrl || !cleanKey) {
      toast.error("Ingresa la URL del proyecto y la anon key de Supabase");
      return;
    }

    setIsTestingSupabase(true);
    const toastId = toast.loading("Verificando conexión con Supabase...");

    try {
      saveSupabaseConfig(cleanUrl, cleanKey);
      const liveCatalog = await fetchLiveCatalogFromSupabase();

      if (liveCatalog && liveCatalog.length > 0) {
        saveCatalog(liveCatalog);
        setSupabaseConnected(true);
        toast.success(`¡Conectado exitosamente! Se sincronizaron ${liveCatalog.length} productos en tiempo real.`, {
          id: toastId,
        });
      } else {
        setSupabaseConnected(true);
        toast.success("Conexión con Supabase establecida. Los cambios se sincronizarán al instante.", {
          id: toastId,
        });
      }
      setIsSupabaseModalOpen(false);
      setTimeout(() => window.location.reload(), 500);
    } catch (err: any) {
      console.error(err);
      toast.error("Error al conectar con Supabase", {
        id: toastId,
        description: err?.message || "Verifica las credenciales y que hayas corrido el script SQL.",
      });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  // Desconectar Supabase
  const handleDisconnectSupabase = () => {
    if (window.confirm("¿Seguro que deseas desconectar Supabase de este navegador? Volverás al modo de catálogo local.")) {
      clearSupabaseConfig();
      setSupabaseConnected(false);
      setSupabaseUrlInput("");
      setSupabaseKeyInput("");
      toast.info("Supabase desconectado.");
      setTimeout(() => window.location.reload(), 400);
    }
  };

  // Copiar el esquema SQL canónico (importado como texto desde supabase-schema.sql)
  const handleCopySchemaSql = async () => {
    try {
      await navigator.clipboard.writeText(schemaSql);
      toast.success("Script SQL copiado al portapapeles", {
        description: "Pégalo en el SQL Editor de tu proyecto en supabase.com y dale a RUN.",
      });
    } catch {
      toast.error("No se pudo copiar el script", {
        description: "Abre supabase-schema.sql en el repositorio y cópialo desde ahí.",
      });
    }
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
  // PANTALLA DE ACCESO (SUPABASE AUTH)
  // ----------------------------------------------------------------------
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
          <p className="text-sm">Verificando sesión…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const cloudReady = isCloudAuthAvailable();

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
          {/* Logo y Encabezado */}
          <div className="text-center">
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
              Inicia sesión con tu cuenta de vendedor para gestionar precios, inventario y catálogo.
            </p>
          </div>

          {cloudReady ? (
            <>
              {/* Formulario de acceso */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="seller-email" className="text-xs text-slate-400 block mb-1.5">
                    Correo electrónico
                  </label>
                  <input
                    id="seller-email"
                    type="email"
                    autoComplete="username"
                    required
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setAuthError("");
                    }}
                    placeholder="vendedor@correo.com"
                    className="w-full py-3 px-4 bg-slate-950/70 border border-slate-700 rounded-2xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="seller-password" className="text-xs text-slate-400 block mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="seller-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setAuthError("");
                      }}
                      placeholder="••••••••"
                      className="w-full py-3 px-4 pr-11 bg-slate-950/70 border border-slate-700 rounded-2xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                      title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <p
                    role="alert"
                    className="text-sm text-red-400 flex items-center justify-center gap-1.5 animate-in fade-in"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-base shadow-lg shadow-amber-500/20 transition-all transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isAuthSubmitting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                  {isAuthSubmitting ? "Verificando…" : "Iniciar Sesión"}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-800/80 text-xs text-slate-500 space-y-1">
                <p>
                  El acceso se gestiona en Supabase → <strong className="text-slate-300">Authentication</strong>.
                </p>
                <p>Si olvidaste tu contraseña, pídele al administrador que la restablezca.</p>
              </div>
            </>
          ) : (
            <>
              {/* Sin Supabase configurado: permitir conectar la nube antes de entrar */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-300 text-xs leading-relaxed">
                <p className="font-bold text-amber-300 mb-1">Supabase no está configurado</p>
                <p>
                  El panel usa autenticación segura en la nube. Conecta tu proyecto para poder iniciar
                  sesión como vendedor.
                </p>
              </div>

              <form onSubmit={handleSaveSupabaseFromLogin} className="space-y-4 mt-4">
                <div>
                  <label htmlFor="sb-url" className="text-xs text-slate-400 block mb-1.5">
                    URL del proyecto
                  </label>
                  <input
                    id="sb-url"
                    type="url"
                    required
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://tuproyecto.supabase.co"
                    className="w-full py-3 px-4 bg-slate-950/70 border border-slate-700 rounded-2xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="sb-key" className="text-xs text-slate-400 block mb-1.5">
                    Clave pública (anon / publishable)
                  </label>
                  <input
                    id="sb-key"
                    type="password"
                    required
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    placeholder="sb_publishable_..."
                    className="w-full py-3 px-4 bg-slate-950/70 border border-slate-700 rounded-2xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-base shadow-lg shadow-amber-500/20 transition-all transform active:scale-98 flex items-center justify-center gap-2"
                >
                  <Database className="w-5 h-5" />
                  Guardar conexión
                </button>
              </form>
            </>
          )}

          {/* Enlace para volver a la tienda */}
          <div className="mt-5 text-center">
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
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 rounded-md">
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
              onClick={() => setIsSupabaseModalOpen(true)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                supabaseConnected
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-sm shadow-emerald-500/10"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
              }`}
              title="Base de datos y sincronización en la nube"
            >
              {supabaseConnected ? (
                <>
                  <Cloud className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">Nube Conectada</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Conectar Nube</span>
                </>
              )}
            </button>

            {sellerEmail && (
              <span
                className="hidden lg:inline-flex max-w-[220px] truncate px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] font-medium text-slate-300"
                title={`Sesión iniciada como ${sellerEmail}`}
              >
                {sellerEmail}
              </span>
            )}

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

        {/* Banner de Sincronización Multi-Dispositivo (Nube Supabase o Código) */}
        {supabaseConnected ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sincronización en Tiempo Real Activa (Supabase Cloud)
                </span>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  Cualquier artículo que agregues, edites o elimines desde tu móvil se actualizará <strong>instantáneamente</strong> en tu PC y para todos los visitantes sin necesidad de recargar.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setIsSupabaseModalOpen(true)}
                className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>Estado Nube</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  ¿Quieres que tus artículos se actualicen al instante entre móvil y computadora?
                </span>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  Conecta tu base de datos gratuita en <strong>Supabase</strong> para que cualquier producto subido desde el celular aparezca en la PC al instante en 0 segundos.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setIsSupabaseModalOpen(true)}
                className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Cloud className="w-4 h-4" />
                <span>Conectar Nube (Supabase)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSyncModalOpen(true)}
                className="w-full md:w-auto px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Transferir manualmente por código"
              >
                <Share2 className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Transferir Código</span>
              </button>
            </div>
          </div>
        )}

        {/* Solicitudes registradas (cotizaciones y pedidos) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3.5">
            <button
              type="button"
              onClick={() => setIsRequestsOpen((v) => !v)}
              className="flex flex-1 items-center gap-3 text-left cursor-pointer"
              aria-expanded={isRequestsOpen}
            >
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  Solicitudes registradas
                  {requests.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-sky-500/15 text-sky-300 text-[11px] font-bold">
                      {requests.length}
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  Cotizaciones y pedidos con precios validados por el servidor.
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                  isRequestsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => void loadRequests()}
              disabled={requestsLoading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Volver a cargar las solicitudes"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${requestsLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>

          {isRequestsOpen && (
            <div className="border-t border-slate-800 px-4 py-3">
              {requestsError ? (
                <p className="text-xs text-amber-300 py-2 leading-relaxed">{requestsError}</p>
              ) : requests.length === 0 ? (
                <p className="text-xs text-slate-400 py-2 leading-relaxed">
                  {requestsLoading
                    ? "Cargando solicitudes..."
                    : "Aún no hay cotizaciones ni pedidos registrados. Cada documento que generes desde la tienda aparecerá aquí con su número oficial."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[760px]">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                        <th className="py-2 pr-3 font-bold">Código</th>
                        <th className="py-2 pr-3 font-bold">Tipo</th>
                        <th className="py-2 pr-3 font-bold">Cliente</th>
                        <th className="py-2 pr-3 font-bold">Productos</th>
                        <th className="py-2 pr-3 font-bold text-right">Total</th>
                        <th className="py-2 font-bold">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {requests.map((request) => (
                        <tr key={request.id} className="align-top">
                          <td className="py-2.5 pr-3">
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(request.code);
                                  toast.success(`Código ${request.code} copiado`);
                                } catch {
                                  toast.error("No se pudo copiar el código");
                                }
                              }}
                              className="font-mono font-bold text-sky-300 hover:text-sky-200 inline-flex items-center gap-1 cursor-pointer"
                              title="Copiar código"
                            >
                              {request.code}
                              <Copy className="w-3 h-3 opacity-60" />
                            </button>
                          </td>
                          <td className="py-2.5 pr-3">
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap ${
                                request.kind === "pedido"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-sky-500/15 text-sky-300"
                              }`}
                            >
                              {request.kind === "pedido" ? "Pedido" : "Cotización"}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 text-slate-200">
                            <span className="block font-semibold truncate max-w-[170px]">
                              {request.customerName}
                            </span>
                            {request.customerPhone && (
                              <span className="block text-[11px] text-slate-500">
                                {request.customerPhone}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 pr-3 text-slate-400 max-w-[260px]">
                            {request.items
                              .map((item) => `${item.quantity}× ${item.name}`)
                              .join(", ")}
                          </td>
                          <td className="py-2.5 pr-3 text-right font-bold text-white whitespace-nowrap">
                            ${request.total.toFixed(2)}
                          </td>
                          <td className="py-2.5 text-slate-400 whitespace-nowrap">
                            {new Date(request.createdAt).toLocaleString("es-PA", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
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
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Nuevo Producto
            </button>

            {/* Botón sincronizar */}
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Sincronizar catálogo entre dispositivos"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>

            {/* Menú de respaldo */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleExportJson}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
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
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 hover:text-red-300 text-slate-400 text-xs font-medium transition-colors cursor-pointer"
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
                          <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Agotado</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span
                          className={`px-2 py-0.5 text-[11px] font-bold uppercase rounded-md ${
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
                          <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-800 text-slate-300 rounded-md truncate max-w-[120px]">
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
                        <label className="text-[11px] font-medium text-slate-400 block mb-1">Precio Venta ($)</label>
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
                        <label className="text-[11px] font-medium text-slate-400 block mb-1">PVP Tachado ($)</label>
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
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Departamento *</label>
                  <select
                    value={editingProduct.department || "solar"}
                    onChange={(e) => {
                      const newDept = e.target.value as ProductDepartment;
                      const isNowSolar = newDept === "solar";
                      setEditingProduct({
                        ...editingProduct,
                        department: newDept,
                        lumens: isNowSolar ? (editingProduct.lumens || "Alta Potencia") : "",
                        batteryLife: isNowSolar ? (editingProduct.batteryLife || "10-12 Horas") : "",
                        category: isNowSolar
                          ? (editingProduct.category === "muebles" || editingProduct.category === "accesorios" ? "farolas" : editingProduct.category)
                          : newDept,
                      });
                    }}
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

              {/* Especificaciones: Solares vs Hogar */}
              {editingProduct.department === "solar" ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Sun className="w-4 h-4" />
                    <span>Especificaciones Exclusivas de Lámparas Solares</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Estos términos de potencia en Watts, batería y tiempo de duración de carga <strong>solo aplican a lámparas solares</strong>:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">Potencia en Watts / Lúmenes</label>
                      <input
                        type="text"
                        value={editingProduct.lumens || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, lumens: e.target.value })}
                        placeholder="Ej: 1200W • Matriz LED"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">Autonomía / Duración de Carga</label>
                      <input
                        type="text"
                        value={editingProduct.batteryLife || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, batteryLife: e.target.value })}
                        placeholder="Ej: 10 a 12h (Modo Radar)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">Protección Intemperie</label>
                      <input
                        type="text"
                        value={editingProduct.waterproof || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, waterproof: e.target.value })}
                        placeholder="Ej: IP66 Impermeable"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Package className="w-4 h-4" />
                    <span>Especificaciones de Hogar ({editingProduct.department === "muebles" ? "Muebles" : "Accesorios"})</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Este artículo pertenece al catálogo de hogar. <strong>No mostrará Watts ni duración de batería</strong> en la tienda.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">Material / Acabados (Opcional)</label>
                      <input
                        type="text"
                        value={editingProduct.material || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                        placeholder="Ej: Madera Teca, Acero, Ratán sintético..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">Dimensiones / Formato (Opcional)</label>
                      <input
                        type="text"
                        value={editingProduct.dimensions || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, dimensions: e.target.value })}
                        placeholder="Ej: 120x60x75 cm / 3 Cuerpos"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Galería de imágenes (Portada + Fotos adicionales) */}
              <div className="space-y-4 p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-white block">
                      Fotos del Producto ({editingProduct.images?.length || (editingProduct.image ? 1 : 0)})
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Sube varias fotos para que tus clientes vean el producto desde distintos ángulos.
                    </p>
                  </div>

                  <label
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all self-start sm:self-auto ${
                      isUploadingImage
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer"
                    }`}
                  >
                    {isUploadingImage ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>Subiendo fotos...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>+ Subir Fotos (Permite varias)</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={isUploadingImage}
                          onChange={handleMultipleImagesUpload}
                          className="hidden"
                        />
                      </>
                    )}
                  </label>
                </div>

                {/* Grid de miniaturas de la galería */}
                {(editingProduct.images && editingProduct.images.length > 0) || editingProduct.image ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
                    {(editingProduct.images?.length
                      ? editingProduct.images
                      : editingProduct.image
                      ? [editingProduct.image]
                      : []
                    ).map((imgUrl, idx) => {
                      const isCover = imgUrl === editingProduct.image;
                      return (
                        <div
                          key={idx}
                          className={`group relative aspect-square rounded-2xl overflow-hidden border transition-all bg-slate-900 ${
                            isCover
                              ? "border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/15"
                              : "border-slate-800 hover:border-slate-600"
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Foto ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.warn("No se pudo cargar la imagen:", imgUrl);
                            }}
                          />

                          {/* Badge de Portada o Botón para hacer Portada */}
                          {isCover ? (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-extrabold text-[11px] shadow-md uppercase tracking-wider">
                              Portada
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetCoverImage(imgUrl)}
                              className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 hover:bg-amber-500 hover:text-slate-950 text-white font-semibold text-[11px] shadow opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                              title="Marcar como foto de portada"
                            >
                              Hacer Portada
                            </button>
                          )}

                          {/* Botón Eliminar Foto */}
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-red-500/90 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow cursor-pointer"
                            title="Eliminar esta foto de la galería"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="absolute bottom-1 right-2 text-[11px] font-mono text-white/70 drop-shadow">
                            #{idx + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-500 flex flex-col items-center justify-center gap-2 bg-slate-950/40">
                    <ImageIcon className="w-8 h-8 text-slate-600" />
                    <p className="text-xs">Aún no has subido fotos para este producto.</p>
                    <p className="text-[11px] text-slate-600">
                      Toca el botón "+ Subir Fotos" para elegir una o varias imágenes desde tu dispositivo.
                    </p>
                  </div>
                )}

                {/* Opción manual de URL de foto principal */}
                <div className="pt-2 border-t border-slate-800/80">
                  <label className="text-[11px] text-slate-400 block mb-1">
                    URL de la foto de portada (automática o manual):
                  </label>
                  <input
                    type="text"
                    value={editingProduct.image}
                    onChange={(e) => {
                      const newUrl = e.target.value;
                      setEditingProduct({
                        ...editingProduct,
                        image: newUrl,
                        images: editingProduct.images?.length
                          ? [newUrl, ...editingProduct.images.slice(1)]
                          : [newUrl],
                      });
                    }}
                    placeholder="URL de la imagen o se asignará automáticamente al subir fotos"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
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
      {/* MODAL DE SINCRONIZACIÓN MULTI-DISPOSITIVO (MÓVIL ↔ COMPUTADOR)          */}
      {/* ---------------------------------------------------------------------- */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                Sincronización Multi-Dispositivo
              </h3>
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-300 leading-relaxed space-y-1.5">
                <p className="font-bold text-amber-300 flex items-center gap-1.5">
                  ¿Por qué no salía el artículo creado en el celular al entrar desde el PC?
                </p>
                <p className="text-[11px]">
                  Actualmente la tienda almacena los nuevos artículos en la memoria local (<strong>localStorage</strong>) del navegador de cada dispositivo.
                  Para transferir tus productos de tu celular a tu computadora (o al revés), usa una de las opciones a continuación:
                </p>
              </div>

              {/* Paso 1: Exportar / Compartir desde este dispositivo */}
              <div className="space-y-2 border border-slate-800 rounded-2xl p-4 bg-slate-950/60">
                <span className="font-bold text-white text-xs block">
                  Paso 1: Si estás en el dispositivo con los productos nuevos
                </span>
                <p className="text-[11px] text-slate-400">
                  Copia el código de catálogo o envíatelo a WhatsApp para abrirlo en tu computadora:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopySyncCode}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ClipboardCopy className="w-4 h-4 text-amber-400" />
                    <span>{isCopiedCode ? "¡Código Copiado!" : "Copiar Código"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareToWhatsApp}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Enviar a mi WhatsApp</span>
                  </button>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>También puedes descargar el archivo de respaldo:</span>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar .JSON
                  </button>
                </div>
              </div>

              {/* Paso 2: Importar en el otro dispositivo */}
              <div className="space-y-2 border border-slate-800 rounded-2xl p-4 bg-slate-950/60">
                <span className="font-bold text-white text-xs block">
                  Paso 2: Si estás en la computadora (o dispositivo destino)
                </span>
                <p className="text-[11px] text-slate-400">
                  Pega aquí el código que copiaste o recibiste por WhatsApp y pulsa "Aplicar y Sincronizar":
                </p>

                <textarea
                  rows={3}
                  value={syncCodeInput}
                  onChange={(e) => setSyncCodeInput(e.target.value)}
                  placeholder="Pega aquí el código de catálogo o el texto JSON..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />

                <button
                  type="button"
                  onClick={handleApplySyncCode}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Aplicar y Sincronizar en este Dispositivo</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <span className="text-amber-300 font-bold block">💡 ¿Quieres que aparezca para todos sin sincronizar?</span>
                <p>
                  Si nos compartes los datos de tu artículo (Nombre, Precio, fotos y descripción), lo dejamos agregado directamente en el archivo base del catálogo (<code>src/data/products.ts</code>). De esa forma queda grabado de fábrica para todos los visitantes del mundo.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL DE CONEXIÓN A BASE DE DATOS EN LA NUBE (SUPABASE REALTIME)        */}
      {/* ---------------------------------------------------------------------- */}
      {isSupabaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Base de Datos en Tiempo Real
                    <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Supabase Cloud
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Actualización instantánea entre tu móvil, computadora y clientes (0 ms)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSupabaseModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Estado actual */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                supabaseConnected
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-3 h-3 rounded-full ${
                    supabaseConnected ? "bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" : "bg-amber-400"
                  }`}
                />
                <div>
                  <span className="font-bold block">
                    {supabaseConnected ? "Base de Datos Conectada en Tiempo Real" : "Modo Local (Sin sincronización automática)"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {supabaseConnected
                      ? "Los productos y fotos que subas se reflejan al instante en cualquier dispositivo."
                      : "Los productos creados solo viven en este navegador hasta que conectes Supabase."}
                  </span>
                </div>
              </div>

              {supabaseConnected && (
                <button
                  type="button"
                  onClick={handleDisconnectSupabase}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-[11px] font-semibold transition-colors"
                >
                  Desconectar
                </button>
              )}
            </div>

            {/* Formulario de credenciales */}
            <form onSubmit={handleSaveSupabase} className="space-y-4">
              <div className="space-y-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                <span className="text-xs font-bold text-white block">Credenciales de tu Proyecto Supabase</span>

                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    Project URL (URL del Proyecto) *
                  </label>
                  <input
                    type="url"
                    required
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://abcdefghijklm.supabase.co"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-[11px] text-slate-500 block mt-1">
                    La encuentras en Supabase → Project Settings → API → Project URL
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    Anon Public Key (Clave Pública) *
                  </label>
                  <input
                    type="password"
                    required
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-[11px] text-slate-500 block mt-1">
                    La encuentras en Supabase → Project Settings → API → Project API keys → <code>anon public</code>
                  </span>
                </div>
              </div>

              {/* Guía rápida en 3 pasos */}
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 space-y-2.5 text-xs text-slate-300">
                <span className="text-white font-bold block text-xs">¿Cómo crear tu base de datos gratis en 2 minutos?</span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 leading-relaxed">
                  <li>
                    Entra a{" "}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline font-semibold inline-flex items-center gap-0.5"
                    >
                      supabase.com <ExternalLink className="w-3 h-3" />
                    </a>{" "}
                    y crea un proyecto nuevo (Plan Free gratis).
                  </li>
                  <li>
                    En el menú lateral de Supabase, entra a <strong>SQL Editor</strong>, pulsa <strong>New query</strong> y ejecuta nuestro script:
                  </li>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleCopySchemaSql}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold border border-amber-400/30 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
                    >
                      <ClipboardCopy className="w-4 h-4" />
                      Copiar Script SQL Completo (tablas, fotos, tiempo real y solicitudes)
                    </button>
                  </div>
                  <li className="pt-1">
                    Ve a <strong>Settings → API</strong>, copia tu URL y anon key, pégalas arriba y presiona "Conectar y Probar".
                  </li>
                </ol>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSupabaseModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cerrar
                </button>

                <button
                  type="submit"
                  disabled={isTestingSupabase}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isTestingSupabase ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Conectando...</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4" />
                      <span>Conectar y Sincronizar en Tiempo Real</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
