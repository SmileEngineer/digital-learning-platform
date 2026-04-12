-- Add runtime-editable site configuration for homepage banner, navigation, and module categories.

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS home_banner_eyebrow TEXT,
  ADD COLUMN IF NOT EXISTS home_banner_title TEXT,
  ADD COLUMN IF NOT EXISTS home_banner_description TEXT,
  ADD COLUMN IF NOT EXISTS course_navigation JSONB,
  ADD COLUMN IF NOT EXISTS ebook_navigation JSONB,
  ADD COLUMN IF NOT EXISTS module_categories JSONB;

UPDATE site_settings
SET
  home_banner_eyebrow = COALESCE(home_banner_eyebrow, 'Kantri by Awareness, Honest by Conscience.'),
  home_banner_title = COALESCE(home_banner_title, 'An anonymous voice on a mission to simplify the law for the common people.'),
  home_banner_description = COALESCE(home_banner_description, 'A sincere desire to build responsible citizens with strong values is my credential.'),
  module_categories = COALESCE(
    module_categories,
    jsonb_build_object(
      'course', jsonb_build_array('LLB 3 YDC', 'LAWCET', 'CLAT', 'AIBE', 'Bare Acts'),
      'ebook', jsonb_build_array('eBooks', 'Exam Prep', 'Bare Acts'),
      'physicalBook', jsonb_build_array('Bookstore', 'Exam Prep', 'Bare Acts'),
      'liveClass', jsonb_build_array('Live Classes', 'Revision Sessions'),
      'practiceExam', jsonb_build_array('Practice Exams', 'Mock Tests')
    )
  )
WHERE id = 1;
