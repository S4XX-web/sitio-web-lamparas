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

/**
 * Reordena el nombre para que la potencia (800W / 1200W / 300W) quede al
 * principio. Los modelos de farola solo se diferencian por el vatios, y al
 * recortar el título a una línea ese dato era justo el que se perdía.
 *
 * "Farola LED Solar de Calle Rolinger 1200W" -> "1200W · Farola LED Solar de Calle Rolinger"
 */
export function formatProductName(name: string): string {
  if (!name) return "";

  const matches = [...name.matchAll(/\b(\d{2,4})\s?W\b/gi)];
  const last = matches[matches.length - 1];
  if (!last) return name;

  // Solo movemos la potencia si está en la segunda mitad del nombre:
  // así no tocamos nombres que ya empiezan por ella.
  const index = last.index ?? 0;
  if (index < name.length / 2) return name;

  const wattage = last[0].replace(/\s+/g, "");
  const rest = name.replace(last[0], "").replace(/\s{2,}/g, " ").trim();
  return rest ? `${wattage} · ${rest}` : name;
}
