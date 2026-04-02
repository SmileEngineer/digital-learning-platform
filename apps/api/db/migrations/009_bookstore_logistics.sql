CREATE TABLE IF NOT EXISTS delivery_serviceability (
  pin_code TEXT PRIMARY KEY,
  city TEXT,
  state TEXT,
  carrier TEXT NOT NULL DEFAULT 'DTDC',
  estimated_days INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE book_shipments
  ADD COLUMN IF NOT EXISTS tracking_url TEXT,
  ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

INSERT INTO delivery_serviceability (pin_code, city, state, carrier, estimated_days, is_active, notes)
VALUES
  ('110001', 'New Delhi', 'Delhi', 'DTDC', 3, TRUE, 'Metro priority route'),
  ('400001', 'Mumbai', 'Maharashtra', 'DTDC', 3, TRUE, 'Metro priority route'),
  ('411001', 'Pune', 'Maharashtra', 'DTDC', 4, TRUE, 'University hub route'),
  ('500001', 'Hyderabad', 'Telangana', 'DTDC', 4, TRUE, 'South zone route'),
  ('560001', 'Bengaluru', 'Karnataka', 'DTDC', 4, TRUE, 'South zone route'),
  ('600001', 'Chennai', 'Tamil Nadu', 'DTDC', 4, TRUE, 'South zone route'),
  ('700001', 'Kolkata', 'West Bengal', 'DTDC', 5, TRUE, 'East zone route')
ON CONFLICT (pin_code) DO UPDATE
SET
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  carrier = EXCLUDED.carrier,
  estimated_days = EXCLUDED.estimated_days,
  is_active = EXCLUDED.is_active,
  notes = EXCLUDED.notes;

UPDATE catalog_items
SET metadata = COALESCE(metadata, '{}'::jsonb)
  || jsonb_build_object(
    'shippingNotes',
    COALESCE(metadata->>'shippingNotes', 'Ships via DTDC after order confirmation.'),
    'galleryImages',
    COALESCE(metadata->'galleryImages', jsonb_build_array(image_url)),
    'isbn',
    COALESCE(metadata->>'isbn', '978-1-23456-789-0')
  )
WHERE type = 'physical_book';
