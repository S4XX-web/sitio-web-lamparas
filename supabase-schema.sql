-- ==============================================================================
-- SOLARA: ESQUEMA DE BASE DE DATOS Y TIEMPO REAL EN SUPABASE
-- ==============================================================================
-- Instrucciones:
-- 1. Ve a tu proyecto en https://supabase.com
-- 2. En el menú lateral izquierdo, haz clic en "SQL Editor"
-- 3. Pega todo este código y presiona "Run" (Ejecutar)
-- ¡Listo! Tu tienda quedará conectada en tiempo real.
-- ==============================================================================

-- 1. Crear tabla de productos
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT DEFAULT '',
  department TEXT DEFAULT 'solar',
  category TEXT DEFAULT 'farolas',
  price NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC DEFAULT 0,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  image TEXT DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  badge TEXT DEFAULT '',
  in_stock BOOLEAN DEFAULT true,
  lumens TEXT DEFAULT '',
  battery_life TEXT DEFAULT '',
  waterproof TEXT DEFAULT '',
  description TEXT DEFAULT '',
  features JSONB DEFAULT '[]'::jsonb,
  material TEXT DEFAULT '',
  dimensions TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de vendedores autorizados (quién puede escribir en la tienda)
--    Sin una fila aquí, un usuario autenticado NO puede modificar nada.
CREATE TABLE IF NOT EXISTS public.sellers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendedor ve su propio registro" ON public.sellers;
CREATE POLICY "Vendedor ve su propio registro"
  ON public.sellers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 3. Habilitar Seguridad por Filas (Row Level Security - RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4. Crear Políticas de Acceso:
-- Cualquiera (clientes y visitantes) puede leer el catálogo
DROP POLICY IF EXISTS "Permitir lectura pública del catálogo" ON public.products;
DROP POLICY IF EXISTS "Lectura pública del catálogo" ON public.products;
CREATE POLICY "Lectura pública del catálogo"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Solo los vendedores registrados en public.sellers pueden crear,
-- editar o borrar productos. La clave anon por sí sola ya NO sirve.
DROP POLICY IF EXISTS "Permitir gestión de productos a vendedores" ON public.products;
DROP POLICY IF EXISTS "Vendedores autorizados gestionan productos" ON public.products;
CREATE POLICY "Vendedores autorizados gestionan productos"
  ON public.products
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sellers s WHERE s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.sellers s WHERE s.user_id = auth.uid()));

-- 5. Activar Sincronización en Tiempo Real (Realtime) para la tabla products
-- Esto permite que cualquier cambio en el celular se vea instantáneamente en la PC sin recargar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;
END $$;

