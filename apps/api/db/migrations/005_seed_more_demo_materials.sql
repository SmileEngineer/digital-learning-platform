-- Expand demo catalog content and keep course checkout data in sync

INSERT INTO courses (
  slug,
  title,
  short_description,
  description,
  instructor_name,
  image_url,
  category,
  state_name,
  university_name,
  semester_label,
  price,
  duration_text,
  rating,
  tag,
  total_lectures,
  preview_lecture_count,
  access_type,
  access_months,
  status,
  learning_points,
  requirements
)
VALUES (
  'cloud-devops-accelerator',
  'Cloud & DevOps Accelerator',
  'Learn Docker, CI/CD, cloud deployment, and production monitoring in one guided track.',
  'This accelerated program helps learners move from local development to production deployment with containerization, pipelines, infrastructure basics, and platform observability.',
  'Rahul Verma',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'DevOps',
  'Maharashtra',
  'Savitribai Phule Pune University',
  'Semester VI',
  109.99,
  '32 hours',
  4.85,
  'New',
  5,
  2,
  'fixed_months',
  3,
  'published',
  ARRAY[
    'Containerize applications with Docker',
    'Build CI/CD workflows for modern teams',
    'Deploy apps to cloud infrastructure',
    'Monitor application health after release'
  ],
  ARRAY[
    'Basic command-line familiarity',
    'Some JavaScript or Python experience is helpful'
  ]
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO course_sections (course_id, title, position)
SELECT c.id, v.title, v.position
FROM courses c
JOIN (
  VALUES
    ('cloud-devops-accelerator', 'Container Foundations', 1),
    ('cloud-devops-accelerator', 'CI/CD Pipelines', 2),
    ('cloud-devops-accelerator', 'Cloud Deployment and Monitoring', 3)
) AS v(slug, title, position)
  ON v.slug = c.slug
ON CONFLICT (course_id, position) DO NOTHING;

INSERT INTO course_lectures (section_id, title, duration_text, position, is_preview)
SELECT s.id, v.title, v.duration_text, v.position, v.is_preview
FROM course_sections s
JOIN courses c ON c.id = s.course_id
JOIN (
  VALUES
    ('cloud-devops-accelerator', 1, 'Why containers matter', '09:18', 1, TRUE),
    ('cloud-devops-accelerator', 1, 'Building your first Docker image', '14:42', 2, TRUE),
    ('cloud-devops-accelerator', 2, 'Pipeline stages and deployment gates', '18:09', 1, FALSE),
    ('cloud-devops-accelerator', 2, 'Automating tests in CI', '16:37', 2, FALSE),
    ('cloud-devops-accelerator', 3, 'Deploying to a managed cloud service', '21:11', 1, FALSE)
) AS v(slug, section_position, title, duration_text, position, is_preview)
  ON v.slug = c.slug
 AND v.section_position = s.position
ON CONFLICT (section_id, position) DO NOTHING;

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
  students_count,
  rating,
  validity_days,
  tags,
  curriculum,
  metadata
)
SELECT
  c.slug,
  'course',
  c.title,
  c.short_description,
  c.image_url,
  c.price,
  COALESCE(c.tag IN ('Bestseller', 'New'), FALSE),
  c.instructor_name,
  c.category,
  c.duration_text,
  (
    SELECT COUNT(*)::int
    FROM course_purchases cp
    WHERE cp.course_id = c.id
      AND (cp.access_expires_at IS NULL OR cp.access_expires_at > NOW())
  ),
  c.rating,
  CASE
    WHEN c.access_type = 'fixed_months' AND c.access_months IS NOT NULL THEN c.access_months * 30
    ELSE NULL
  END,
  CASE
    WHEN c.tag IS NULL THEN ARRAY[]::TEXT[]
    ELSE ARRAY[c.tag]
  END,
  COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object(
        'title', s.title,
        'lectures', COALESCE(lecture_counts.total, 0)
      )
      ORDER BY s.position
    )
    FROM course_sections s
    LEFT JOIN (
      SELECT section_id, COUNT(*)::int AS total
      FROM course_lectures
      GROUP BY section_id
    ) AS lecture_counts ON lecture_counts.section_id = s.id
    WHERE s.course_id = c.id
  ), '[]'::jsonb),
  jsonb_build_object(
    'previewLectures', c.preview_lecture_count,
    'accessType', c.access_type,
    'accessMonths', c.access_months
  )
FROM courses c
WHERE NOT EXISTS (
  SELECT 1
  FROM catalog_items ci
  WHERE ci.slug = c.slug
);

UPDATE catalog_items ci
SET
  title = c.title,
  description = c.short_description,
  image_url = c.image_url,
  price = c.price,
  instructor_name = c.instructor_name,
  category = c.category,
  duration_label = c.duration_text,
  rating = c.rating,
  preview_enabled = TRUE,
  preview_count = c.preview_lecture_count,
  validity_days = CASE
    WHEN c.access_type = 'fixed_months' AND c.access_months IS NOT NULL THEN c.access_months * 30
    ELSE NULL
  END,
  tags = CASE
    WHEN c.tag IS NULL THEN ARRAY[]::TEXT[]
    ELSE ARRAY[c.tag]
  END,
  metadata = jsonb_build_object(
    'previewLectures', c.preview_lecture_count,
    'accessType', c.access_type,
    'accessMonths', c.access_months
  ),
  updated_at = NOW()
FROM courses c
WHERE ci.slug = c.slug
  AND ci.type = 'course';

