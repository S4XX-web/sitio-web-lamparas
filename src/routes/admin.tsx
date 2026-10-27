import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  Cloud,
  CloudOff,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Info,
  Loader2,
  Lock,
  LogOut,
  Minus,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import type { CartItem, Product, ProductDepartment } from "../types/store";
import { CatalogWriteError } from "../services/productCatalogService";
import {
  getSellerProfile,
  getSellerSession,
  isCloudAuthAvailable,
  onSellerAuthChange,
  signInSeller,
  signOutSeller,
  type SellerAccess,
  type SellerSession,
} from "../services/sellerAuth";
import {
  applyServerPrices,
  listRequests,
  registerRequest,
  requestToCartItems,
  type RegisteredRequest,
  type RequestSummary,
} from "../services/requestService";
import { generateQuotationPDF } from "../utils/quotationPdf";
import { getDepartmentLabel } from "../utils/productUtils";
import {
  getSupabaseConfig,
  isSupabaseConfigured,
  saveSupabaseConfig,
  uploadImageToSupabase,
} from "../lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel de Vendedor — Solar y Hogar" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

/* ------------------------------------------------------------------ */
/* Constantes y utilidades                                             */
/* ------------------------------------------------------------------ */

const STORE_WHATSAPP = "50769893055";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const BTN_PRIMARY =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50";
const BTN_GHOST =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50";
const INPUT =
  "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20";
const LABEL = "mb-1.5 block text-xs font-semibold text-muted-foreground";

type Tab = "productos" | "cotizaciones" | "ajustes";
type DeptFilter = "todos" | ProductDepartment;

interface PriceDraft {
  price: string;
  originalPrice: string;
}

interface ProductDraft extends Omit<Product, "price" | "originalPrice"> {
  price: string;
  originalPrice: string;
}

interface EditorState {
  mode: "create" | "edit";
  draft: ProductDraft;
}

function money(value: number): string {
  return `$${value.toFixed(2)}`;
}

/** Redondea a centavos para evitar arrastrar decimales binarios. */
function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Acepta "12,50" y "12.50". Devuelve NaN si no hay número. */
function parseMoney(value: string): number {
  const clean = value.replace(/[^0-9.,]/g, "").replace(/,/g, ".");
  if (!clean) return NaN;
  return Number(clean);
}

function errorMessage(err: unknown): string {
  if (err instanceof CatalogWriteError) return err.message;
  if (err instanceof Error) return err.message;
  return "Ocurrió un error inesperado.";
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("es-PA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length <= 8) return `507${digits}`;
  return digits;
}

function buildQuoteMessage(input: {
  code: string;
  date: string;
  clientName: string;
  clientPhone: string;
  sellerName: string;
  items: CartItem[];
  total: number;
}): string {
  const lines = input.items
    .map(
      (item) =>
        `- ${item.quantity}x ${item.product.name} (Und: ${money(item.product.price)}) = ${money(
          item.product.price * item.quantity,
        )}`,
    )
    .join("\n");

  return [
    "*COTIZACIÓN — SOLAR Y HOGAR PANAMÁ*",
    `*No.:* ${input.code}`,
    `*Fecha:* ${input.date}`,
    `*Cliente:* ${input.clientName}`,
    input.clientPhone ? `*Teléfono:* ${input.clientPhone}` : null,
    input.sellerName ? `*Atendido por:* ${input.sellerName}` : null,
    "----------------------------------------",
    lines,
    "",
    `*TOTAL:* ${money(input.total)} USD`,
    "----------------------------------------",
    "*Métodos de pago habilitados:*",
    "- Yappy (Banco General)",
    "- Transferencia Bancaria ACH (Banco General)",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

function toDraft(product: Product): ProductDraft {
  return {
    ...product,
    price: String(product.price),
    originalPrice: String(product.originalPrice ?? product.price),
  };
}

function emptyProduct(department: ProductDepartment): ProductDraft {
  const category: Product["category"] =
    department === "muebles" ? "muebles" : department === "accesorios" ? "accesorios" : "farolas";
  return {
    id: `prod-${Date.now().toString().slice(-6)}`,
    name: "",
    tagline: "",
    department,
    category,
    price: "",
    originalPrice: "",
    rating: 5,
    reviewsCount: 0,
    image: "",
    images: [],
    badge: "",
    inStock: true,
    lumens: "",
    batteryLife: "",
    waterproof: "",
    description: "",
    features: [],
    material: "",
    dimensions: "",
  };
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });
}

async function uploadImages(files: File[], folder: string): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    if (file.size > MAX_IMAGE_BYTES) continue;

    if (isSupabaseConfigured()) {
      const result = await uploadImageToSupabase(file, folder);
      if (result.url) {
        urls.push(result.url);
        continue;
      }
    }
    // Último recurso (modo local): imagen incrustada.
    try {
      urls.push(await fileToDataUrl(file));
    } catch {
      // se ignora el archivo
    }
  }
  return urls;
}

/* ------------------------------------------------------------------ */
/* Panel                                                               */
/* ------------------------------------------------------------------ */

