UPDATE users
SET role = 'super_admin'
WHERE email = 'admin@learnhub.local';

INSERT INTO site_settings (id, home_scroller_enabled, home_scroller_message)
VALUES (1, TRUE, 'Use coupon WELCOME10 to get 10% off your first purchase.')
ON CONFLICT (id) DO UPDATE
SET
  home_scroller_enabled = EXCLUDED.home_scroller_enabled,
  home_scroller_message = EXCLUDED.home_scroller_message,
  updated_at = NOW();

INSERT INTO coupons (
  code,
  discount_type,
  amount,
  applicable_types,
  usage_limit,
  valid_to,
  is_active
)
VALUES (
  'WELCOME10',
  'percent',
  10,
  ARRAY['course'],
  1000,
  NOW() + INTERVAL '365 days',
  TRUE
)
ON CONFLICT (code) DO NOTHING;

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
VALUES
  (
    'complete-web-development-bootcamp',
    'Complete Web Development Bootcamp',
    'Master HTML, CSS, JavaScript, React, Node.js and more in one structured path.',
    'Build a solid full-stack foundation with guided projects, preview lectures, and a curriculum that moves from the basics to production-ready applications.',
    'Dr. Sarah Johnson',
    'https://images.unsplash.com/photo-1771408427146-09be9a1d4535?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMHN0dWRlbnQlMjBsYXB0b3B8ZW58MXx8fHwxNzc1MDQ0OTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'Web Development',
    'Telangana',
    'Osmania University (OU)',
    'Semester IV',
    89.99,
    '40 hours',
    4.8,
    'Bestseller',
    6,
    2,
    'fixed_months',
    6,
    'published',
    ARRAY[
      'Build responsive websites with HTML, CSS, and JavaScript',
      'Create REST APIs with Node.js and Express',
      'Work with SQL databases and authentication',
      'Deploy modern web applications confidently'
    ],
    ARRAY[
      'No prior programming experience required',
      'A computer with internet access',
      'Willingness to practice with the exercises'
    ]
  ),
  (
    'data-science-machine-learning',
    'Data Science & Machine Learning',
    'Learn Python, pandas, visualization, and practical machine learning workflows.',
    'A project-first program for learners who want to work with data, dashboards, and predictive models using a guided curriculum.',
    'Prof. Michael Chen',
    'https://images.unsplash.com/photo-1762330917056-e69b34329ddf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwY291cnNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzUwNTgzMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'Data Science',
    'Karnataka',
    'Kakatiya University',
    'Semester V',
    99.99,
    '35 hours',
    4.9,
    'New',
    4,
    1,
    'lifetime',
    NULL,
    'published',
    ARRAY[
      'Clean and analyze datasets using pandas',
      'Build practical machine learning models',
      'Visualize trends for reporting and decision making'
    ],
    ARRAY[
      'Basic computer literacy',
      'Comfort using spreadsheets is helpful'
    ]
  ),
  (
    'digital-marketing-masterclass',
    'Digital Marketing Masterclass',
    'A practical course on SEO, social media, content strategy, and analytics.',
    'Plan campaigns, improve discoverability, and measure impact with a structured digital marketing curriculum.',
    'Emily Martinez',
    'https://images.unsplash.com/photo-1621743018966-29194999d736?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBkZXNrfGVufDF8fHx8MTc3NTA1Njk2MHww&ixlib=rb-4.1.0&q=80&w=1080',
    'Marketing',
    'Andhra Pradesh',
    'Telangana University',
    'Semester III',
    79.99,
    '28 hours',
    4.7,
    'Bestseller',
    3,
    1,
    'lifetime',
    NULL,
    'published',
    ARRAY[
      'Launch SEO and social media campaigns',
      'Measure conversions using analytics tools',
      'Create content plans that align with user journeys'
    ],
    ARRAY[
      'Suitable for beginners and business owners'
    ]
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO course_sections (course_id, title, position)
SELECT c.id, v.title, v.position
FROM courses c
JOIN (
  VALUES
    ('complete-web-development-bootcamp', 'Introduction to Web Development', 1),
    ('complete-web-development-bootcamp', 'HTML, CSS and Responsive Layouts', 2),
    ('complete-web-development-bootcamp', 'JavaScript and React Foundations', 3),
    ('data-science-machine-learning', 'Getting Started with Python Data Workflows', 1),
    ('data-science-machine-learning', 'Model Training and Evaluation', 2),
    ('digital-marketing-masterclass', 'Digital Marketing Foundations', 1),
    ('digital-marketing-masterclass', 'Campaign Analytics and Optimization', 2)
) AS v(slug, title, position)
  ON v.slug = c.slug
ON CONFLICT (course_id, position) DO NOTHING;

INSERT INTO course_lectures (section_id, title, duration_text, position, is_preview)
SELECT s.id, v.title, v.duration_text, v.position, v.is_preview
FROM course_sections s
JOIN courses c ON c.id = s.course_id
JOIN (
  VALUES
    ('complete-web-development-bootcamp', 1, 'Welcome and course roadmap', '08:32', 1, TRUE),
    ('complete-web-development-bootcamp', 1, 'How web apps work', '12:11', 2, TRUE),
    ('complete-web-development-bootcamp', 2, 'Semantic HTML essentials', '15:20', 1, FALSE),
    ('complete-web-development-bootcamp', 2, 'Responsive CSS layout patterns', '18:40', 2, FALSE),
    ('complete-web-development-bootcamp', 3, 'Modern JavaScript for React', '21:15', 1, FALSE),
    ('complete-web-development-bootcamp', 3, 'Your first React project', '25:03', 2, FALSE),
    ('data-science-machine-learning', 1, 'Setting up Python and notebooks', '10:05', 1, TRUE),
    ('data-science-machine-learning', 1, 'Data cleaning with pandas', '17:42', 2, FALSE),
    ('data-science-machine-learning', 2, 'Train-test split and metrics', '19:13', 1, FALSE),
    ('data-science-machine-learning', 2, 'Feature importance in practice', '16:54', 2, FALSE),
    ('digital-marketing-masterclass', 1, 'Channels, funnels, and positioning', '11:36', 1, TRUE),
    ('digital-marketing-masterclass', 1, 'Planning a launch campaign', '14:24', 2, FALSE),
    ('digital-marketing-masterclass', 2, 'Reading campaign dashboards', '13:55', 1, FALSE),
    ('digital-marketing-masterclass', 2, 'Improving conversion rates', '15:47', 2, FALSE)
) AS v(slug, section_position, title, duration_text, position, is_preview)
  ON v.slug = c.slug
 AND v.section_position = s.position
ON CONFLICT (section_id, position) DO NOTHING;

INSERT INTO course_purchases (
  user_id,
  course_id,
  purchased_at,
  access_expires_at,
  progress_percent,
  completed_lectures
)
SELECT
  u.id,
  c.id,
  NOW() - INTERVAL '7 days',
  NOW() + INTERVAL '6 months',
  35,
  2
FROM users u
JOIN courses c ON c.slug = 'complete-web-development-bootcamp'
WHERE u.email = 'demo@learnhub.local'
ON CONFLICT (user_id, course_id) DO NOTHING;
