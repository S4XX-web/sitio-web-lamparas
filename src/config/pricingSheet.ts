/**
 * CONFIGURACIÓN DE SINCRONIZACIÓN DE PRECIOS CON GOOGLE SHEETS
 * 
 * ¿Cómo funciona?
 * 1. Creas una hoja en Google Sheets con columnas: ID, Nombre, Precio, Precio_Anterior, Stock
 * 2. En Google Sheets vas a: Archivo > Compartir > "Cualquier persona con el enlace puede ver"
 * 3. Copias el ID de la hoja (la serie de letras y números entre /d/ y /edit en la URL)
 * 4. Lo pegas aquí en SHEET_ID.
 */

export const PRICING_SHEET_CONFIG = {
  // Activa o desactiva la sincronización con Google Sheets
  enabled: true,

  // ID de tu hoja de cálculo de Google Sheets.
  // Ejemplo: Si tu URL es https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
  // ID de tu hoja de cálculo de Google Sheets proporcionada por el usuario
  sheetId: "12JdkK2YsEzTisccab2rkaa6IgxPxkLwBW7v1wLz9DYE",

  // Nombre de la pestaña (opcional, si se deja vacío toma la primera hoja automáticamente)
  sheetName: "",

  // Intervalo de actualización automática en segundo plano (en milisegundos)
  // 30000 = 30 segundos para máxima agilidad al cambiar precios
  autoSyncIntervalMs: 30000,

  // Clave para guardar en caché local del navegador (para carga instantánea a 0ms)
  storageKey: "solara_live_prices_cache_v1",
};
