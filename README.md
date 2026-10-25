# Solar y Hogar Panamá — Tienda Oficial de Luminarias Solares Rolinger

Sitio web y catálogo interactivo de **Solar y Hogar Panamá**, desarrollado con **TanStack Start (SSR)**, **React 19**, **TypeScript** y **Tailwind CSS v4**, desplegado en **Cloudflare Workers** con **Supabase** como base de datos, autenticación y almacenamiento de imágenes.

## Modelos en Catálogo
- **Farola LED Solar de Calle Rolinger 1200W** (con sensor de radar inteligente e IP66)
- **Farola LED Solar de Calle Rolinger 800W** (con sensor de radar inteligente e IP66)
- **Proyector LED Solar Rolinger 300W (TYN-JBP-300W)** (con panel solar independiente e IP67)

## Desarrollo Local
```bash
npm install
npm run dev
```

## Compilación y despliegue (Cloudflare Workers)
```bash
npm run build
npm run deploy
```
El Worker se publica con `wrangler` (`.output/server/index.mjs` + assets de `.output/public`). Las cabeceras de seguridad (CSP incluida) se aplican en `src/server.ts`.

## Base de datos (Supabase)

Antes del primer despliegue, ejecuta **todo** `supabase-schema.sql` en el *SQL Editor* de tu proyecto (o usa el botón “Copiar Script SQL Completo” del panel `/admin`). El archivo es idempotente: puedes volver a ejecutarlo cuando cambie.

Además de las tablas de catálogo, crea:

- `public.sellers`: usuarios autorizados a editar el catálogo.
- `public.requests`: cotizaciones (`COT-`) y pedidos (`PED-`) con el total calculado por Postgres.
- `public.create_request(jsonb)`: función `SECURITY DEFINER` que ignora cualquier precio enviado por el navegador y usa el de `public.products`.

Después de crear el usuario vendedor en *Authentication → Users* y desactivar el registro público, regístralo:

```sql
INSERT INTO public.sellers (user_id, email)
SELECT id, email FROM auth.users WHERE email = 'tu-correo@dominio.com'
ON CONFLICT (user_id) DO NOTHING;
```

Mientras la sección 9 del esquema no esté aplicada, la tienda sigue funcionando, pero las cotizaciones y los pedidos se emiten como `BORRADOR-` (no verificables). Con el esquema aplicado, el PDF y el mensaje de WhatsApp solo se generan con el código oficial que devuelve el servidor.

## Pruebas

```bash
npm test
```

Incluye pruebas de la validación de precios en servidor contra un Postgres real en WASM (`@electric-sql/pglite`), además del registro de solicitudes y del enrutado.