INSERT INTO catalog_items (
  slug,
  type,
  title,
  description,
  image_url,
  price,
  featured,
  instructor_name,
  author_name,
  category,
  duration_label,
  students_count,
  rating,
  validity_days,
  tags,
  curriculum,
  metadata
)
VALUES
  (
    'ui-ux-design-playbook',
    'ebook',
    'UI/UX Design Playbook',
    'A practical handbook for wireframing, user flows, design systems, and usability reviews.',
    'https://images.unsplash.com/photo-1516321497487-e288fb19713f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    24.99,
    TRUE,
    'Product Design Faculty',
    'LearnHub Editorial Team',
    'Design',
    NULL,
    0,
    4.7,
    NULL,
    ARRAY['Popular'],
    '[]'::jsonb,
    '{"pages": 280, "format": "PDF"}'::jsonb
  ),
  (
    'system-design-interview-kit',
    'physical_book',
    'System Design Interview Kit',
    'Printed handbook with architectures, scaling patterns, and whiteboard-ready case studies.',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    54.99,
    TRUE,
    NULL,
    'Interview Prep Team',
    'Books',
    NULL,
    0,
    4.9,
    NULL,
    ARRAY['Limited Stock'],
    '[]'::jsonb,
    '{"author":"LearnHub Press"}'::jsonb
  ),
  (
    'sql-analytics-live-bootcamp',
    'live_class',
    'SQL Analytics Live Bootcamp',
    'Attend a live session on SQL reporting, cohort analysis, and dashboard-ready query patterns.',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    59.99,
    TRUE,
    'Priya Nair',
    NULL,
    'Live Classes',
    '2.5 hours',
    68,
    4.8,
    14,
    ARRAY['Upcoming'],
    '[]'::jsonb,
    '{"recordingDays": 14}'::jsonb
  ),
  (
    'full-stack-developer-practice-exam',
    'practice_exam',
    'Full Stack Developer Practice Exam',
    'Timed assessment with frontend, backend, SQL, and deployment-focused questions.',
    'https://images.unsplash.com/photo-1516116216624-53e697fedbea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    34.99,
    FALSE,
    'Assessment Team',
    NULL,
    'Practice Exams',
    '90 minutes',
    0,
    4.6,
    60,
    ARRAY['Assessment'],
    '[]'::jsonb,
    '{"questionBankVersion":"v2"}'::jsonb
  ),
  (
    'how-to-plan-a-6-month-learning-path',
    'article',
    'How to Plan a 6-Month Learning Path',
    'A practical guide for sequencing courses, books, live classes, and revision time into one roadmap.',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    0,
    TRUE,
    'LearnHub Team',
    NULL,
    'Articles',
    NULL,
    0,
    NULL,
    NULL,
    ARRAY['Guide'],
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
    WHEN type = 'ebook' THEN GREATEST(preview_count, 5)
    WHEN type = 'course' THEN GREATEST(preview_count, COALESCE((metadata->>'previewLectures')::INTEGER, preview_count))
    ELSE preview_count
  END,
  stock_quantity = CASE
    WHEN slug = 'system-design-interview-kit' THEN COALESCE(stock_quantity, 20)
    ELSE stock_quantity
  END,
  spots_total = CASE
    WHEN slug = 'sql-analytics-live-bootcamp' THEN COALESCE(spots_total, 80)
    ELSE spots_total
  END,
  spots_remaining = CASE
    WHEN slug = 'sql-analytics-live-bootcamp' THEN COALESCE(spots_remaining, 12)
    ELSE spots_remaining
  END,
  scheduled_at = CASE
    WHEN slug = 'sql-analytics-live-bootcamp' THEN COALESCE(scheduled_at, NOW() + INTERVAL '9 days')
    ELSE scheduled_at
  END,
  meeting_url = CASE
    WHEN slug = 'sql-analytics-live-bootcamp' THEN COALESCE(meeting_url, 'https://meet.google.com/sql-analytics-demo')
    ELSE meeting_url
  END,
  question_count = CASE
    WHEN slug = 'full-stack-developer-practice-exam' THEN COALESCE(question_count, 50)
    ELSE question_count
  END,
  time_limit_minutes = CASE
    WHEN slug = 'full-stack-developer-practice-exam' THEN COALESCE(time_limit_minutes, 90)
    ELSE time_limit_minutes
  END,
  passing_score = CASE
    WHEN slug = 'full-stack-developer-practice-exam' THEN COALESCE(passing_score, 70)
    ELSE passing_score
  END,
  attempts_allowed = CASE
    WHEN slug = 'full-stack-developer-practice-exam' THEN COALESCE(attempts_allowed, 2)
    ELSE attempts_allowed
  END,
  updated_at = NOW()
WHERE slug IN (
  'ui-ux-design-playbook',
  'system-design-interview-kit',
  'sql-analytics-live-bootcamp',
  'full-stack-developer-practice-exam',
  'how-to-plan-a-6-month-learning-path'
);

INSERT INTO coupons (
  code,
  discount_type,
  amount,
  is_active,
  valid_from,
  valid_to,
  usage_limit,
  applicable_types,
  applicable_emails
)
VALUES (
  'DEMO25',
  'percent',
  25,
  TRUE,
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '365 days',
  200,
  ARRAY['course', 'ebook', 'live_class', 'practice_exam'],
  ARRAY['demo@learnhub.local']
)
ON CONFLICT (code) DO NOTHING;
