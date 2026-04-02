CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student'
CHECK (role IN ('student', 'admin', 'staff'));

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'flat', 'free_access')),
  discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  applicable_modules TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  instructor_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  state_name TEXT,
  university_name TEXT,
  semester_label TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  duration_text TEXT NOT NULL,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 0,
  tag TEXT,
  total_lectures INTEGER NOT NULL DEFAULT 0 CHECK (total_lectures >= 0),
  preview_lecture_count INTEGER NOT NULL DEFAULT 1 CHECK (preview_lecture_count >= 0),
  access_type TEXT NOT NULL DEFAULT 'lifetime' CHECK (access_type IN ('lifetime', 'fixed_months')),
  access_months INTEGER CHECK (access_months IS NULL OR access_months > 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  learning_points TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  requirements TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, position)
);

CREATE TABLE IF NOT EXISTS course_lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_text TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position > 0),
  is_preview BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (section_id, position)
);

CREATE TABLE IF NOT EXISTS course_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  access_expires_at TIMESTAMPTZ,
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  completed_lectures INTEGER NOT NULL DEFAULT 0 CHECK (completed_lectures >= 0),
  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_course_sections_course ON course_sections(course_id, position);
CREATE INDEX IF NOT EXISTS idx_course_lectures_section ON course_lectures(section_id, position);
CREATE INDEX IF NOT EXISTS idx_course_purchases_user ON course_purchases(user_id, purchased_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_purchases_course ON course_purchases(course_id);
