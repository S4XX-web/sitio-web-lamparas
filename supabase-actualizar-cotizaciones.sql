-- ============================================================================
-- ACTUALIZACIÓN: precios personalizados en cotizaciones (vendedor)
-- ============================================================================
-- Cómo ejecutarlo:
--   1. Abre https://supabase.com/dashboard y entra al proyecto de Solar y Hogar.
--   2. Menú izquierdo: SQL Editor -> New query.
--   3. Copia TODO este archivo, pégalo y pulsa "Run" (o Ctrl + Enter).
--   4. Debe responder "Success. No rows returned".
--
-- Es seguro ejecutarlo varias veces: usa IF NOT EXISTS / OR REPLACE.
-- No borra solicitudes ni productos.
-- ============================================================================

-- ==============================================================================
-- 9. SOLICITUDES (COTIZACIONES Y PEDIDOS) CON PRECIOS VALIDADOS EN SERVIDOR
-- ==============================================================================
-- El navegador envía productId + quantity. Esta función lee el precio real de
-- public.products, calcula los totales y devuelve el documento con su número
-- oficial. Un vendedor autenticado (fila en public.sellers) puede enviar
-- `unitPrice` por línea como precio personalizado; para clientes y visitantes
-- ese campo se ignora.

CREATE TABLE IF NOT EXISTS public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  kind text NOT NULL CHECK (kind IN ('cotizacion', 'pedido')),
  customer_name text NOT NULL,
  customer_phone text,
  notes jsonb NOT NULL DEFAULT '{}'::jsonb,
  items jsonb NOT NULL,
  subtotal numeric(12,2) NOT NULL,
  total numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS requests_created_at_idx
  ON public.requests (created_at DESC);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Nadie escribe directamente en la tabla: solo la función SECURITY DEFINER.
-- Los vendedores registrados sí pueden leer las solicitudes desde el panel.
DROP POLICY IF EXISTS "Vendedores leen solicitudes" ON public.requests;
CREATE POLICY "Vendedores leen solicitudes"
  ON public.requests FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sellers s WHERE s.user_id = auth.uid()));

CREATE SEQUENCE IF NOT EXISTS public.request_code_seq;

CREATE OR REPLACE FUNCTION public.create_request(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_kind text := COALESCE(payload->>'kind', 'cotizacion');
  v_items jsonb := payload->'items';
  v_item jsonb;
  v_prod record;
  v_qty int;
  v_unit numeric(12,2);
  v_is_seller boolean := EXISTS (
    SELECT 1 FROM public.sellers s WHERE s.user_id = auth.uid()
  );
  v_subtotal numeric(12,2) := 0;
  v_out_items jsonb := '[]'::jsonb;
  v_code text;
  v_id uuid;
  v_created timestamptz;
  v_name text;
  v_phone text;
  v_notes jsonb;
BEGIN
  IF v_kind NOT IN ('cotizacion', 'pedido') THEN
    RAISE EXCEPTION 'Tipo de solicitud no válido';
  END IF;

  IF v_items IS NULL OR jsonb_typeof(v_items) <> 'array' OR jsonb_array_length(v_items) = 0 THEN
    RAISE EXCEPTION 'La solicitud no contiene productos';
  END IF;

  IF jsonb_array_length(v_items) > 50 THEN
    RAISE EXCEPTION 'La solicitud supera el máximo de 50 líneas';
  END IF;

  v_name := LEFT(COALESCE(NULLIF(BTRIM(payload->>'customerName'), ''), 'Cliente Particular'), 120);
  v_phone := LEFT(COALESCE(payload->>'customerPhone', ''), 40);
  v_notes := CASE WHEN jsonb_typeof(payload->'notes') = 'object' THEN payload->'notes' ELSE '{}'::jsonb END;

  FOR v_item IN SELECT * FROM jsonb_array_elements(v_items) LOOP
    v_qty := GREATEST(1, LEAST(999, COALESCE((v_item->>'quantity')::int, 1)));

    SELECT id, name, price, in_stock INTO v_prod
      FROM public.products
     WHERE id = v_item->>'productId';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto no encontrado: %', COALESCE(v_item->>'productId', '?');
    END IF;

    v_unit := ROUND(v_prod.price::numeric, 2);

    -- Precio personalizado: SOLO un vendedor autenticado (fila en public.sellers)
    -- puede ajustar el precio de una línea. Para clientes y visitantes el
    -- campo `unitPrice` se ignora por completo.
    IF v_is_seller AND jsonb_typeof(v_item->'unitPrice') = 'number' THEN
      IF (v_item->>'unitPrice')::numeric BETWEEN 0.01 AND 100000 THEN
        v_unit := ROUND((v_item->>'unitPrice')::numeric, 2);
      END IF;
    END IF;

    v_subtotal := v_subtotal + (v_unit * v_qty);

    v_out_items := v_out_items || jsonb_build_object(
      'productId', v_prod.id,
      'name', v_prod.name,
      'unitPrice', v_unit,
      'catalogPrice', ROUND(v_prod.price::numeric, 2),
      'quantity', v_qty,
      'lineTotal', ROUND(v_unit * v_qty, 2),
      'inStock', v_prod.in_stock
    );
  END LOOP;

  v_code := (CASE WHEN v_kind = 'pedido' THEN 'PED' ELSE 'COT' END)
            || '-' || to_char(now(), 'YYYYMMDD') || '-'
            || lpad(nextval('public.request_code_seq')::text, 4, '0');

  INSERT INTO public.requests (code, kind, customer_name, customer_phone, notes, items, subtotal, total)
  VALUES (v_code, v_kind, v_name, v_phone, v_notes, v_out_items, v_subtotal, v_subtotal)
  RETURNING id, created_at INTO v_id, v_created;

  RETURN jsonb_build_object(
    'id', v_id,
    'code', v_code,
    'kind', v_kind,
    'customerName', v_name,
    'items', v_out_items,
    'subtotal', v_subtotal,
    'total', v_subtotal,
    'createdAt', v_created
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_request(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_request(jsonb) TO anon, authenticated;
