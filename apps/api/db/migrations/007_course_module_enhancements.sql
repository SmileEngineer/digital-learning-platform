ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS final_quiz_title TEXT,
  ADD COLUMN IF NOT EXISTS final_quiz_question_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE course_sections
  ADD COLUMN IF NOT EXISTS quiz_title TEXT,
  ADD COLUMN IF NOT EXISTS quiz_question_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE course_lectures
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS quiz_title TEXT,
  ADD COLUMN IF NOT EXISTS quiz_question_count INTEGER NOT NULL DEFAULT 0;

UPDATE course_lectures
SET
  video_url = CASE
    WHEN title ILIKE '%roadmap%' THEN 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    WHEN title ILIKE '%react%' THEN 'https://www.youtube.com/embed/Tn6-PIqc4UM'
    WHEN title ILIKE '%python%' THEN 'https://www.youtube.com/embed/_uQrJ0TkZlc'
    WHEN title ILIKE '%campaign%' THEN 'https://www.youtube.com/embed/Ke90Tje7VS0'
    ELSE COALESCE(video_url, 'https://www.youtube.com/embed/Tn6-PIqc4UM')
  END,
  quiz_title = CASE
    WHEN quiz_title IS NOT NULL AND quiz_title <> '' THEN quiz_title
    WHEN is_preview THEN 'Preview Checkpoint'
    ELSE 'Lesson Quiz'
  END,
  quiz_question_count = CASE
    WHEN quiz_question_count > 0 THEN quiz_question_count
    WHEN is_preview THEN 3
    ELSE 5
  END
WHERE video_url IS NULL
   OR quiz_title IS NULL
   OR quiz_question_count = 0;

UPDATE course_sections
SET
  quiz_title = COALESCE(NULLIF(quiz_title, ''), CONCAT(title, ' Assessment')),
  quiz_question_count = CASE
    WHEN quiz_question_count > 0 THEN quiz_question_count
    ELSE 10
  END
WHERE quiz_title IS NULL
   OR quiz_question_count = 0;

UPDATE courses
SET
  final_quiz_title = COALESCE(NULLIF(final_quiz_title, ''), CONCAT(title, ' Final Quiz')),
  final_quiz_question_count = CASE
    WHEN final_quiz_question_count > 0 THEN final_quiz_question_count
    ELSE 20
  END
WHERE final_quiz_title IS NULL
   OR final_quiz_question_count = 0;
