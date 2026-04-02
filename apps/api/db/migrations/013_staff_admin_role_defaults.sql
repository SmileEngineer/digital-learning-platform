UPDATE users
SET admin_permissions = CASE
  WHEN array_length(admin_permissions, 1) IS NULL OR array_length(admin_permissions, 1) = 0 THEN ARRAY[
    'courses',
    'ebooks',
    'books',
    'live_classes',
    'practice_exams',
    'articles',
    'orders'
  ]::text[]
  ELSE admin_permissions
END
WHERE role = 'staff';