-- 6. Crear Bucket de Almacenamiento para Fotos de Productos
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de acceso para las fotos de productos:
-- lectura pública, escritura solo para vendedores autorizados.
DROP POLICY IF EXISTS "Fotos de productos públicas" ON storage.objects;
DROP POLICY IF EXISTS "Imágenes de productos públicas" ON storage.objects;
CREATE POLICY "Fotos de productos públicas"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Permitir subir fotos de productos" ON storage.objects;
DROP POLICY IF EXISTS "Vendedores autorizados suben fotos" ON storage.objects;
CREATE POLICY "Vendedores autorizados suben fotos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'products'
    AND EXISTS (SELECT 1 FROM public.sellers s WHERE s.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Permitir actualizar fotos de productos" ON storage.objects;
DROP POLICY IF EXISTS "Vendedores autorizados actualizan fotos" ON storage.objects;
CREATE POLICY "Vendedores autorizados actualizan fotos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'products'
    AND EXISTS (SELECT 1 FROM public.sellers s WHERE s.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Vendedores autorizados eliminan fotos" ON storage.objects;
CREATE POLICY "Vendedores autorizados eliminan fotos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'products'
    AND EXISTS (SELECT 1 FROM public.sellers s WHERE s.user_id = auth.uid())
  );

-- 7. Registrar al vendedor
--    PASO PREVIO: crea el usuario en Authentication > Users (correo + contraseña)
--    y desactiva "Allow new users to sign up" en Authentication > Providers > Email.
--    Luego ejecuta esto con el correo del vendedor:
--
--    INSERT INTO public.sellers (user_id, email)
--    SELECT id, email FROM auth.users WHERE email = 'vendedor@correo.com'
--    ON CONFLICT (user_id) DO NOTHING;

-- 8. Insertar los 3 productos originales de fábrica (Seed inicial)
INSERT INTO public.products (
  id, name, tagline, department, category, price, original_price, rating, reviews_count,
  image, images, badge, in_stock, lumens, battery_life, waterproof, description, features
) VALUES
(
  'lampara-solar-1200w',
  'Farola LED Solar de Calle Rolinger 1200W',
  'Iluminación urbana y perimetral de alto alcance con matriz masiva LED, sensor de radar y 0 consumo eléctrico',
  'solar',
  'farolas',
  55.00,
  55.00,
  4.9,
  168,
  '/products/lampara-1200w/image-1.jpg',
  '["/products/lampara-1200w/image-1.jpg", "/products/lampara-1200w/image-2.jpg", "/products/lampara-1200w/image-3.jpg", "/products/lampara-1200w/image-4.jpg"]'::jsonb,
  'Máxima Potencia • 1200W',
  true,
  '1200W • Matriz Masiva LED',
  '10 a 12h (Modo Radar)',
  'IP66 + Antirrayos',
  'Ilumina grandes espacios exteriores con máxima potencia y sin depender de la red eléctrica. La Farola Solar Rolinger de 1200W está diseñada para ofrecer una iluminación urbana y perimetral de rendimiento superior, equipada con tecnología de última generación en sensores de movimiento y eficiencia energética.',
  '["Potencia de 1200W con matriz masiva de múltiples perlas LED de alta calidad", "Sensor de movimiento inteligente (Radar Induction) para cuerpos humanos: mantiene el 30% en ahorro y sube al 100% al detectar presencia", "Control inteligente de luz automatizado: encendido crepuscular al atardecer y apagado al amanecer", "Clasificación de protección IP66 resistente a la intemperie con diseño de protección contra rayos", "Batería LiFePO4 de gran capacidad con panel solar de silicio multi-cristalino integrado", "Autonomía estimada de 10 a 12 horas con carga solar completa", "Control remoto inalámbrico con temporizador programable", "Incluye kit de tornillería y soporte de montaje"]'::jsonb
),
(
  'lampara-solar-800w',
  'Farola LED Solar de Calle Rolinger 800W',
  'Iluminación inteligente y de gran alcance con sensor de radar, protección IP66 y panel multisilicio',
  'solar',
  'farolas',
  45.00,
  45.00,
  4.8,
  124,
  '/products/lampara-800w/image-1.jpg',
  '["/products/lampara-800w/image-1.jpg", "/products/lampara-800w/image-2.jpg", "/products/lampara-800w/image-3.jpg", "/products/lampara-800w/image-4.jpg"]'::jsonb,
  'Más Vendido • 800W',
  true,
  '800W • Módulos LED Alto Rendimiento',
  '10 a 12h (Modo Radar)',
  'IP66 + Antirrayos',
  'Potencia y autonomía equilibrada para la seguridad y visibilidad de tus espacios exteriores. La Farola Solar Rolinger de 800W está diseñada con tecnología avanzada de iluminación urbana y perimetral.',
  '["Potencia de 800W de alto rendimiento con múltiples módulos LED", "Sensor de movimiento inteligente (Radar Induction)", "Control crepuscular automatizado al atardecer y apagado al amanecer", "Estructura robusta con protección IP66 impermeable y antirrayos", "Batería de gran capacidad y celdas multisilicio", "Voltaje de operación DC 3.2V - 6V con etiqueta Clase A++", "Control remoto inalámbrico incluido", "Incluye soporte y tornillería de fijación"]'::jsonb
),
(
  'reflector-solar-industrial',
  'Proyector LED Solar Rolinger 300W (TYN-JBP-300W)',
  'Proyector de 300W con luz blanca fría 6500K, ángulo de 120°, panel monocristalino separado y protección IP67',
  'solar',
  'reflector',
  40.00,
  40.00,
  4.9,
  92,
  '/products/reflector-solar/image-1.jpg',
  '["/products/reflector-solar/image-1.jpg", "/products/reflector-solar/image-2.jpg", "/products/reflector-solar/image-3.jpg", "/products/reflector-solar/image-4.jpg"]'::jsonb,
  'Proyector 300W • IP67',
  true,
  '300W • 6500K Luz Fría',
  '8 a 12h de Autonomía',
  'IP67 Impermeable Total',
  'Lleva iluminación versátil a tus espacios exteriores o semi-techados sin preocuparte por el consumo eléctrico. El Proyector Solar Rolinger de 300W cuenta con panel solar independiente de silicio monocristalino con marco de aleación de aluminio resistente.',
  '["Potencia de 300W con ángulo de apertura de 120°", "Luz blanca fría 6500K de hasta 50,000 horas de vida útil en LEDs", "Tecnología 100% solar con encendido crepuscular automático", "Panel solar de silicio monocristalino separado de alta conversión", "Alta durabilidad certificada IP67 contra lluvias torrenciales y polvo", "Control remoto inteligente con ajuste de brillo y temporizador", "Ámbitos recomendados: patios, terrazas techadas, entradas, fincas y talleres"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 9. SOLICITUDES (COTIZACIONES Y PEDIDOS) CON PRECIOS VALIDADOS EN SERVIDOR
-- ==============================================================================
-- El navegador solo envía productId + quantity. Esta función lee el precio
-- real de public.products, calcula los totales y devuelve el documento con su
-- número oficial. Un documento válido es el que existe en esta tabla: ya no
-- se puede fabricar una cotización con otro importe desde el navegador.

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

    -- Precio negociado: SOLO un vendedor autenticado (fila en public.sellers)
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

