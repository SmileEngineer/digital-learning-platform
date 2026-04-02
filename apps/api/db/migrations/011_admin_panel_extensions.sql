ALTER TABLE users
  ADD COLUMN IF NOT EXISTS admin_permissions TEXT[] NOT NULL DEFAULT '{}'::text[];

CREATE TABLE IF NOT EXISTS site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  path TEXT NOT NULL,
  referrer TEXT,
  visitor_type TEXT NOT NULL DEFAULT 'guest' CHECK (visitor_type IN ('guest', 'registered', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON site_visits (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_visits_path_created_at ON site_visits (path, created_at DESC);

UPDATE users
SET admin_permissions = ARRAY[
  'courses',
  'ebooks',
  'books',
  'live_classes',
  'practice_exams',
  'coupons',
  'articles',
  'orders',
  'analytics',
  'settings',
  'admin_access'
]::text[]
WHERE role = 'super_admin';

UPDATE users
SET admin_permissions = CASE
  WHEN array_length(admin_permissions, 1) IS NULL OR array_length(admin_permissions, 1) = 0 THEN ARRAY[
    'courses',
    'ebooks',
    'books',
    'live_classes',
    'practice_exams',
    'orders'
  ]::text[]
  ELSE admin_permissions
END
WHERE role = 'admin';