function AdminPage() {
  const { products, updateProduct, addProduct, deleteProduct } = useCart();

  const [session, setSession] = useState<SellerSession | null>(null);
  const [access, setAccess] = useState<SellerAccess | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [tab, setTab] = useState<Tab>("productos");

  // Productos
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<DeptFilter>("todos");
  const [priceDrafts, setPriceDrafts] = useState<Record<string, PriceDraft>>({});
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [isSavingEditor, setIsSavingEditor] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Cotizaciones
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");
  const [isQuoteBuilderOpen, setIsQuoteBuilderOpen] = useState(false);

  /* ------------------------- sesión ------------------------- */

  useEffect(() => {
    let active = true;
    let requestId = 0;
    let settledUserId: string | null = null;
    let hasSettled = false;

    const applySession = async (next: SellerSession | null, force = false) => {
      const nextUserId = next?.userId ?? null;

      // Supabase avisa también al renovar el token: si es la misma cuenta no
      // volvemos a verificar ni desmontamos el panel.
      if (!force && hasSettled && nextUserId === settledUserId) return;

      const myId = ++requestId;
      if (!active) return;
      setSession(next);

      if (!next) {
        settledUserId = null;
        hasSettled = true;
        setAccess(null);
        setIsCheckingAccess(false);
        return;
      }

      setIsCheckingAccess(true);
      const profile = await getSellerProfile(next);
      if (!active || myId !== requestId) return;
      settledUserId = nextUserId;
      hasSettled = true;
      setAccess(profile);
      setIsCheckingAccess(false);
    };

    getSellerSession()
      .then((current) => void applySession(current))
      .catch(() => {
        if (active) setIsCheckingAccess(false);
      });

    const unsubscribe = onSellerAuthChange((next) => {
      void applySession(next);
    });

    // Red de seguridad: nunca dejar la pantalla en "verificando".
    const timeout = window.setTimeout(() => {
      if (active) setIsCheckingAccess(false);
    }, 6000);

    return () => {
      active = false;
      window.clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (isSigningIn) return;

    setAuthError("");
    setIsSigningIn(true);
    const result = await signInSeller(email, password);
    setIsSigningIn(false);

    if (!result.session) {
      setAuthError(result.error ?? "No se pudo iniciar sesión.");
      return;
    }

    setPassword("");
    setSession(result.session);
    setIsCheckingAccess(true);
    const profile = await getSellerProfile(result.session);
    setAccess(profile);
    setIsCheckingAccess(false);

    if (profile.status === "seller") {
      toast.success("Bienvenido al panel");
    }
  };

  const handleLogout = async () => {
    await signOutSeller();
    setSession(null);
    setAccess(null);
    setPassword("");
    toast.info("Sesión cerrada");
  };

  const retryAccess = async () => {
    if (!session) return;
    setIsCheckingAccess(true);
    const profile = await getSellerProfile(session);
    setAccess(profile);
    setIsCheckingAccess(false);
  };

  /* ----------------------- solicitudes ---------------------- */

  const loadRequests = useCallback(async () => {
    setRequestsLoading(true);
    setRequestsError("");
    try {
      const list = await listRequests(50);
      if (list === null) {
        setRequests([]);
        setRequestsError(
          "El registro de solicitudes todavía no está activo en Supabase. Ejecuta la sección 9 de supabase-schema.sql.",
        );
      } else {
        setRequests(list);
      }
    } catch (err) {
      setRequestsError(errorMessage(err));
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (access?.status === "seller") void loadRequests();
  }, [access?.status, loadRequests]);

  /* ------------------------ productos ----------------------- */

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      if (deptFilter !== "todos" && product.department !== deptFilter) return false;
      if (!term) return true;
      return (
        product.name.toLowerCase().includes(term) ||
        product.id.toLowerCase().includes(term) ||
        (product.badge ?? "").toLowerCase().includes(term)
      );
    });
  }, [products, search, deptFilter]);

  const isPriceDirty = (product: Product): boolean => {
    const draft = priceDrafts[product.id];
    if (!draft) return false;
    const price = parseMoney(draft.price);
    const original = parseMoney(draft.originalPrice);
    const currentOriginal = product.originalPrice ?? product.price;
    return price !== product.price || (Number.isFinite(original) ? original : price) !== currentOriginal;
  };

  const updateDraft = (product: Product, field: keyof PriceDraft, value: string) => {
    setPriceDrafts((prev) => {
      const base =
        prev[product.id] ?? {
          price: String(product.price),
          originalPrice: String(product.originalPrice ?? product.price),
        };
      return { ...prev, [product.id]: { ...base, [field]: value } };
    });
  };

  const clearDraft = (id: string) => {
    setPriceDrafts((prev) => {
      if (!(id in prev)) return prev;
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const savePrice = async (product: Product) => {
    const draft = priceDrafts[product.id];
    if (!draft) return;

    const price = parseMoney(draft.price);
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Precio inválido", { description: "Escribe un número mayor que 0." });
      return;
    }

    const originalRaw = parseMoney(draft.originalPrice);
    const originalPrice = Number.isFinite(originalRaw) && originalRaw >= price ? originalRaw : price;

    setSavingPriceId(product.id);
    try {
      await updateProduct(product.id, { price, originalPrice });
      clearDraft(product.id);
      toast.success("Precio actualizado", { description: `${product.name} · ${money(price)}` });
    } catch (err) {
      toast.error("No se pudo guardar el precio", { description: errorMessage(err) });
    } finally {
      setSavingPriceId(null);
    }
  };

  const saveQuotePricesToCatalog = async (updates: Array<{ product: Product; price: number }>) => {
    for (const { product, price } of updates) {
      const originalPrice = product.originalPrice >= price ? product.originalPrice : price;
      await updateProduct(product.id, { price, originalPrice });
    }
  };

  const toggleStock = async (product: Product) => {
    setBusyProductId(product.id);
    try {
      await updateProduct(product.id, { inStock: !product.inStock });
      toast.info(product.inStock ? "Marcado como agotado" : "Marcado como disponible", {
        description: product.name,
      });
    } catch (err) {
      toast.error("No se pudo cambiar el stock", { description: errorMessage(err) });
    } finally {
      setBusyProductId(null);
    }
  };

  const removeProduct = async (product: Product) => {
    const confirmed = window.confirm(`¿Eliminar "${product.name}" del catálogo?`);
    if (!confirmed) return;

    setBusyProductId(product.id);
    try {
      await deleteProduct(product.id);
      clearDraft(product.id);
      toast.success("Producto eliminado", { description: product.name });
    } catch (err) {
      toast.error("No se pudo eliminar el producto", { description: errorMessage(err) });
    } finally {
      setBusyProductId(null);
    }
  };

  const openCreateProduct = () => {
    const department: ProductDepartment =
      deptFilter === "muebles" ? "muebles" : deptFilter === "accesorios" ? "accesorios" : "solar";
    setEditor({ mode: "create", draft: emptyProduct(department) });
  };

  const saveEditor = async () => {
    if (!editor) return;
    const { draft, mode } = editor;

    if (!draft.name.trim()) {
      toast.error("Falta el nombre del producto");
      return;
    }

    const price = parseMoney(draft.price);
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Precio inválido", { description: "Escribe un número mayor que 0." });
      return;
    }

    const originalRaw = parseMoney(draft.originalPrice);
    const originalPrice = Number.isFinite(originalRaw) && originalRaw >= price ? originalRaw : price;

    const payload: Product = {
      ...draft,
      name: draft.name.trim(),
      tagline: draft.tagline.trim(),
      price,
      originalPrice,
      features: draft.features.map((f) => f.trim()).filter(Boolean),
    };

    setIsSavingEditor(true);
    try {
      if (mode === "create") {
        await addProduct(payload);
        toast.success("Producto creado", { description: payload.name });
      } else {
        await updateProduct(payload.id, payload);
        clearDraft(payload.id);
        toast.success("Producto actualizado", { description: payload.name });
      }
      setEditor(null);
    } catch (err) {
      toast.error("No se pudo guardar el producto", { description: errorMessage(err) });
    } finally {
      setIsSavingEditor(false);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (!editor || files.length === 0) return;

    const valid = files.filter((file) => file.size <= MAX_IMAGE_BYTES);
    if (valid.length === 0) {
      toast.error("Las fotos deben pesar menos de 10 MB");
      return;
    }

    setIsUploadingImages(true);
    try {
      const urls = await uploadImages(valid, editor.draft.id || "producto");
      if (urls.length === 0) {
        toast.error("No se pudieron subir las fotos");
        return;
      }
      setEditor((prev) => {
        if (!prev) return prev;
        const gallery = prev.draft.images?.length
          ? prev.draft.images
          : prev.draft.image
            ? [prev.draft.image]
            : [];
        const nextGallery = [...gallery, ...urls];
        return {
          ...prev,
          draft: {
            ...prev.draft,
            image: prev.draft.image || urls[0] || "",
            images: nextGallery,
          },
        };
      });
      toast.success(`${urls.length} foto(s) agregada(s)`);
    } finally {
      setIsUploadingImages(false);
    }
  };

  const downloadCatalog = () => {
    const data = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(products, null, 2))}`;
    const link = document.createElement("a");
    link.href = data;
    link.download = `catalogo-solar-y-hogar-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Copia del catálogo descargada");
  };

  /* --------------------------- render ----------------------- */

  if (isCheckingAccess) {
    return (
      <Shell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          <p className="text-sm">Verificando acceso…</p>
        </div>
      </Shell>
    );
  }

  if (!session) {
    return (
      <LoginScreen
        email={email}
        password={password}
        showPassword={showPassword}
        isSigningIn={isSigningIn}
        error={authError}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onTogglePassword={() => setShowPassword((prev) => !prev)}
        onSubmit={handleLogin}
      />
    );
  }

  if (access?.status === "not_seller") {
    return (
      <Shell>
        <StatusCard
          icon={<ShieldCheck className="h-6 w-6" aria-hidden="true" />}
          tone="warning"
          title="Esta cuenta no es de vendedor"
          description="Tu correo inició sesión, pero no tiene permiso para cambiar precios ni ver cotizaciones. Pide al administrador que agregue tu usuario a la tabla de vendedores de Supabase."
          actions={
            <button type="button" className={BTN_GHOST} onClick={handleLogout}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Cerrar sesión
            </button>
          }
        />
      </Shell>
    );
  }

  if (!access || access.status === "unavailable") {
    return (
      <Shell>
        <StatusCard
          icon={<AlertTriangle className="h-6 w-6" aria-hidden="true" />}
          tone="danger"
          title="No pudimos verificar tu cuenta"
          description={
            access?.status === "unavailable"
              ? access.message
              : "Revisa tu conexión e inténtalo de nuevo."
          }
          actions={
            <>
              <button type="button" className={BTN_PRIMARY} onClick={() => void retryAccess()}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Reintentar
              </button>
              <button type="button" className={BTN_GHOST} onClick={handleLogout}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Cerrar sesión
              </button>
            </>
          }
        />
      </Shell>
    );
  }

  const sellerEmail = access.email ?? session.email ?? "";
  const productCount = products.length;
  const requestCount = requests.length;

  return (
    <Shell>
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-solar/25 text-solar-ink">
            <Package className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight">Panel de vendedor</h1>
            <p className="truncate text-xs text-muted-foreground">{sellerEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Vendedor verificado
          </span>
          <Link
            to="/"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Tienda
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold transition-colors hover:bg-muted"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <nav
        aria-label="Secciones del panel"
        className="mb-5 grid grid-cols-3 gap-1 rounded-2xl border border-border bg-card p-1"
      >
        {(
          [
            { id: "productos" as Tab, label: "Productos", count: productCount, icon: Package },
            { id: "cotizaciones" as Tab, label: "Cotizaciones", count: requestCount, icon: FileText },
            { id: "ajustes" as Tab, label: "Ajustes", count: null, icon: Settings },
          ] satisfies { id: Tab; label: string; count: number | null; icon: typeof Package }[]
        ).map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-current={active ? "page" : undefined}
              className={`flex h-11 items-center justify-center gap-2 rounded-xl px-2 text-sm font-semibold transition-colors ${
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
              {item.count !== null && (
                <span
                  className={`rounded-full px-1.5 text-[11px] font-bold ${
                    active ? "bg-primary-foreground/20" : "bg-muted-foreground/15"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {tab === "productos" && (
        <section aria-label="Productos">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar producto…"
                aria-label="Buscar producto"
                className={`${INPUT} pl-9`}
              />
            </div>
            <button type="button" className={BTN_PRIMARY} onClick={openCreateProduct}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nuevo producto
            </button>
          </div>

          <div className="mb-4 flex flex-wrap gap-1.5">
            {(["todos", "solar", "muebles", "accesorios"] as DeptFilter[]).map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setDeptFilter(dept)}
                aria-pressed={deptFilter === dept}
                className={`h-11 rounded-full px-3.5 text-xs font-semibold transition-colors ${
                  deptFilter === dept
                    ? "bg-foreground text-background"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {dept === "todos" ? "Todos" : getDepartmentLabel(dept)}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
              <Package className="mx-auto mb-2 h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-semibold">No hay productos que coincidan</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Cambia el filtro o crea un producto nuevo.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredProducts.map((product) => {
                const draft = priceDrafts[product.id];
                const dirty = isPriceDirty(product);
                const isSaving = savingPriceId === product.id;
                const isBusy = busyProductId === product.id;

                return (
                  <article
                    key={product.id}
                    className="rounded-2xl border border-border bg-card p-3 sm:p-4"
                  >
                    <div className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h2 className="line-clamp-2 text-sm font-semibold leading-snug">
                              {product.name}
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {getDepartmentLabel(product.department)} · {product.id}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void toggleStock(product)}
                            disabled={isBusy}
                            aria-pressed={product.inStock}
                            className={`shrink-0 rounded-full px-2.5 text-[11px] font-bold transition-colors ${
                              product.inStock
                                ? "h-9 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/30"
                                : "h-9 bg-muted text-muted-foreground hover:bg-muted/70"
                            }`}
                          >
                            {isBusy ? "…" : product.inStock ? "Disponible" : "Agotado"}
                          </button>
                        </div>

                        <div className="mt-2.5 flex flex-wrap items-end gap-2">
                          <div className="w-[calc(50%-0.25rem)] sm:w-28">
                            <label className={LABEL} htmlFor={`price-${product.id}`}>
                              Precio (USD)
                            </label>
                            <input
                              id={`price-${product.id}`}
                              type="text"
                              inputMode="decimal"
                              value={draft?.price ?? String(product.price)}
                              onChange={(event) => updateDraft(product, "price", event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") void savePrice(product);
                              }}
                              className={`${INPUT} h-10 font-semibold`}
                            />
                          </div>
                          <div className="w-[calc(50%-0.25rem)] sm:w-28">
                            <label className={LABEL} htmlFor={`original-${product.id}`}>
                              Antes
                            </label>
                            <input
                              id={`original-${product.id}`}
                              type="text"
                              inputMode="decimal"
                              value={draft?.originalPrice ?? String(product.originalPrice ?? product.price)}
                              onChange={(event) =>
                                updateDraft(product, "originalPrice", event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") void savePrice(product);
                              }}
                              className={`${INPUT} h-10 text-muted-foreground`}
                            />
                          </div>

                          <div className="flex w-full items-center gap-2 sm:w-auto">
                            <button
                              type="button"
                              onClick={() => void savePrice(product)}
                              disabled={!dirty || isSaving}
                              className={`${dirty ? BTN_PRIMARY : BTN_GHOST} h-10 flex-1 px-3 sm:flex-none`}
                            >
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                              ) : (
                                <Save className="h-4 w-4" aria-hidden="true" />
                              )}
                              Guardar
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditor({ mode: "edit", draft: toDraft(product) })}
                              aria-label={`Editar ${product.name}`}
                              className={`${BTN_GHOST} h-10 flex-1 px-3 sm:flex-none`}
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                              <span className="sm:hidden">Editar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => void removeProduct(product)}
                              disabled={isBusy}
                              aria-label={`Eliminar ${product.name}`}
                              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card px-3 text-muted-foreground transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-300 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        {dirty && (
                          <p className="mt-2 text-[11px] font-medium text-solar-ink">
                            Cambios sin guardar
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {tab === "cotizaciones" && (
        <RequestsPanel
          requests={requests}
          loading={requestsLoading}
          error={requestsError}
          onRefresh={() => void loadRequests()}
          onNewQuote={() => setIsQuoteBuilderOpen(true)}
        />
      )}

      {tab === "ajustes" && (
        <SettingsPanel
          sellerEmail={sellerEmail}
          productCount={productCount}
          onLogout={() => void handleLogout()}
          onDownloadCatalog={downloadCatalog}
        />
      )}

      {editor && (
        <ProductEditorModal
          state={editor}
          saving={isSavingEditor}
          uploading={isUploadingImages}
          onChange={(draft) => setEditor({ ...editor, draft })}
          onClose={() => setEditor(null)}
          onSubmit={() => void saveEditor()}
          onUploadImages={(files) => void handleImageUpload(files)}
        />
      )}

      {isQuoteBuilderOpen && (
        <QuoteBuilderModal
          products={products}
          onClose={() => setIsQuoteBuilderOpen(false)}
          onSaveCatalogPrices={saveQuotePricesToCatalog}
          onRegistered={() => {
            void loadRequests();
            setTab("cotizaciones");
          }}
        />
      )}
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Estructura                                                          */
/* ------------------------------------------------------------------ */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-6 sm:py-8">{children}</div>
    </div>
  );
}

function StatusCard({
  icon,
  title,
  description,
  actions,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actions: React.ReactNode;
  tone: "warning" | "danger";
}) {
  const toneClass =
    tone === "warning" ? "bg-solar/20 text-solar-ink" : "bg-red-100 text-red-700";

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 text-center">
      <span className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${toneClass}`}>
        {icon}
      </span>
      <h1 className="text-lg font-bold">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">{actions}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

function LoginScreen({
  email,
  password,
  showPassword,
  isSigningIn,
  error,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
}: {
  email: string;
  password: string;
  showPassword: boolean;
  isSigningIn: boolean;
  error: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const cloudReady = isSupabaseConfigured();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-solar/25 text-solar-ink">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-bold">Panel de vendedor</h1>
          <p className="mt-1 text-sm text-muted-foreground">Solar y Hogar Panamá</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div>
            <label className={LABEL} htmlFor="admin-email">
              Correo
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="vendedor@correo.com"
              className={INPUT}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="admin-password">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                placeholder="••••••••"
                className={`${INPUT} pr-11`}
              />
              <button
                type="button"
                onClick={onTogglePassword}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <button type="submit" disabled={isSigningIn} className={`${BTN_PRIMARY} w-full`}>
            {isSigningIn ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Lock className="h-4 w-4" aria-hidden="true" />
            )}
            Entrar
          </button>

          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            Solo las cuentas autorizadas pueden cambiar precios y generar cotizaciones.
          </p>
        </form>

        {!cloudReady && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-solar-ink">
              <CloudOff className="h-3.5 w-3.5" aria-hidden="true" />
              La nube no está configurada
            </p>
            <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
              Conecta Supabase para poder iniciar sesión y guardar los cambios.
            </p>
            <CloudConfigForm />
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Conexión con Supabase                                               */
/* ------------------------------------------------------------------ */

function CloudConfigForm() {
  const config = getSupabaseConfig();
  const [url, setUrl] = useState(config?.url ?? "");
  const [key, setKey] = useState(config?.anonKey ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const cleanUrl = url.trim().replace(/\/+$/, "");
    const cleanKey = key.trim();

    if (!cleanUrl || !cleanKey) {
      toast.error("Completa la URL y la clave pública de Supabase");
      return;
    }

    setSaving(true);
    saveSupabaseConfig(cleanUrl, cleanKey);
    toast.success("Conexión guardada", { description: "Recargando el panel…" });
    window.setTimeout(() => window.location.reload(), 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={LABEL} htmlFor="sb-url">
          URL del proyecto
        </label>
        <input
          id="sb-url"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://xxxx.supabase.co"
          className={INPUT}
        />
      </div>
      <div>
        <label className={LABEL} htmlFor="sb-key">
          Clave pública (anon / publishable)
        </label>
        <input
          id="sb-key"
          type="password"
          value={key}
          onChange={(event) => setKey(event.target.value)}
          placeholder="sb_publishable_…"
          className={INPUT}
        />
      </div>
      <button type="submit" disabled={saving} className={`${BTN_GHOST} w-full`}>
        <Cloud className="h-4 w-4" aria-hidden="true" />
        Guardar conexión
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Editor de producto                                                  */
/* ------------------------------------------------------------------ */

function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={`my-2 w-full ${wide ? "max-w-3xl" : "max-w-2xl"} rounded-2xl border border-border bg-card shadow-xl`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div>
            <h2 className="text-base font-bold">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="px-4 py-4 sm:px-5">{children}</div>

        {footer && (
          <footer className="flex flex-col-reverse gap-2 border-t border-border px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

function ProductEditorModal({
  state,
  saving,
  uploading,
  onChange,
  onClose,
  onSubmit,
  onUploadImages,
}: {
  state: EditorState;
  saving: boolean;
  uploading: boolean;
  onChange: (draft: ProductDraft) => void;
  onClose: () => void;
  onSubmit: () => void;
  onUploadImages: (files: File[]) => void;
}) {
  const draft = state.draft;
  const gallery = draft.images?.length ? draft.images : draft.image ? [draft.image] : [];
  const isSolar = draft.department !== "muebles" && draft.department !== "accesorios";

  const setField = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => {
    onChange({ ...draft, [key]: value });
  };

  const setDepartment = (department: ProductDepartment) => {
    const category: Product["category"] =
      department === "muebles" ? "muebles" : department === "accesorios" ? "accesorios" : "farolas";
    onChange({ ...draft, department, category });
  };

  return (
    <Modal
      title={state.mode === "create" ? "Nuevo producto" : "Editar producto"}
      subtitle="Los cambios se guardan en la nube."
      onClose={onClose}
      footer={
        <>
          <button type="button" className={BTN_GHOST} onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="button" className={BTN_PRIMARY} onClick={onSubmit} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="h-4 w-4" aria-hidden="true" />
            )}
            {state.mode === "create" ? "Crear producto" : "Guardar cambios"}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="prod-name">
              Nombre
            </label>
            <input
              id="prod-name"
              type="text"
              value={draft.name}
              onChange={(event) => setField("name", event.target.value)}
              placeholder="Ej: Farola LED Solar Rolinger 1200W"
              className={INPUT}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="prod-tagline">
              Frase corta (opcional)
            </label>
            <input
              id="prod-tagline"
              type="text"
              value={draft.tagline}
              onChange={(event) => setField("tagline", event.target.value)}
              placeholder="Ej: Ilumina toda la noche sin cables"
              className={INPUT}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="prod-dept">
              Departamento
            </label>
            <select
              id="prod-dept"
              value={draft.department ?? "solar"}
              onChange={(event) => setDepartment(event.target.value as ProductDepartment)}
              className={INPUT}
            >
              <option value="solar">Iluminación Solar</option>
              <option value="muebles">Muebles & Terraza</option>
              <option value="accesorios">Accesorios del Hogar</option>
            </select>
          </div>

          <div>
            <label className={LABEL} htmlFor="prod-category">
              Categoría
            </label>
            <select
              id="prod-category"
              value={draft.category}
              onChange={(event) => setField("category", event.target.value as Product["category"])}
              className={INPUT}
            >
              <option value="farolas">Farolas</option>
              <option value="reflector">Reflectores</option>
              <option value="solar">Solar</option>
              <option value="pared">Pared</option>
              <option value="potencia">Potencia</option>
              <option value="jardin">Jardín</option>
              <option value="decoracion">Decoración</option>
              <option value="muebles">Muebles</option>
              <option value="accesorios">Accesorios</option>
            </select>
          </div>

          <div>
            <label className={LABEL} htmlFor="prod-price">
              Precio (USD)
            </label>
            <input
              id="prod-price"
              type="text"
              inputMode="decimal"
              value={draft.price}
              onChange={(event) => setField("price", event.target.value)}
              placeholder="0.00"
              className={INPUT}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="prod-original">
              Precio anterior (USD)
            </label>
            <input
              id="prod-original"
              type="text"
              inputMode="decimal"
              value={draft.originalPrice}
              onChange={(event) => setField("originalPrice", event.target.value)}
              placeholder="Igual al precio actual"
              className={INPUT}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="prod-badge">
              Etiqueta (opcional)
            </label>
            <input
              id="prod-badge"
              type="text"
              value={draft.badge ?? ""}
              onChange={(event) => setField("badge", event.target.value)}
              placeholder="Ej: Más vendido"
              className={INPUT}
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setField("inStock", !draft.inStock)}
              aria-pressed={draft.inStock}
              className={`${BTN_GHOST} w-full ${draft.inStock ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300" : ""}`}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {draft.inStock ? "Disponible" : "Agotado"}
            </button>
          </div>
        </div>

        <div>
          <label className={LABEL} htmlFor="prod-description">
            Descripción
          </label>
          <textarea
            id="prod-description"
            rows={3}
            value={draft.description}
            onChange={(event) => setField("description", event.target.value)}
            placeholder="Describe el producto en una o dos frases."
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className={LABEL} htmlFor="prod-features">
            Características (una por línea)
          </label>
          <textarea
            id="prod-features"
            rows={4}
            value={draft.features.join("\n")}
            onChange={(event) => setField("features", event.target.value.split("\n"))}
            placeholder={"Panel solar monocristalino\nBatería de litio 20.000 mAh\nSensor de movimiento"}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <fieldset className="grid gap-3 sm:grid-cols-3">
          <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Ficha técnica
          </legend>

          {isSolar ? (
            <>
              <div>
                <label className={LABEL} htmlFor="prod-lumens">
                  Potencia / lúmenes
                </label>
                <input
                  id="prod-lumens"
                  type="text"
                  value={draft.lumens ?? ""}
                  onChange={(event) => setField("lumens", event.target.value)}
                  placeholder="Ej: 1200W"
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="prod-battery">
                  Batería
                </label>
                <input
                  id="prod-battery"
                  type="text"
                  value={draft.batteryLife ?? ""}
                  onChange={(event) => setField("batteryLife", event.target.value)}
                  placeholder="Ej: 10-12 horas"
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="prod-waterproof">
                  Resistencia
                </label>
                <input
                  id="prod-waterproof"
                  type="text"
                  value={draft.waterproof ?? ""}
                  onChange={(event) => setField("waterproof", event.target.value)}
                  placeholder="Ej: IP66"
                  className={INPUT}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={LABEL} htmlFor="prod-material">
                  Material
                </label>
                <input
                  id="prod-material"
                  type="text"
                  value={draft.material ?? ""}
                  onChange={(event) => setField("material", event.target.value)}
                  placeholder="Ej: Ratán sintético"
                  className={INPUT}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL} htmlFor="prod-dimensions">
                  Medidas
                </label>
                <input
                  id="prod-dimensions"
                  type="text"
                  value={draft.dimensions ?? ""}
                  onChange={(event) => setField("dimensions", event.target.value)}
                  placeholder="Ej: 120x60x75 cm"
                  className={INPUT}
                />
              </div>
            </>
          )}
        </fieldset>

        <div className="rounded-2xl border border-border bg-background/60 p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold">Fotos</p>
              <p className="text-[11px] text-muted-foreground">
                La primera foto se usa como portada.
              </p>
            </div>
            <label
              htmlFor="prod-photos"
              className={`${BTN_GHOST} cursor-pointer text-xs ${uploading ? "opacity-50" : ""}`}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              Subir fotos
            </label>
            <input
              id="prod-photos"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={uploading}
              onChange={(event) => {
                onUploadImages(Array.from(event.target.files ?? []));
                event.target.value = "";
              }}
            />
          </div>

          {gallery.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
              Sin fotos todavía
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {gallery.map((url, index) => {
                const isCover = draft.image === url;
                return (
                  <li key={`${url.slice(-24)}-${index}`} className="relative overflow-hidden rounded-xl border border-border">
                    <img src={url} alt="" className="h-20 w-full object-cover" loading="lazy" />
                    <div className="flex items-center justify-between gap-1 bg-card px-1.5 py-1">
                      <button
                        type="button"
                        onClick={() => setField("image", url)}
                        className={`text-[10px] font-bold ${
                          isCover ? "text-emerald-700" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isCover ? "Portada" : "Usar"}
                      </button>
                      <button
                        type="button"
                        aria-label="Quitar foto"
                        onClick={() => {
                          const nextGallery = gallery.filter((_, i) => i !== index);
                          onChange({
                            ...draft,
                            images: nextGallery,
                            image: isCover ? nextGallery[0] ?? "" : draft.image,
                          });
                        }}
                        className="text-muted-foreground transition-colors hover:text-red-700"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Cotizaciones                                                        */
/* ------------------------------------------------------------------ */

function RequestsPanel({
  requests,
  loading,
  error,
  onRefresh,
  onNewQuote,
}: {
  requests: RequestSummary[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  onNewQuote: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const downloadPdf = async (request: RequestSummary) => {
    setWorkingId(request.id);
    try {
      await generateQuotationPDF({
        clientName: request.customerName,
        clientPhone: request.customerPhone,
        items: requestToCartItems(request),
        quoteNumber: request.code,
      });
      toast.success(`PDF de ${request.code} generado`);
    } catch (err) {
      toast.error("No se pudo generar el PDF", { description: errorMessage(err) });
    } finally {
      setWorkingId(null);
    }
  };

  const sendWhatsApp = (request: RequestSummary) => {
    const message = buildQuoteMessage({
      code: request.code,
      date: formatDateTime(request.createdAt),
      clientName: request.customerName,
      clientPhone: request.customerPhone,
      sellerName: "",
      items: requestToCartItems(request),
      total: request.total,
    });
    const target = normalizePhone(request.customerPhone) || STORE_WHATSAPP;
    window.open(`https://wa.me/${target}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section aria-label="Cotizaciones y pedidos">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold">Cotizaciones y pedidos</h2>
          <p className="text-xs text-muted-foreground">
            Registro oficial con los precios guardados en el servidor.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Actualizar lista"
            className={`${BTN_GHOST} px-3`}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          <button type="button" className={BTN_PRIMARY} onClick={onNewQuote}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva cotización
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
        >
          {error}
        </p>
      )}

      {loading && requests.length === 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Cargando solicitudes…
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
          <FileText className="mx-auto mb-2 h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-semibold">Todavía no hay solicitudes</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Crea una cotización o espera los pedidos de la tienda.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {requests.map((request) => {
            const expanded = expandedId === request.id;
            const isWorking = workingId === request.id;

            return (
              <article key={request.id} className="rounded-2xl border border-border bg-card p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                        {request.code}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          request.kind === "pedido"
                            ? "bg-primary/10 text-primary"
                            : "bg-solar/25 text-solar-ink"
                        }`}
                      >
                        {request.kind === "pedido" ? "Pedido" : "Cotización"}
                      </span>
                    </div>
                    <h3 className="mt-1 truncate text-sm font-semibold">{request.customerName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(request.createdAt)} · {request.items.length} artículo(s)
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-bold">{money(request.total)}</p>
                    <p className="text-[11px] text-muted-foreground">USD</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void downloadPdf(request)}
                    disabled={isWorking}
                    className={`${BTN_GHOST} h-10 px-3 text-xs`}
                  >
                    {isWorking ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => sendWhatsApp(request)}
                    className={`${BTN_GHOST} h-10 px-3 text-xs`}
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(request.code);
                      toast.success("Código copiado");
                    }}
                    className={`${BTN_GHOST} h-10 px-3 text-xs`}
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    Código
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : request.id)}
                    aria-expanded={expanded}
                    className="ml-auto inline-flex h-10 items-center gap-1 rounded-xl px-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {expanded ? "Ocultar" : "Ver detalle"}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                </div>

                {expanded && (
                  <div className="mt-3 rounded-xl border border-border bg-background/60 p-3">
                    {request.customerPhone && (
                      <p className="mb-2 text-xs text-muted-foreground">
                        Teléfono:{" "}
                        <span className="font-medium text-foreground">{request.customerPhone}</span>
                      </p>
                    )}
                    <ul className="divide-y divide-border">
                      {request.items.map((item, index) => {
                        const catalogPrice = item.catalogPrice;
                        const negotiated =
                          catalogPrice !== undefined &&
                          Math.abs(catalogPrice - item.unitPrice) >= 0.01;

                        return (
                          <li
                            key={`${item.productId}-${index}`}
                            className="flex items-start justify-between gap-3 py-2 text-xs"
                          >
                            <span className="min-w-0">
                              <span className="font-semibold">{item.quantity}x</span> {item.name}
                              <span className="block text-[11px] text-muted-foreground">
                                {negotiated && catalogPrice !== undefined ? (
                                  <>
                                    <span className="line-through">{money(catalogPrice)}</span>{" "}
                                    <span className="font-semibold text-foreground">
                                      {money(item.unitPrice)}
                                    </span>{" "}
                                    c/u · negociado
                                  </>
                                ) : (
                                  `${money(item.unitPrice)} c/u`
                                )}
                              </span>
                            </span>
                            <span className="shrink-0 font-semibold">{money(item.lineTotal)}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm font-bold">
                      <span>Total</span>
                      <span>{money(request.total)}</span>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function QuoteBuilderModal({
  products,
  onClose,
  onRegistered,
  onSaveCatalogPrices,
}: {
  products: Product[];
  onClose: () => void;
  onRegistered: (request: RegisteredRequest) => void;
  onSaveCatalogPrices: (updates: Array<{ product: Product; price: number }>) => Promise<void>;
}) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [sellerName, setSellerName] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("solara_seller_display_name") ?? "";
  });
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [isWorking, setIsWorking] = useState<"pdf" | "whatsapp" | null>(null);
  const [isSavingCatalog, setIsSavingCatalog] = useState(false);
  const [error, setError] = useState("");

  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const rows = useMemo(
    () =>
      lines.flatMap((line) => {
        const product = productsById.get(line.productId);
        return product ? [{ product, quantity: line.quantity }] : [];
      }),
    [lines, productsById],
  );

  /**
   * Precio de la línea: el que escribió el vendedor o, si dejó el campo vacío,
   * el del catálogo. `custom` indica que hay precio negociado.
   */
  const priceState = useCallback(
    (product: Product): { price: number; custom: boolean; invalid: boolean } => {
      const catalogPrice = roundMoney(product.price);
      const raw = priceInputs[product.id];
      if (raw === undefined || raw.trim() === "") {
        return { price: catalogPrice, custom: false, invalid: false };
      }
      const parsed = parseMoney(raw);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return { price: catalogPrice, custom: false, invalid: true };
      }
      const price = roundMoney(parsed);
      return { price, custom: Math.abs(price - catalogPrice) >= 0.01, invalid: false };
    },
    [priceInputs],
  );

  const customCount = rows.filter((row) => priceState(row.product).custom).length;

  const total = roundMoney(
    rows.reduce((sum, row) => sum + priceState(row.product).price * row.quantity, 0),
  );

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products.slice(0, 5);
    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(term) || product.id.toLowerCase().includes(term),
      )
      .slice(0, 6);
  }, [products, search]);

  const addItem = (product: Product) => {
    setLines((prev) => {
      const existing = prev.find((line) => line.productId === product.id);
      if (existing) {
        return prev.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: Math.min(99, line.quantity + 1) }
            : line,
        );
      }
      return [...prev, { productId: product.id, quantity: 1 }];
    });
  };

  const changeQuantity = (productId: string, delta: number) => {
    setLines((prev) =>
      prev
        .map((line) =>
          line.productId === productId
            ? { ...line, quantity: Math.max(0, Math.min(99, line.quantity + delta)) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  };

  const setLinePrice = (productId: string, value: string) => {
    setError("");
    setPriceInputs((prev) => ({ ...prev, [productId]: value }));
  };

  const resetLinePrice = (productId: string) => {
    setPriceInputs((prev) => {
      if (!(productId in prev)) return prev;
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const savePricesToCatalog = async () => {
    const updates = rows.flatMap(({ product }) => {
      const unit = priceState(product);
      return unit.custom ? [{ product, price: unit.price }] : [];
    });

    if (updates.length === 0) return;

    setIsSavingCatalog(true);
    try {
      await onSaveCatalogPrices(updates);
      setPriceInputs((prev) => {
        const copy = { ...prev };
        for (const update of updates) delete copy[update.product.id];
        return copy;
      });
      toast.success("Precios guardados en el catálogo", {
        description: `${updates.length} producto(s) actualizado(s).`,
      });
    } catch (err) {
      toast.error("No se pudieron guardar los precios", { description: errorMessage(err) });
    } finally {
      setIsSavingCatalog(false);
    }
  };

  const finish = async (mode: "pdf" | "whatsapp") => {
    if (rows.length === 0) {
      setError("Agrega al menos un producto a la cotización.");
      return;
    }

    const invalidRow = rows.find((row) => priceState(row.product).invalid);
    if (invalidRow) {
      setError(`Precio inválido en "${invalidRow.product.name}". Escribe un número mayor que 0.`);
      return;
    }

    const name = clientName.trim() || "Cliente Particular";
    const phone = clientPhone.trim();
    const seller = sellerName.trim();

    setError("");
    setIsWorking(mode);

    const pricedRows = rows.map((row) => ({ ...row, unit: priceState(row.product) }));
    const cartItems: CartItem[] = pricedRows.map(({ product, quantity, unit }) => ({
      product: { ...product, price: unit.price },
      quantity,
    }));
    // Solo se envía `unitPrice` cuando hay precio negociado. El servidor lo
    // aplica únicamente si quien cotiza está registrado en public.sellers.
    const requestItems = pricedRows.map(({ product, quantity, unit }) =>
      unit.custom
        ? { productId: product.id, quantity, unitPrice: unit.price }
        : { productId: product.id, quantity },
    );

    let request: RegisteredRequest | null = null;
    try {
      request = await registerRequest({
        kind: "cotizacion",
        customerName: name,
        customerPhone: phone,
        notes: { sellerName: seller },
        items: requestItems,
      });
    } catch (err) {
      setError(`No se pudo registrar la cotización: ${errorMessage(err)}`);
      setIsWorking(null);
      return;
    }

    const registered = request;
    const finalItems = registered ? applyServerPrices(cartItems, registered) : cartItems;
    const finalTotal = registered ? registered.total : total;
    const code = request?.code ?? `BORRADOR-${Date.now().toString().slice(-6)}`;
    const date = new Date().toLocaleDateString("es-PA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    try {
      if (mode === "pdf") {
        await generateQuotationPDF({
          clientName: name,
          clientPhone: phone,
          sellerName: seller,
          items: finalItems,
          quoteNumber: code,
        });
      } else {
        const message = buildQuoteMessage({
          code,
          date,
          clientName: name,
          clientPhone: phone,
          sellerName: seller,
          items: finalItems,
          total: finalTotal,
        });
        const target = normalizePhone(phone) || STORE_WHATSAPP;
        window.open(`https://wa.me/${target}?text=${encodeURIComponent(message)}`, "_blank");
      }

      toast.success(`Cotización ${code} lista`, {
        description: registered
          ? "Registrada en el servidor."
          : "Modo local: no se guardó en la nube.",
      });

      if (registered) {
        const ignoredPrices = pricedRows.filter(({ product, unit }) => {
          if (!unit.custom) return false;
          const saved = registered.items.find((item) => item.productId === product.id);
          return saved ? Math.abs(saved.unitPrice - unit.price) >= 0.01 : false;
        });

        if (ignoredPrices.length > 0) {
          toast.warning("El servidor usó el precio del catálogo", {
            description:
              "Falta ejecutar el SQL actualizado de create_request en Supabase para guardar precios negociados.",
          });
        }
      }

      if (seller) {
        try {
          localStorage.setItem("solara_seller_display_name", seller);
        } catch {
          // sin almacenamiento disponible
        }
      }

      if (registered) onRegistered(registered);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsWorking(null);
    }
  };

  return (
    <Modal
      title="Nueva cotización"
      subtitle="Ajusta cantidades y precios; el servidor confirma el total."
      onClose={onClose}
      wide
      footer={
        <>
          <button
            type="button"
            className={BTN_GHOST}
            onClick={onClose}
            disabled={isWorking !== null}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={BTN_GHOST}
            onClick={() => void finish("whatsapp")}
            disabled={isWorking !== null || isSavingCatalog || rows.length === 0}
          >
            {isWorking === "whatsapp" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            Enviar por WhatsApp
          </button>
          <button
            type="button"
            className={BTN_PRIMARY}
            onClick={() => void finish("pdf")}
            disabled={isWorking !== null || isSavingCatalog || rows.length === 0}
          >
            {isWorking === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <FileText className="h-4 w-4" aria-hidden="true" />
            )}
            Generar PDF
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className={LABEL} htmlFor="quote-name">
              Cliente
            </label>
            <input
              id="quote-name"
              type="text"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              placeholder="Nombre o empresa"
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="quote-phone">
              Teléfono
            </label>
            <input
              id="quote-phone"
              type="tel"
              value={clientPhone}
              onChange={(event) => setClientPhone(event.target.value)}
              placeholder="6000-0000"
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="quote-seller">
              Vendedor
            </label>
            <input
              id="quote-seller"
              type="text"
              value={sellerName}
              onChange={(event) => setSellerName(event.target.value)}
              placeholder="Tu nombre"
              className={INPUT}
            />
          </div>
        </div>

        <div>
          <label className={LABEL} htmlFor="quote-search">
            Agregar productos
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="quote-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre…"
              className={`${INPUT} pl-9`}
            />
          </div>

          <ul className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-border">
            {results.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                Sin resultados
              </li>
            ) : (
              results.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => addItem(product)}
                    className="flex w-full items-center justify-between gap-3 border-b border-border px-3 py-2 text-left text-xs transition-colors last:border-0 hover:bg-muted"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{product.name}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {getDepartmentLabel(product.department)}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold">{money(product.price)}</span>
                    <Plus className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            Productos en la cotización ({rows.length})
          </p>

          {rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
              Busca un producto y tócalo para agregarlo.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {rows.map(({ product, quantity }) => {
                const unit = priceState(product);
                const catalogPrice = roundMoney(product.price);

                return (
                  <li key={product.id} className="px-3 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold">{product.name}</span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">
                          {unit.custom ? (
                            <>
                              <span className="line-through">{money(catalogPrice)}</span>{" "}
                              <span className="font-semibold text-foreground">
                                {money(unit.price)}
                              </span>{" "}
                              c/u · negociado
                            </>
                          ) : (
                            `${money(unit.price)} c/u`
                          )}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-bold">
                        {money(unit.price * quantity)}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div
                        className={`flex h-11 items-center gap-1 rounded-xl border bg-background px-2 ${
                          unit.invalid ? "border-red-400" : "border-border"
                        }`}
                      >
                        <span
                          className="text-[11px] font-semibold text-muted-foreground"
                          aria-hidden="true"
                        >
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={priceInputs[product.id] ?? ""}
                          onChange={(event) => setLinePrice(product.id, event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") event.currentTarget.blur();
                          }}
                          placeholder={catalogPrice.toFixed(2)}
                          aria-label={`Precio unitario de ${product.name}`}
                          aria-invalid={unit.invalid}
                          className={`h-9 w-20 bg-transparent text-xs font-semibold text-foreground outline-none ${
                            unit.invalid ? "text-red-700 dark:text-red-300" : ""
                          }`}
                        />
                        <span className="text-[10px] text-muted-foreground">c/u</span>
                      </div>

                      {unit.custom && (
                        <button
                          type="button"
                          onClick={() => resetLinePrice(product.id)}
                          aria-label={`Restaurar precio de catálogo de ${product.name}`}
                          className="inline-flex h-11 items-center gap-1 rounded-xl px-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                          Restaurar
                        </button>
                      )}

                      <div className="ml-auto flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => changeQuantity(product.id, -1)}
                          aria-label={`Quitar una unidad de ${product.name}`}
                          className="flex h-11 w-11 items-center justify-center rounded-lg border border-border hover:bg-muted"
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => changeQuantity(product.id, 1)}
                          aria-label={`Agregar una unidad de ${product.name}`}
                          className="flex h-11 w-11 items-center justify-center rounded-lg border border-border hover:bg-muted"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          >
            {error}
          </p>
        )}

        {customCount > 0 && (
          <button
            type="button"
            onClick={() => void savePricesToCatalog()}
            disabled={isWorking !== null || isSavingCatalog}
            className={`${BTN_GHOST} w-full text-xs`}
          >
            {isSavingCatalog ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            Guardar estos precios en el catálogo
          </button>
        )}

        <div className="flex items-center justify-between rounded-xl bg-muted px-3 py-2.5">
          <span className="text-xs font-semibold text-muted-foreground">
            Total {customCount > 0 ? "con precios negociados" : "estimado"}
          </span>
          <span className="text-base font-bold">{money(total)} USD</span>
        </div>

        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Los precios que edites quedan guardados en esta cotización. El catálogo solo cambia si
          usas “Guardar estos precios en el catálogo”.
        </p>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Ajustes                                                             */
/* ------------------------------------------------------------------ */

function SettingsPanel({
  sellerEmail,
  productCount,
  onLogout,
  onDownloadCatalog,
}: {
  sellerEmail: string;
  productCount: number;
  onLogout: () => void;
  onDownloadCatalog: () => void;
}) {
  const cloudReady = isSupabaseConfigured();
  const config = getSupabaseConfig();
  const envConfig = (import.meta as any).env ?? {};
  const usesEnvConfig = Boolean(envConfig.VITE_SUPABASE_URL && envConfig.VITE_SUPABASE_ANON_KEY);

  return (
    <section aria-label="Ajustes" className="space-y-3">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-bold">Cuenta</h2>
        <dl className="space-y-2 text-xs">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Correo</dt>
            <dd className="truncate font-semibold">{sellerEmail}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Rol</dt>
            <dd className="inline-flex items-center gap-1.5 font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Vendedor autorizado
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Productos en el catálogo</dt>
            <dd className="font-semibold">{productCount}</dd>
          </div>
        </dl>
        <button type="button" onClick={onLogout} className={`${BTN_GHOST} mt-4 w-full`}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold">Conexión con la nube</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {cloudReady ? "Supabase conectado" : "Supabase sin configurar"}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
              cloudReady
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                : "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200"
            }`}
          >
            {cloudReady ? (
              <Cloud className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <CloudOff className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {cloudReady ? "En línea" : "Local"}
          </span>
        </div>

        {config && (
          <p className="mt-3 truncate rounded-xl bg-muted px-3 py-2 font-mono text-[11px] text-muted-foreground">
            {config.url}
          </p>
        )}

        {usesEnvConfig ? (
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Las credenciales vienen de las variables de entorno del despliegue. Para cambiarlas,
            edita <code className="font-mono">VITE_SUPABASE_URL</code> y{" "}
            <code className="font-mono">VITE_SUPABASE_ANON_KEY</code>.
          </p>
        ) : (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground">
              Cambiar credenciales
            </summary>
            <div className="mt-3">
              <CloudConfigForm />
            </div>
          </details>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold">Copia de seguridad</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Descarga el catálogo actual en un archivo JSON.
        </p>
        <button type="button" onClick={onDownloadCatalog} className={`${BTN_GHOST} mt-3 w-full`}>
          <Download className="h-4 w-4" aria-hidden="true" />
          Descargar catálogo
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-1 flex items-center gap-1.5 text-sm font-bold">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          Permisos
        </h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Solo las cuentas registradas como vendedoras pueden cambiar precios, editar productos y
          leer las cotizaciones. Los visitantes de la tienda solo pueden consultar el catálogo.
        </p>
        {!isCloudAuthAvailable() && (
          <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            Sin Supabase configurado, el panel funciona en modo local y los cambios no se guardan en
            la nube.
          </p>
        )}
      </div>
    </section>
  );
}
