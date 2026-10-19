import { Product } from "../types/store";

/**
 * Determina si un producto es una lámpara solar o pertenece al departamento solar.
 * Los términos técnicos como Watts, lúmenes, tiempo de carga, batería y resistencia solar
 * SOLO deben mostrarse si esta función devuelve true.
 */
export function isSolarProduct(product?: Partial<Product> | null): boolean {
  if (!product) return false;

  // Si explícitamente es muebles o accesorios, NO es lámpara solar
  if (product.department === "muebles" || product.department === "accesorios") {
    return false;
  }

  // Si explícitamente su departamento es solar
  if (product.department === "solar") {
    return true;
  }

  // Clasificación por categoría
  const solarCategories = ["farolas", "reflector", "solar", "pared", "potencia", "jardin"];
  if (product.category && solarCategories.includes(product.category)) {
    return true;
  }

  // Categorías de no-iluminación
  const nonSolarCategories = ["muebles", "accesorios", "decoracion"];
  if (product.category && nonSolarCategories.includes(product.category)) {
    return false;
  }

  // Si tiene datos de lúmenes o batería y no fue marcado como muebles/accesorios
  return Boolean(product.lumens || product.batteryLife);
}

/**
 * Retorna una etiqueta amigable del departamento para productos no solares
 */
export function getDepartmentLabel(department?: string): string {
  switch (department) {
    case "muebles":
      return "Muebles & Terraza";
    case "accesorios":
      return "Accesorios del Hogar";
    case "solar":
      return "Iluminación Solar";
    default:
      return "Hogar & Decoración";
  }
}
