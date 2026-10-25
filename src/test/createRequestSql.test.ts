// @vitest-environment node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Verifica contra un Postgres real (PGlite/WASM) que la función
 * public.create_request del esquema calcula los importes con los precios
 * de la base y no con los que envía el navegador.
 */

const schemaPath = fileURLToPath(new URL("../../supabase-schema.sql", import.meta.url));
const fullSchema = readFileSync(schemaPath, "utf8");
const requestsSql = fullSchema.slice(fullSchema.indexOf("-- 9. SOLICITUDES"));

let db: PGlite;

type CreateRequestResult = {
  code: string;
  kind: string;
  total: number;
  subtotal: number;
  items: Array<{
    productId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
};

async function createRequest(payload: unknown): Promise<CreateRequestResult> {
  const res = await db.query<{ result: CreateRequestResult }>(
    "select public.create_request($1::jsonb) as result",
    [JSON.stringify(payload)],
  );
  const row = res.rows[0];
  if (!row) throw new Error("Sin respuesta de create_request");
  return row.result;
}

beforeAll(async () => {
  db = new PGlite();

  // Stubs mínimos de Supabase (auth.uid y roles) para poder aplicar la sección 9.
  await db.exec(`
    create schema if not exists auth;
    create or replace function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
    create role anon;
    create role authenticated;

    create table public.products (
      id text primary key,
      name text not null,
      price numeric(10,2) not null default 0,
      in_stock boolean default true
    );

    create table public.sellers (
      user_id uuid primary key,
      email text
    );

    insert into public.products (id, name, price, in_stock) values
      ('lampara-solar-1200w', 'Farola 1200W', 55.00, true),
      ('proyector-300w', 'Proyector 300W', 40.00, false);
  `);

  await db.exec(requestsSql);
});

afterAll(async () => {
  await db?.close();
});

describe("public.create_request", () => {
  it("ignora los precios enviados por el navegador y usa los de la base", async () => {
    const result = await createRequest({
      kind: "cotizacion",
      customerName: "Ana Pérez",
      items: [
        {
          productId: "lampara-solar-1200w",
          quantity: 2,
          unitPrice: 1,
          price: 1,
          lineTotal: 2,
        },
      ],
    });

    expect(result.code).toMatch(/^COT-\d{8}-\d{4}$/);
    expect(result.kind).toBe("cotizacion");
    expect(result.items[0]?.unitPrice).toBe(55);
    expect(result.items[0]?.lineTotal).toBe(110);
    expect(result.subtotal).toBe(110);
    expect(result.total).toBe(110);
  });

  it("usa el prefijo PED y acumula varias líneas", async () => {
    const result = await createRequest({
      kind: "pedido",
      customerName: "Luis",
      items: [
        { productId: "lampara-solar-1200w", quantity: 1 },
        { productId: "proyector-300w", quantity: 3 },
      ],
    });

    expect(result.code).toMatch(/^PED-\d{8}-\d{4}$/);
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(55 + 40 * 3);
  });

  it("normaliza cantidades fuera de rango", async () => {
    const result = await createRequest({
      kind: "cotizacion",
      items: [
        { productId: "lampara-solar-1200w", quantity: 0 },
        { productId: "proyector-300w", quantity: 5000 },
      ],
    });

    expect(result.items[0]?.quantity).toBe(1);
    expect(result.items[1]?.quantity).toBe(999);
  });

  it("rechaza productos que no existen en el catálogo", async () => {
    await expect(
      createRequest({
        kind: "cotizacion",
        items: [{ productId: "producto-inventado", quantity: 1 }],
      }),
    ).rejects.toThrow(/Producto no encontrado/);
  });

  it("rechaza una solicitud sin productos", async () => {
    await expect(createRequest({ kind: "cotizacion", items: [] })).rejects.toThrow(
      /no contiene productos/,
    );
  });

  it("rechaza un tipo de solicitud desconocido", async () => {
    await expect(
      createRequest({
        kind: "factura",
        items: [{ productId: "lampara-solar-1200w", quantity: 1 }],
      }),
    ).rejects.toThrow(/no válido/);
  });

  it("guarda la solicitud con el total calculado en el servidor", async () => {
    const created = await createRequest({
      kind: "pedido",
      customerName: "Cliente Prueba",
      customerPhone: "6000-0000",
      notes: { carrier: "servientrega", address: "Calle 1" },
      items: [{ productId: "lampara-solar-1200w", quantity: 2 }],
    });

    const stored = await db.query<{
      code: string;
      total: number;
      customer_name: string;
      items: Array<{ unitPrice: number }>;
    }>("select code, total, customer_name, items from public.requests where code = $1", [
      created.code,
    ]);

    expect(stored.rows).toHaveLength(1);
    expect(Number(stored.rows[0]?.total)).toBe(110);
    expect(stored.rows[0]?.customer_name).toBe("Cliente Prueba");
    expect(stored.rows[0]?.items[0]?.unitPrice).toBe(55);
  });
});
