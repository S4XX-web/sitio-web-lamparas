import { getSupabase } from "../lib/supabase";

/**
 * Autenticación real del vendedor mediante Supabase Auth (correo + contraseña).
 *
 * Sustituye al antiguo PIN guardado en localStorage, que podía leerse y
 * modificarse desde el navegador y no protegía nada en la nube.
 *
 * Requisitos en Supabase:
 *  1. Authentication → Users → crear el usuario del vendedor.
 *  2. Desactivar "Allow new users to sign up" (Authentication → Providers → Email).
 *  3. Ejecutar supabase-schema.sql para que las políticas RLS solo permitan
 *     escribir a los usuarios listados en public.sellers.
 */

export interface SellerSession {
  userId: string;
  email: string | null;
}

export type SellerAccess =
  | { status: "seller"; userId: string; email: string | null }
  | { status: "not_seller" }
  | { status: "unavailable"; message: string };

function toSession(user: { id: string; email?: string | null } | null | undefined): SellerSession | null {
  if (!user) return null;
  return { userId: user.id, email: user.email ?? null };
}

/** Indica si hay un proyecto de Supabase configurado (sin él no hay login posible). */
export function isCloudAuthAvailable(): boolean {
  return getSupabase() !== null;
}

/** Devuelve la sesión activa del vendedor, o null si no ha iniciado sesión. */
export async function getSellerSession(): Promise<SellerSession | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return toSession(data.session?.user);
  } catch {
    return null;
  }
}

/** Inicia sesión con correo y contraseña contra Supabase Auth. */
export async function signInSeller(
  email: string,
  password: string
): Promise<{ session: SellerSession | null; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      session: null,
      error: "La nube no está configurada. Conecta Supabase antes de iniciar sesión.",
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { session: null, error: "Ingresa tu correo y contraseña." };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes("invalid login credentials")) {
        return { session: null, error: "Correo o contraseña incorrectos." };
      }
      if (message.includes("email not confirmed")) {
        return { session: null, error: "Debes confirmar tu correo antes de entrar." };
      }
      if (message.includes("rate limit") || message.includes("too many")) {
        return { session: null, error: "Demasiados intentos. Espera un momento e inténtalo de nuevo." };
      }
      if (
        message.includes("failed to fetch") ||
        message.includes("network") ||
        message.includes("load failed")
      ) {
        return { session: null, error: "Error de conexión con la nube. Revisa tu internet e inténtalo de nuevo." };
      }
      return { session: null, error: "No se pudo iniciar sesión. Verifica tus datos." };
    }

    return { session: toSession(data.user) };
  } catch {
    return { session: null, error: "Error de conexión. Revisa tu internet e inténtalo de nuevo." };
  }
}

/**
 * Comprueba si la sesión activa pertenece a un vendedor autorizado.
 *
 * Estar autenticado NO basta: la fila en `public.sellers` es la que habilita
 * las políticas RLS de escritura. Sin esa fila el panel queda bloqueado y,
 * aunque alguien llame a la API por fuera, Postgres rechaza el cambio.
 */
export async function getSellerProfile(session: SellerSession | null): Promise<SellerAccess> {
  const supabase = getSupabase();
  if (!supabase || !session) return { status: "not_seller" };

  try {
    const { data, error } = await supabase
      .from("sellers")
      .select("user_id, email")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (error) {
      const message = error.message ?? "";
      if (/does not exist|could not find the table|schema cache/i.test(message)) {
        return {
          status: "unavailable",
          message: "Falta crear la tabla de vendedores. Ejecuta supabase-schema.sql en Supabase.",
        };
      }
      return { status: "unavailable", message: "No se pudo verificar tu cuenta de vendedor." };
    }

    if (!data) return { status: "not_seller" };

    return {
      status: "seller",
      userId: session.userId,
      email: (data.email as string | null) ?? session.email,
    };
  } catch {
    return { status: "unavailable", message: "No se pudo verificar tu cuenta de vendedor." };
  }
}

/** Cierra la sesión del vendedor en este dispositivo. */
export async function signOutSeller(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.auth.signOut();
  } catch {
    // Si falla la red, igual limpiamos la sesión local del cliente
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
  }
}

/**
 * Escucha cambios de sesión (login, logout, refresh de token, cambio de pestaña).
 * Devuelve la función para cancelar la suscripción.
 */
export function onSellerAuthChange(
  callback: (session: SellerSession | null) => void
): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(toSession(session?.user));
  });

  return () => data.subscription.unsubscribe();
}
