-- Seed platform catalog, coupon, and starter learner data

INSERT INTO catalog_items (
  slug,
  type,
  title,
  description,
  image_url,
  price,
  featured,
  instructor_name,
  category,
  duration_label,
  duration_minutes,
  students_count,
  rating,
  validity_days,
  tags,
  curriculum,
  metadata
)
VALUES
  (
    'complete-web-development-bootcamp',
    'course',
    'Complete Web Development Bootcamp',
    'Master HTML, CSS, JavaScript, React, Node.js and more in this comprehensive course.',
    'https://images.unsplash.com/photo-1771408427146-09be9a1d4535?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    89.99,
    TRUE,
    'Dr. Sarah Johnson',
    'Web Development',
    '40 hours',
    2400,
    15420,
    4.80,
    NULL,
    ARRAY['Bestseller'],
    '[{"title":"Introduction to Web Development","lectures":8,"duration":"45 min"},{"title":"HTML Fundamentals","lectures":12,"duration":"2h 15min"},{"title":"React Fundamentals","lectures":16,"duration":"4h 10min"}]'::jsonb,
    '{"previewLectures": 3}'::jsonb
  ),
  (
    'data-science-machine-learning',
    'course',
    'Data Science & Machine Learning',
    'Learn Python, pandas, scikit-learn, and build real-world ML projects.',
    'https://images.unsplash.com/photo-1762330917056-e69b34329ddf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    99.99,
    TRUE,
    'Prof. Michael Chen',
    'Data Science',
    '35 hours',
    2100,
    12300,
    4.90,
    180,
    ARRAY['New'],
    '[{"title":"Python Foundations","lectures":10,"duration":"2h"},{"title":"Pandas & NumPy","lectures":14,"duration":"3h 20min"},{"title":"Machine Learning Projects","lectures":18,"duration":"5h 40min"}]'::jsonb,
    '{"previewLectures": 2}'::jsonb
  ),
  (
    'modern-javascript-guide',
    'ebook',
    'The Complete Guide to Modern JavaScript',
    'Master ES6+ features, async programming, and modern JavaScript patterns.',
    'https://images.unsplash.com/photo-1772617532657-2d0e38868716?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    29.99,
    TRUE,
    'LearnHub Editorial Team',
    'Programming',
    NULL,
    NULL,
    0,
    4.90,
    NULL,
    ARRAY['New Release'],
    '[]'::jsonb,
    '{"pages": 450, "format": "PDF"}'::jsonb
  ),
  (
    'python-for-data-analysis',
    'ebook',
    'Python for Data Analysis',
    'Comprehensive guide to data manipulation and analysis using pandas and NumPy.',
    'https://images.unsplash.com/photo-1724148227179-807a0ca73774?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    34.99,
    FALSE,
    'LearnHub Editorial Team',
    'Data Science',
    NULL,
    NULL,
    0,
    4.70,
    NULL,
    ARRAY[]::TEXT[],
    '[]'::jsonb,
    '{"pages": 520, "format": "PDF"}'::jsonb
  ),
  (
    'advanced-react-patterns-workshop',
    'live_class',
    'Advanced React Patterns Workshop',
    'Learn advanced React patterns including compound components, render props, and hooks.',
    'https://images.unsplash.com/photo-1766074903112-79661da9ab45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    49.99,
    TRUE,
    'Alex Thompson',
    'Live Classes',
    '3 hours',
    180,
    42,
    4.80,
    7,
    ARRAY['Only 8 spots left'],
    '[]'::jsonb,
    '{"recordingDays": 7}'::jsonb
  ),
  (
    'aws-solutions-architect-practice-exam',
    'practice_exam',
    'AWS Certified Solutions Architect Practice Exam',
    'Comprehensive practice test covering all exam topics with detailed explanations.',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    39.99,
    FALSE,
    'Certification Prep Team',
    'Certification',
    '130 minutes',
    130,
    0,
    4.60,
    90,
    ARRAY['Certification Prep'],
    '[]'::jsonb,
    '{"questionBankVersion":"v1"}'::jsonb
  ),
  (
    'clean-code-handbook',
    'physical_book',
    'Clean Code: A Handbook of Agile Software Craftsmanship',
    'A classic software engineering book for building maintainable systems.',
    'https://images.unsplash.com/photo-1569728723358-d1a317aa7fba?w=300',
    42.99,
    FALSE,
    NULL,
    'Books',
    NULL,
    NULL,
    0,
    4.80,
    NULL,
    ARRAY[]::TEXT[],
    '[]'::jsonb,
    '{"author":"Robert C. Martin"}'::jsonb
  ),
  (
    'launching-learnhub-in-2026',
    'article',
    'Launching LearnHub in 2026',
    'Read how we are expanding courses, ebooks, live classes, and practice exams for university learners.',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    0,
    TRUE,
    'LearnHub Team',
    'Articles',
    NULL,
    NULL,
    0,
    NULL,
    NULL,
    ARRAY['News'],
    '[]'::jsonb,
    '{"publishedAt":"2026-04-01"}'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

UPDATE catalog_items
SET
  pages = COALESCE(pages, (metadata->>'pages')::INTEGER),
  file_format = COALESCE(file_format, metadata->>'format'),
  download_enabled = CASE WHEN type = 'ebook' THEN TRUE ELSE download_enabled END,
  preview_enabled = CASE WHEN type IN ('ebook', 'course') THEN TRUE ELSE preview_enabled END,
  preview_count = CASE
    WHEN type = 'ebook' THEN 5
    WHEN type = 'course' THEN COALESCE((metadata->>'previewLectures')::INTEGER, 2)
    ELSE preview_count
  END,
  spots_total = CASE WHEN slug = 'advanced-react-patterns-workshop' THEN 50 ELSE spots_total END,
  spots_remaining = CASE WHEN slug = 'advanced-react-patterns-workshop' THEN 8 ELSE spots_remaining END,
  scheduled_at = CASE WHEN slug = 'advanced-react-patterns-workshop' THEN NOW() + INTERVAL '12 days' ELSE scheduled_at END,
  meeting_url = CASE WHEN slug = 'advanced-react-patterns-workshop' THEN 'https://meet.google.com/example-live-class' ELSE meeting_url END,
  question_count = CASE WHEN slug = 'aws-solutions-architect-practice-exam' THEN 65 ELSE question_count END,
  time_limit_minutes = CASE WHEN slug = 'aws-solutions-architect-practice-exam' THEN 130 ELSE time_limit_minutes END,
  passing_score = CASE WHEN slug = 'aws-solutions-architect-practice-exam' THEN 72 ELSE passing_score END,
  attempts_allowed = CASE WHEN slug = 'aws-solutions-architect-practice-exam' THEN 3 ELSE attempts_allowed END,
  stock_quantity = CASE WHEN slug = 'clean-code-handbook' THEN 15 ELSE stock_quantity END;

INSERT INTO coupons (
  code,
  discount_type,
  amount,
  is_active,
  valid_from,
  valid_to,
  usage_limit,
  applicable_types
)
VALUES (
  'WELCOME10',
  'percent',
  10,
  TRUE,
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '180 days',
  1000,
  ARRAY['course', 'ebook', 'live_class', 'practice_exam', 'physical_book']
)
ON CONFLICT (code) DO NOTHING;

UPDATE users
SET phone = COALESCE(phone, '9876543210')
WHERE email = 'demo@learnhub.local';
