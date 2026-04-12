ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS access_fixed_date TIMESTAMPTZ;

ALTER TABLE course_lectures
  ADD COLUMN IF NOT EXISTS quiz_payload JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE course_lectures
SET quiz_payload = '[]'::jsonb
WHERE quiz_payload IS NULL;
