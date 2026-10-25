import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CartItem } from "../types/store";

// El servicio importa `getSupabase`; lo sustituimos por un doble controlable.
const { rpcMock, state } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  state: {
    client: null as null | {
      rpc: (fn: string, args: { payload: Record<string, unknown> }) => Promise<unknown>;
    },
  },
}));

vi.mock("../lib/supabase", () => ({
  getSupabase: () => state.client,
}));

import {
  applyServerPrices,
  registerRequest,
  RequestRegistrationError,
  toRequestItems,
  type RegisteredRequest,
} from "../services/requestService";

function cartItem(overrides: Partial<CartItem["product"]> = {}, quantity = 1): CartItem {
  return {
    quantity,
    product: {
      id: "lampara-solar-1200w",
      name: "Farola LED Solar de Calle Rolinger 1200W",
      tagline: "",
      category: "farolas",
      price: 55,
      originalPrice: 55,
      rating: 4.9,
      reviewsCount: 10,
      image: "/products/farola/image-1.jpg",
      images: [],
      inStock: true,
      description: "",
      features: [],
      ...overrides,
    },
  };
}

const serverRequest: RegisteredRequest = {
  id: "8f2c",
  code: "COT-20261024-0001",
  kind: "cotizacion",
  customerName: "Ana Pérez",
  items: [
    {
      productId: "lampara-solar-1200w",
      name: "Farola LED Solar (servidor)",
      unitPrice: 60,
      quantity: 2,
      lineTotal: 120,
    },
  ],
  subtotal: 120,
  total: 120,
  createdAt: "2026-10-24T10:00:00.000Z",
};

beforeEach(() => {
  rpcMock.mockReset();
  state.client = null;
});

describe("toRequestItems", () => {
  it("solo envía productId y quantity, sin precios del navegador", () => {
    const payload = toRequestItems([cartItem({ price: 1 }, 2)]);

    expect(payload).toEqual([{ productId: "lampara-solar-1200w", quantity: 2 }]);
    expect(Object.keys(payload[0]!)).not.toContain("price");
  });

  it("normaliza cantidades inválidas al rango mínimo", () => {
    const payload = toRequestItems([cartItem({}, 0), cartItem({ id: "otro" }, 2.7)]);

    expect(payload).toEqual([
      { productId: "lampara-solar-1200w", quantity: 1 },
      { productId: "otro", quantity: 2 },
    ]);
  });
});

describe("applyServerPrices", () => {
  it("reemplaza nombre y precio por los valores del servidor", () => {
    const result = applyServerPrices([cartItem({ price: 1 }, 2)], serverRequest)[0]!;

    expect(result.product.price).toBe(60);
    expect(result.product.name).toBe("Farola LED Solar (servidor)");
    expect(result.quantity).toBe(2);
  });

  it("deja intactas las líneas que el servidor no devolvió", () => {
    const unknown = cartItem({ id: "no-existe", price: 45 }, 1);
    const result = applyServerPrices([unknown], serverRequest)[0]!;

    expect(result).toBe(unknown);
    expect(result.product.price).toBe(45);
  });
});

describe("registerRequest", () => {
  it("devuelve null en modo local (Supabase sin configurar)", async () => {
    const result = await registerRequest({
      kind: "cotizacion",
      customerName: "Ana",
      items: [{ productId: "lampara-solar-1200w", quantity: 1 }],
    });

    expect(result).toBeNull();
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("envía solo productId y quantity y mapea la respuesta del servidor", async () => {
    state.client = { rpc: rpcMock };
    rpcMock.mockResolvedValue({
      data: {
        id: "8f2c",
        code: "COT-20261024-0001",
        kind: "cotizacion",
        customerName: "Ana Pérez",
        items: [
          {
            productId: "lampara-solar-1200w",
            name: "Farola LED Solar (servidor)",
            unitPrice: 60,
            quantity: 2,
            lineTotal: 120,
            inStock: true,
          },
        ],
        subtotal: 120,
        total: 120,
        createdAt: "2026-10-24T10:00:00.000Z",
      },
      error: null,
    });

    const result = await registerRequest({
      kind: "cotizacion",
      customerName: "Ana Pérez",
      customerPhone: "6000-0000",
      items: [{ productId: "lampara-solar-1200w", quantity: 2 }],
    });

    expect(rpcMock).toHaveBeenCalledTimes(1);
    const call = rpcMock.mock.calls[0]!;
    const [fn, args] = call;
    expect(fn).toBe("create_request");
    expect(args.payload.items).toEqual([
      { productId: "lampara-solar-1200w", quantity: 2 },
    ]);
    expect(JSON.stringify(args.payload)).not.toContain("unitPrice");

    expect(result?.code).toBe("COT-20261024-0001");
    expect(result?.total).toBe(120);
    expect(result?.items[0]?.unitPrice).toBe(60);
  });

  it("cae a modo local si la función SQL todavía no existe", async () => {
    state.client = { rpc: rpcMock };
    rpcMock.mockResolvedValue({
      data: null,
      error: { code: "PGRST202", message: "Could not find the function" },
    });

    const result = await registerRequest({
      kind: "pedido",
      customerName: "Ana",
      items: [{ productId: "lampara-solar-1200w", quantity: 1 }],
    });

    expect(result).toBeNull();
  });

  it("lanza un error de registro cuando el servidor rechaza la solicitud", async () => {
    state.client = { rpc: rpcMock };
    rpcMock.mockResolvedValue({
      data: null,
      error: { code: "P0001", message: "Producto no encontrado: inventado" },
    });

    await expect(
      registerRequest({
        kind: "pedido",
        customerName: "Ana",
        items: [{ productId: "inventado", quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(RequestRegistrationError);
  });
});
