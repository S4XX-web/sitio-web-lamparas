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

-- 2. Habilitar Seguridad por Filas (Row Level Security - RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Crear Políticas de Acceso:
-- Cualquiera (clientes y visitantes) puede leer el catálogo
DROP POLICY IF EXISTS "Permitir lectura pública del catálogo" ON public.products;
CREATE POLICY "Permitir lectura pública del catálogo"
  ON public.products
  FOR SELECT
  USING (true);

-- Permitir insertar, actualizar y eliminar productos con la clave anon/vendedor
DROP POLICY IF EXISTS "Permitir gestión de productos a vendedores" ON public.products;
CREATE POLICY "Permitir gestión de productos a vendedores"
  ON public.products
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Activar Sincronización en Tiempo Real (Realtime) para la tabla products
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

-- 5. Crear Bucket de Almacenamiento para Fotos de Productos
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de acceso para las fotos de productos
DROP POLICY IF EXISTS "Fotos de productos públicas" ON storage.objects;
CREATE POLICY "Fotos de productos públicas"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Permitir subir fotos de productos" ON storage.objects;
CREATE POLICY "Permitir subir fotos de productos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Permitir actualizar fotos de productos" ON storage.objects;
CREATE POLICY "Permitir actualizar fotos de productos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'products');

-- 6. Insertar los 3 productos originales de fábrica (Seed inicial)
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
