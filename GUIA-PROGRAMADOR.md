# Solara — Tienda de lámparas solares

Página de venta de una sola pantalla (landing + catálogo) construida con una paleta
ecológica: crema cálido, verdes bosque/hoja y ámbar solar. La sección de productos usa
glassmorphism (tarjetas de vidrio esmerilado sobre un fondo verde con resplandores).

## Stack

| Área | Tecnología |
| --- | --- |
| Framework | TanStack Start v1 (React 19 + TypeScript, SSR/SSG) |
| Build | Vite 8 con `@lovable.dev/vite-tanstack-config` |
| Estilos | Tailwind CSS v4 (configuración por CSS: `src/styles.css`, **no** hay `tailwind.config.js`) |
| Componentes UI | shadcn/ui sobre Radix (`src/components/ui/`, ya instalado, casi sin usar) |
| Iconos | lucide-react |
| Tests | Vitest + Testing Library (`src/test/`) |

## Arranque

```sh
cd solara-lamparas-solares
npm install        # o: bun install
npm run dev        # abre la URL que imprime Vite (http://localhost:8080)
```

Otros comandos:

```sh
npm run build      # build de producción
npm run preview    # sirve el build localmente
npm run lint       # eslint
npm run format     # prettier
npm run test       # vitest
```

## Archivos importantes

| Ruta | Qué contiene |
| --- | --- |
| `src/routes/index.tsx` | **Toda la página**: encabezado, portada, beneficios, catálogo, franja de envío, contacto y pie. |
| `src/styles.css` | Tokens de color (design system) y utilidades `glass` / `glass-chip`. |
| `src/routes/__root.tsx` | `<html>`, `<head>`, meta tags, favicon y `<link>` de las tipografías. |
| `src/assets/hero-solar.jpg` | Foto de la portada (se importa como `heroImage`). |
| `src/router.tsx`, `src/server.ts`, `src/start.ts` | Arranque de TanStack Start. No tocar salvo que cambie la arquitectura. |
| `src/routeTree.gen.ts` | **Autogenerado.** No editar a mano. |
| `vite.config.ts` | Configuración de Vite (una sola opción: `server.entry`). |

## Dónde cambiar cada cosa

### Productos

En `src/routes/index.tsx`, el arreglo `productos` (al inicio del archivo). Cada objeto tiene
`nombre`, `descripcion` y `precio`. Para agregar una foto real, añade un campo `imagen` y
usa `<img src={p.imagen} />` en la tarjeta; las imágenes se colocan en `src/assets/` y se
importan arriba (`import farol from "../assets/farol.jpg";`) o se sirven desde `public/`.

```ts
const productos = [
  { nombre: "Lámpara Solar de Jardín", descripcion: "Luz cálida con estaca…", precio: "$19.99" },
  // …
];
```

### Colores

En `src/styles.css`, bloque `:root`. Todos los componentes leen de ahí, así que cambiar un
token re-colorea toda la página:

- `--background` / `--foreground`: crema cálido y verde bosque (texto).
- `--primary`: verde hoja (botones).
- `--accent` y `--solar`: ámbar/dorado solar (precios, acentos).
- `--forest`, `--leaf`, `--earth`, `--sand`: tokens de marca usados en el fondo de la sección de productos.
- `--radius`: redondez general.

No hardcodear colores en los componentes: usar las clases `bg-primary`, `text-solar`,
`border-border`, etc., o los tokens `var(--…)`.

### Efecto glassmorphism

`src/styles.css`, al final: `@utility glass` (vidrio esmerilado: `backdrop-filter: blur(20px)`,
fondo al 45 % y sombra interior) y `@utility glass-chip` (chip ámbar). Se aplican como
`className="glass"`; la intensidad se ajusta en el `blur()` y en el porcentaje de `color-mix`.

### Tipografías

Están en `src/routes/__root.tsx` (`<link>` de Google Fonts: **Fraunces** para títulos,
**Nunito Sans** para texto) y se asignan en `src/styles.css` (`@layer base`, `body` y `h1–h4`).
Si cambias de fuente, actualiza los dos lugares.

## Pendientes / notas para el programador

1. **Sin backend.** No hay base de datos, usuarios ni carrito real: el botón "Añadir al
   carrito" es decorativo. Para cobrar hay que conectar Shopify (carrito y checkout
   alojados) o Stripe.
2. **Meta tags del root.** `src/routes/__root.tsx` todavía trae `title` y `og:*`
   genéricos ("Lovable App"). `src/routes/index.tsx` sí define los de Solara; conviene
   mover los definitivos al root y borrar los genéricos.
3. **Idioma.** `__root.tsx` tiene `<html lang="en">`; cambiar a `lang="es"`.
4. **Fotos de productos.** Las 6 tarjetas usan un fondo de vidrio, no imágenes.
   Reemplazar por fotos reales cuando el catálogo esté definido.
5. **Plugin de Vite.** `vite.config.ts` importa `@lovable.dev/vite-tanstack-config`, que
   ya incluye los plugins de TanStack Start, React, Tailwind, `tsconfigPaths` y `nitro`
   (target Cloudflare). Si el proyecto se lleva fuera de Lovable, sustituirlo por un
   `defineConfig` de Vite que declare esos plugins manualmente (sin duplicarlos).
6. **Despliegue.** El build genera un sitio SSR para Cloudflare Workers (nitro). Para
   hostear en Node u otro proveedor, ajustar el target de nitro en `vite.config.ts`.
