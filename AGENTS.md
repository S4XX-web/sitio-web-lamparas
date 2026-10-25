# Notas del proyecto

Solar y Hogar Panamá — tienda de luminarias solares.

- **Stack:** TanStack Start (SSR) + React 19 + TypeScript + Tailwind CSS v4.
- **Backend:** Supabase (Postgres + RLS, Auth y Storage para fotos).
- **Hosting:** Cloudflare Workers (`wrangler.json`, `npm run build && npm run deploy`).
- **Seguridad:** las cabeceras (CSP incluida) se aplican en `src/server.ts`; el esquema y las políticas RLS están en `supabase-schema.sql`.
- El panel `/admin` usa Supabase Auth (correo + contraseña) y solo escribe quien esté registrado en `public.sellers`.
- **Cotizaciones y pedidos:** el navegador solo envía `productId` + `quantity` a `public.create_request(jsonb)` (sección 9 de `supabase-schema.sql`). Postgres lee el precio real, calcula el total y devuelve el código `COT-`/`PED-`. La lógica de cliente está en `src/services/requestService.ts`; sin servidor, el documento se marca como `BORRADOR-`.
- **Pruebas:** `npm test` (Vitest). `src/test/createRequestSql.test.ts` valida la función SQL contra Postgres en WASM con PGlite.

El proyecto ya no está conectado al editor de Lovable: el repositorio y el despliegue son independientes.
