import { createClient, SupabaseClient } from "@supabase/supabase-js";

const STORAGE_CONFIG_KEY = "solara_supabase_credentials_v1";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Obtiene la configuración de Supabase desde variables de entorno VITE_*
 * o desde la configuración guardada por el administrador en el panel.
 */
export function getSupabaseConfig(): SupabaseConfig | null {
  // 1. Prioridad: Variables de entorno
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey && !envUrl.includes("TU_PROYECTO")) {
    return { url: envUrl.trim(), anonKey: envKey.trim() };
  }

  // 2. Respaldo: Configuración ingresada en /admin
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SupabaseConfig;
        if (parsed.url && parsed.anonKey) {
          return { url: parsed.url.trim(), anonKey: parsed.anonKey.trim() };
        }
      }
    } catch {
      // Ignorar errores de parseo
    }
  }

  return null;
}

/**
 * Guarda las credenciales de Supabase desde el panel de administración
 */
export function saveSupabaseConfig(
  configOrUrl: SupabaseConfig | string,
  maybeAnonKey?: string
): void {
  if (typeof window === "undefined") return;
  const config: SupabaseConfig =
    typeof configOrUrl === "string"
      ? { url: configOrUrl.trim(), anonKey: (maybeAnonKey || "").trim() }
      : { url: configOrUrl.url.trim(), anonKey: configOrUrl.anonKey.trim() };

  localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
  // Limpiar instancia previa
  supabaseClientInstance = null;
}


export function clearSupabaseConfig(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_CONFIG_KEY);
  supabaseClientInstance = null;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Retorna el cliente Supabase activo o null si aún no se ha configurado la conexión.
 */
export function getSupabase(): SupabaseClient | null {
  if (supabaseClientInstance) return supabaseClientInstance;

  const config = getSupabaseConfig();
  if (!config) return null;

  try {
    supabaseClientInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    return supabaseClientInstance;
  } catch (err) {
    console.error("Error inicializando Supabase:", err);
    return null;
  }
}

/**
 * Sube una imagen a Supabase Storage (bucket 'products') y retorna su URL pública accesible globalmente.
 */
export async function uploadImageToSupabase(
  file: File,
  folder = "products"
): Promise<{ url: string | null; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { url: null, error: "Supabase no está conectado" };
  }

  try {
    // Generar nombre de archivo único
    const ext = file.name.split(".").pop() || "jpg";
    const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `${folder}/${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, file, {
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.warn("Fallo subiendo imagen a bucket 'products':", uploadError.message);
      return { url: null, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl };
  } catch (err: any) {
    return { url: null, error: err?.message || "Error al subir imagen" };
  }
}
