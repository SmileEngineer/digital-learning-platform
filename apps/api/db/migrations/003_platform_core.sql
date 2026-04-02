-- Core platform entities: catalog, coupons, orders, access, shipping, settings

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS phone TEXT;

UPDATE users
SET role = 'super_admin'
WHERE email = 'admin@learnhub.local';

CREATE TABLE IF NOT EXISTS catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('course', 'ebook', 'physical_book', 'live_class', 'practice_exam', 'article')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'published',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  instructor_name TEXT,
  author_name TEXT,
  category TEXT,
  state TEXT,
  university TEXT,
  semester TEXT,
  duration_label TEXT,
  duration_minutes INTEGER,
  students_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3, 2),
  pages INTEGER,
  file_format TEXT,
  download_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  preview_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  preview_count INTEGER NOT NULL DEFAULT 0,
  stock_quantity INTEGER,
  scheduled_at TIMESTAMPTZ,
  meeting_url TEXT,
  spots_total INTEGER,
  spots_remaining INTEGER,
  question_count INTEGER,
  time_limit_minutes INTEGER,
  passing_score INTEGER,
  attempts_allowed INTEGER,
  validity_days INTEGER,
  tags TEXT[] NOT NULL DEFAULT '{}',
  curriculum JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalog_items_type_status ON catalog_items (type, status);
CREATE INDEX IF NOT EXISTS idx_catalog_items_featured ON catalog_items (featured);
CREATE INDEX IF NOT EXISTS idx_catalog_items_slug ON catalog_items (slug);

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'flat', 'free')),
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  applicable_types TEXT[] NOT NULL DEFAULT '{}',
  applicable_slugs TEXT[] NOT NULL DEFAULT '{}',
  applicable_emails TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded', 'shipping', 'delivered')),
  payment_status TEXT NOT NULL DEFAULT 'paid',
  payment_provider TEXT NOT NULL DEFAULT 'manual',
  payment_reference TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  coupon_code TEXT,
  billing_name TEXT,
  billing_email TEXT,
  billing_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_created_at ON orders (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES catalog_items (id) ON DELETE CASCADE,
  item_slug TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_title TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  access_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

CREATE TABLE IF NOT EXISTS user_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES catalog_items (id) ON DELETE CASCADE,
  source_order_id UUID REFERENCES orders (id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'completed')),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  access_expires_at TIMESTAMPTZ,
  remaining_attempts INTEGER,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  UNIQUE (user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_entitlements_user_id ON user_entitlements (user_id);

CREATE TABLE IF NOT EXISTS book_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders (id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES catalog_items (id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT,
  state TEXT,
  pin_code TEXT NOT NULL,
  delivery_available BOOLEAN NOT NULL DEFAULT FALSE,
  carrier TEXT NOT NULL DEFAULT 'DTDC',
  shipment_status TEXT NOT NULL DEFAULT 'processing' CHECK (shipment_status IN ('processing', 'shipped', 'delivered', 'cancelled')),
  consignment_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  home_scroller_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  home_scroller_message TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (id = 1)
);

INSERT INTO site_settings (id, home_scroller_enabled, home_scroller_message)
VALUES (1, TRUE, 'Use coupon code WELCOME10 to get 10% off your first purchase.')
ON CONFLICT (id) DO NOTHING;
