ALTER TABLE course_purchases
  ADD COLUMN IF NOT EXISTS last_viewed_lecture_id UUID REFERENCES course_lectures(id) ON DELETE SET NULL;

INSERT INTO user_entitlements (
  user_id,
  item_id,
  status,
  purchased_at,
  access_expires_at,
  progress_percent,
  last_accessed_at
)
SELECT
  cp.user_id,
  ci.id,
  'active',
  cp.purchased_at,
  cp.access_expires_at,
  cp.progress_percent,
  NOW()
FROM course_purchases cp
JOIN courses c
  ON c.id = cp.course_id
JOIN catalog_items ci
  ON ci.slug = c.slug
 AND ci.type = 'course'
ON CONFLICT (user_id, item_id) DO UPDATE
SET
  status = 'active',
  purchased_at = LEAST(user_entitlements.purchased_at, EXCLUDED.purchased_at),
  access_expires_at = EXCLUDED.access_expires_at,
  progress_percent = GREATEST(user_entitlements.progress_percent, EXCLUDED.progress_percent),
  last_accessed_at = COALESCE(user_entitlements.last_accessed_at, EXCLUDED.last_accessed_at);

INSERT INTO orders (
  order_number,
  user_id,
  status,
  payment_status,
  payment_provider,
  currency,
  subtotal_amount,
  total_amount,
  billing_name,
  billing_email,
  billing_phone,
  notes
)
SELECT
  demo.order_number,
  u.id,
  demo.status,
  'paid',
  'manual',
  'USD',
  demo.amount,
  demo.amount,
  u.name,
  u.email,
  COALESCE(u.phone, '9876543210'),
  demo.notes
FROM users u
JOIN (
  VALUES
    ('LH-DEMO-EBOOK-001', 'paid', 24.99::numeric(10,2), 'Demo access for ebook testing'),
    ('LH-DEMO-LIVE-001', 'paid', 59.99::numeric(10,2), 'Demo access for live class testing'),
    ('LH-DEMO-EXAM-001', 'paid', 34.99::numeric(10,2), 'Demo access for practice exam testing'),
    ('LH-DEMO-BOOK-001', 'shipping', 54.99::numeric(10,2), 'Demo order for bookstore and shipment testing')
) AS demo(order_number, status, amount, notes)
  ON TRUE
WHERE u.email = 'demo@learnhub.local'
  AND NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.order_number = demo.order_number
  );

INSERT INTO order_items (
  order_id,
  item_id,
  item_slug,
  item_type,
  item_title,
  quantity,
  unit_price,
  total_price,
  access_expires_at
)
SELECT
  o.id,
  ci.id,
  ci.slug,
  ci.type,
  ci.title,
  1,
  o.total_amount,
  o.total_amount,
  CASE
    WHEN ci.type = 'live_class' THEN ci.scheduled_at + INTERVAL '14 days'
    ELSE NULL
  END
FROM orders o
JOIN (
  VALUES
    ('LH-DEMO-EBOOK-001', 'ui-ux-design-playbook'),
    ('LH-DEMO-LIVE-001', 'sql-analytics-live-bootcamp'),
    ('LH-DEMO-EXAM-001', 'full-stack-developer-practice-exam'),
    ('LH-DEMO-BOOK-001', 'system-design-interview-kit')
) AS demo(order_number, slug)
  ON demo.order_number = o.order_number
JOIN catalog_items ci
  ON ci.slug = demo.slug
WHERE NOT EXISTS (
  SELECT 1
  FROM order_items oi
  WHERE oi.order_id = o.id
    AND oi.item_id = ci.id
);

INSERT INTO user_entitlements (
  user_id,
  item_id,
  source_order_id,
  status,
  purchased_at,
  access_expires_at,
  remaining_attempts,
  progress_percent,
  last_accessed_at
)
SELECT
  o.user_id,
  ci.id,
  o.id,
  'active',
  o.created_at,
  CASE
    WHEN ci.type = 'live_class' THEN ci.scheduled_at + INTERVAL '14 days'
    ELSE NULL
  END,
  CASE
    WHEN ci.type = 'practice_exam' THEN COALESCE(ci.attempts_allowed, 2)
    ELSE NULL
  END,
  CASE
    WHEN ci.type = 'ebook' THEN 20
    ELSE 0
  END,
  NOW()
FROM orders o
JOIN (
  VALUES
    ('LH-DEMO-EBOOK-001', 'ui-ux-design-playbook'),
    ('LH-DEMO-LIVE-001', 'sql-analytics-live-bootcamp'),
    ('LH-DEMO-EXAM-001', 'full-stack-developer-practice-exam')
) AS demo(order_number, slug)
  ON demo.order_number = o.order_number
JOIN catalog_items ci
  ON ci.slug = demo.slug
WHERE ci.type IN ('ebook', 'live_class', 'practice_exam')
ON CONFLICT (user_id, item_id) DO UPDATE
SET
  source_order_id = COALESCE(user_entitlements.source_order_id, EXCLUDED.source_order_id),
  status = 'active',
  access_expires_at = COALESCE(EXCLUDED.access_expires_at, user_entitlements.access_expires_at),
  remaining_attempts = COALESCE(EXCLUDED.remaining_attempts, user_entitlements.remaining_attempts),
  progress_percent = GREATEST(user_entitlements.progress_percent, EXCLUDED.progress_percent),
  last_accessed_at = COALESCE(user_entitlements.last_accessed_at, EXCLUDED.last_accessed_at);

INSERT INTO book_shipments (
  order_id,
  item_id,
  full_name,
  email,
  phone,
  address_line,
  city,
  state,
  pin_code,
  delivery_available,
  carrier,
  shipment_status,
  consignment_number,
  tracking_url,
  shipped_at,
  admin_notes
)
SELECT
  o.id,
  ci.id,
  u.name,
  u.email,
  COALESCE(u.phone, '9876543210'),
  '221B Learning Street',
  'Hyderabad',
  'Telangana',
  '500081',
  TRUE,
  'DTDC',
  'shipped',
  'DTCDEMO500081',
  'https://www.dtdc.in/tracking/tracking_results.asp',
  NOW() - INTERVAL '1 day',
  'Seeded shipment for end-to-end bookstore testing.'
FROM orders o
JOIN users u
  ON u.id = o.user_id
JOIN catalog_items ci
  ON ci.slug = 'system-design-interview-kit'
WHERE o.order_number = 'LH-DEMO-BOOK-001'
  AND NOT EXISTS (
    SELECT 1
    FROM book_shipments bs
    WHERE bs.order_id = o.id
  );
