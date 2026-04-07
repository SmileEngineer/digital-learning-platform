-- Align public seed data and platform defaults with the supplied Kantri Lawyer requirements bundle.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS active_session_id TEXT;

ALTER TABLE catalog_items
  ALTER COLUMN currency SET DEFAULT 'INR';

ALTER TABLE orders
  ALTER COLUMN currency SET DEFAULT 'INR';

UPDATE catalog_items
SET currency = 'INR'
WHERE currency <> 'INR';

UPDATE orders
SET currency = 'INR'
WHERE currency <> 'INR';

UPDATE coupons
SET applicable_types = ARRAY['course', 'ebook', 'live_class', 'practice_exam', 'physical_book']::text[]
WHERE code = 'WELCOME10';

INSERT INTO site_settings (id, home_scroller_enabled, home_scroller_message)
VALUES (1, TRUE, 'Site is under construction. No orders will be fulfilled at this time.')
ON CONFLICT (id) DO UPDATE
SET
  home_scroller_enabled = EXCLUDED.home_scroller_enabled,
  home_scroller_message = EXCLUDED.home_scroller_message,
  updated_at = NOW();

UPDATE courses
SET status = 'draft', updated_at = NOW()
WHERE slug IN (
  'complete-web-development-bootcamp',
  'data-science-machine-learning',
  'digital-marketing-masterclass',
  'cloud-devops-accelerator'
);

UPDATE catalog_items
SET status = 'draft', updated_at = NOW()
WHERE slug IN (
  'complete-web-development-bootcamp',
  'data-science-machine-learning',
  'digital-marketing-masterclass',
  'cloud-devops-accelerator',
  'modern-javascript-guide',
  'python-for-data-analysis',
  'ui-ux-design-playbook',
  'clean-code-handbook',
  'system-design-interview-kit',
  'advanced-react-patterns-workshop',
  'sql-analytics-live-bootcamp',
  'aws-solutions-architect-practice-exam',
  'full-stack-developer-practice-exam',
  'launching-learnhub-in-2026',
  'how-to-plan-a-6-month-learning-path'
);

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
  requirements,
  final_quiz_title,
  final_quiz_question_count
)
VALUES (
  'law-of-contracts-i-ou-semester-1',
  'Law of Contracts - I - OU Semester-1',
  'LLB 3 YDC OU Law of Contracts - I course for first semester learners.',
  $course_description$This course introduces students to the Law of Contract - I, a foundational subject in legal education. It covers the essential elements required to form a valid contract, the capacity of parties, free consent, lawful objects, and different kinds of agreements. The course also explains how contracts are discharged, remedies available for breach, and the role of specific relief under Indian law.

Special emphasis is placed on clarity of concepts, statutory provisions, illustrations, and exam relevance, making it ideal for beginners in law.

Who this course is for:
First Year LL.B. students (First Semester)
Law students preparing for Osmania University examinations
Students seeking a strong conceptual foundation in Contract Law
Beginners with no prior legal background

Osmania University LLB First Semester - Law of Contract - I Syllabus:

Unit - I
Definition and essentials of a valid Contract - Definition and essentials of valid Offer - Definition and essentials of valid Acceptance - Communication of Offer and Acceptance - Revocation of Offer and Acceptance through various modes including electronic medium - Consideration - Salient features - Exceptions to consideration - Doctrine of Privity of Contract - Exceptions to the Privity of Contract - Standard Form of Contract.

Unit - II
Capacity of the parties - Effect of Minor's Agreement - Contracts with insane persons and persons disqualified by law - Concepts of Free Consent - Coercion - Undue Influence - Misrepresentation - Fraud - Mistake - Lawful Object - Immoral agreements and various heads of Public Policy - Illegal agreements - Uncertain agreements - Wagering agreements - Contingent contracts - Void and Voidable contracts.

Unit - III
Discharge of Contracts - By performance - Appropriation of payments - Performance by joint promisors - Discharge by Novation - Remission - Accord and Satisfaction - Discharge by impossibility of performance (Doctrine of Frustration) - Discharge by Breach - Anticipatory Breach - Actual Breach.

Unit - IV
Quasi Contract - Necessaries supplied to a person who is incapable of entering into a contract - Payment by an interested person - Liability to pay for non-gratuitous acts - Rights of finder of lost goods - Things delivered by mistake or coercion - Quantum Meruit - Remedies for breach of contract - Kinds of damages - Liquidated and unliquidated damages and penalty - Duty to mitigate.

Unit - V
Specific Relief Act including 2018 Amendment - Recovering possession of property - Specific performance of the contract - As a rule enforced by court - Rectification of instruments - Rescission of contracts as a rule enforced by court - Cancellation of instruments - Declaratory Decrees - Preventive Relief - Injunctions (General) - Temporary and Perpetual Injunctions - Mandatory and Prohibitory Injunctions - Injunctions to perform negative agreement - Limited Liability Partnership (LLP) - Special provision for contracts relating to infrastructure projects - Arbitration clause - Arbitration and Conciliation Act, 1996 - Impact of COVID-19 on Specific Performance of Contracts.$course_description$,
  'Kantri Lawyer',
  '/images/logo.png',
  'LLB 3 YDC OU Law of Contracts - I',
  'Telangana',
  'Osmania University',
  'Semester I',
  999,
  '7.5 hours',
  4.9,
  'OU Semester-1',
  5,
  1,
  'lifetime',
  NULL,
  'published',
  ARRAY[
    'Understand the fundamental principles of the Law of Contract under Indian law',
    'Learn the essentials of a valid contract, offer, acceptance, and consideration',
    'Analyze capacity, consent, legality, and enforceability of agreements',
    'Distinguish between valid, void, voidable, illegal, and contingent contracts',
    'Understand discharge of contracts and remedies for breach',
    'Gain clarity on quasi-contracts, damages, and specific relief',
    'Develop the ability to apply legal concepts to practical and exam-oriented problems',
    'And much more topics in Law of Contracts - I'
  ],
  ARRAY[
    'No prior knowledge of law is required',
    'Interest in learning core legal concepts'
  ],
  'Law of Contracts - I Final Quiz',
  20
)
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  instructor_name = EXCLUDED.instructor_name,
  image_url = EXCLUDED.image_url,
  category = EXCLUDED.category,
  state_name = EXCLUDED.state_name,
  university_name = EXCLUDED.university_name,
  semester_label = EXCLUDED.semester_label,
  price = EXCLUDED.price,
  duration_text = EXCLUDED.duration_text,
  rating = EXCLUDED.rating,
  tag = EXCLUDED.tag,
  total_lectures = EXCLUDED.total_lectures,
  preview_lecture_count = EXCLUDED.preview_lecture_count,
  access_type = EXCLUDED.access_type,
  access_months = EXCLUDED.access_months,
  status = EXCLUDED.status,
  learning_points = EXCLUDED.learning_points,
  requirements = EXCLUDED.requirements,
  final_quiz_title = EXCLUDED.final_quiz_title,
  final_quiz_question_count = EXCLUDED.final_quiz_question_count,
  updated_at = NOW();

DELETE FROM course_sections
WHERE course_id = (
  SELECT id FROM courses WHERE slug = 'law-of-contracts-i-ou-semester-1'
);

INSERT INTO course_sections (course_id, title, position, quiz_title, quiz_question_count)
SELECT c.id, v.title, v.position, v.quiz_title, v.quiz_question_count
FROM courses c
JOIN (
  VALUES
    ('Unit - I: Formation of Contract', 1, 'Unit - I Assessment', 5),
    ('Unit - II: Capacity, Consent, and Void Agreements', 2, 'Unit - II Assessment', 5),
    ('Unit - III: Discharge of Contracts', 3, 'Unit - III Assessment', 5),
    ('Unit - IV: Quasi Contract and Remedies', 4, 'Unit - IV Assessment', 5),
    ('Unit - V: Specific Relief Act and Arbitration', 5, 'Unit - V Assessment', 5)
) AS v(title, position, quiz_title, quiz_question_count)
  ON c.slug = 'law-of-contracts-i-ou-semester-1';

INSERT INTO course_lectures (
  section_id,
  title,
  duration_text,
  video_url,
  position,
  is_preview,
  quiz_title,
  quiz_question_count
)
SELECT
  s.id,
  v.lecture_title,
  v.duration_text,
  v.video_url,
  1,
  v.is_preview,
  v.quiz_title,
  v.quiz_question_count
FROM course_sections s
JOIN courses c ON c.id = s.course_id
JOIN (
  VALUES
    (1, 'Definition and essentials of a valid Contract', '1h 30m', 'https://www.youtube.com/embed/dD9mgeTm5vQ?list=PLvCHZZv1IA1ko1XwmGJxoGyFn1kQdFRaL', TRUE, 'Preview Checkpoint', 3),
    (2, 'Capacity, free consent, lawful object, and void agreements', '1h 30m', 'https://www.youtube.com/embed/dD9mgeTm5vQ?list=PLvCHZZv1IA1ko1XwmGJxoGyFn1kQdFRaL', FALSE, 'Lesson Quiz', 5),
    (3, 'Discharge of contracts and breach', '1h 30m', 'https://www.youtube.com/embed/dD9mgeTm5vQ?list=PLvCHZZv1IA1ko1XwmGJxoGyFn1kQdFRaL', FALSE, 'Lesson Quiz', 5),
    (4, 'Quasi contract and remedies for breach', '1h 30m', 'https://www.youtube.com/embed/dD9mgeTm5vQ?list=PLvCHZZv1IA1ko1XwmGJxoGyFn1kQdFRaL', FALSE, 'Lesson Quiz', 5),
    (5, 'Specific Relief Act including 2018 Amendment', '1h 30m', 'https://www.youtube.com/embed/dD9mgeTm5vQ?list=PLvCHZZv1IA1ko1XwmGJxoGyFn1kQdFRaL', FALSE, 'Lesson Quiz', 5)
) AS v(section_position, lecture_title, duration_text, video_url, is_preview, quiz_title, quiz_question_count)
  ON c.slug = 'law-of-contracts-i-ou-semester-1'
 AND s.position = v.section_position;

INSERT INTO catalog_items (
  slug,
  type,
  title,
  description,
  image_url,
  price,
  currency,
  status,
  featured,
  instructor_name,
  category,
  duration_label,
  duration_minutes,
  students_count,
  rating,
  preview_enabled,
  preview_count,
  validity_days,
  tags,
  curriculum,
  metadata
)
VALUES (
  'law-of-contracts-i-ou-semester-1',
  'course',
  'Law of Contracts - I - OU Semester-1',
  'LLB 3 YDC OU Law of Contracts - I course for first semester learners.',
  '/images/logo.png',
  999,
  'INR',
  'published',
  TRUE,
  'Kantri Lawyer',
  'LLB 3 YDC OU Law of Contracts - I',
  '7.5 hours',
  450,
  0,
  4.9,
  TRUE,
  1,
  NULL,
  ARRAY['OU Semester-1', 'Law of Contracts'],
  jsonb_build_array(
    jsonb_build_object('title', 'Unit - I: Formation of Contract', 'lectures', 1, 'duration', '1h 30m'),
    jsonb_build_object('title', 'Unit - II: Capacity, Consent, and Void Agreements', 'lectures', 1, 'duration', '1h 30m'),
    jsonb_build_object('title', 'Unit - III: Discharge of Contracts', 'lectures', 1, 'duration', '1h 30m'),
    jsonb_build_object('title', 'Unit - IV: Quasi Contract and Remedies', 'lectures', 1, 'duration', '1h 30m'),
    jsonb_build_object('title', 'Unit - V: Specific Relief Act and Arbitration', 'lectures', 1, 'duration', '1h 30m')
  ),
  jsonb_build_object(
    'previewLectures', 1,
    'accessType', 'lifetime',
    'accessMonths', NULL,
    'finalQuizTitle', 'Law of Contracts - I Final Quiz',
    'finalQuizQuestionCount', 20,
    'stateName', 'Telangana',
    'universityName', 'Osmania University',
    'semesterLabel', 'Semester I',
    'courseLink', 'https://www.youtube.com/watch?v=dD9mgeTm5vQ&list=PLvCHZZv1IA1ko1XwmGJxoGyFn1kQdFRaL',
    'videoProtection', jsonb_build_object(
      'controlsList', 'nodownload',
      'disableRightClick', TRUE,
      'blockDevtoolsShortcuts', TRUE,
      'drmRequiredForProduction', TRUE
    )
  )
)
ON CONFLICT (slug) DO UPDATE
SET
  type = EXCLUDED.type,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  instructor_name = EXCLUDED.instructor_name,
  category = EXCLUDED.category,
  duration_label = EXCLUDED.duration_label,
  duration_minutes = EXCLUDED.duration_minutes,
  rating = EXCLUDED.rating,
  preview_enabled = EXCLUDED.preview_enabled,
  preview_count = EXCLUDED.preview_count,
  validity_days = EXCLUDED.validity_days,
  tags = EXCLUDED.tags,
  curriculum = EXCLUDED.curriculum,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

INSERT INTO catalog_items (
  slug,
  type,
  title,
  description,
  image_url,
  price,
  currency,
  status,
  featured,
  author_name,
  category,
  pages,
  file_format,
  download_enabled,
  preview_enabled,
  preview_count,
  tags,
  curriculum,
  metadata
)
VALUES
  (
    'last-minute-exam-prep-guide-llb-first-semester-tg',
    'ebook',
    'Last Minute Exam Prep Guide for LLB - First Semester - TG',
    $tg_book$This book is specially designed for students who start their exam preparation just one day before the exam. It is meant only for last-minute revision. You will also have another book, which is the original and official book, meant for serious, long-term preparation. That book covers the entire syllabus from the beginning, in very simple language, with detailed explanations, section numbers, case laws, and MCQs. Please note that this revision book does not give in-depth explanations of topics, and that is not required at this stage.

From next time onwards, do not depend on last-day preparation. Start studying from the beginning, using the original book, because the LLB course is very important for your career.

Use this book only for final revision, not as your main study material.

Book Covers:
All 5 Subjects of Osmania University Syllabus$tg_book$,
    '/images/last-minute-exam-prep-tg.png',
    199,
    'INR',
    'published',
    TRUE,
    'K Keerthi',
    'eBooks',
    5,
    'PDF',
    TRUE,
    TRUE,
    2,
    ARRAY['LLB', 'TG', 'Exam Prep'],
    '[]'::jsonb,
    jsonb_build_object(
      'stateName', 'Telangana',
      'universityName', 'Osmania University',
      'semesterLabel', 'Semester I',
      'downloadConfirmationMessage', 'This eBook will be exported with your contact watermark on every page. Continue?',
      'readerProtection', jsonb_build_object('disableRightClick', TRUE, 'blockDevtoolsShortcuts', TRUE, 'singleDeviceNotice', TRUE),
      'pageContents', jsonb_build_array(
        jsonb_build_object('title', 'Book Name', 'body', 'Last Minute Exam Prep Guide for LLB - First Semester - TG', 'imageUrl', '/images/last-minute-exam-prep-tg.png'),
        jsonb_build_object('title', 'Book Description', 'body', $tg_body$This book is specially designed for students who start their exam preparation just one day before the exam. It is meant only for last-minute revision. You will also have another book, which is the original and official book, meant for serious, long-term preparation. That book covers the entire syllabus from the beginning, in very simple language, with detailed explanations, section numbers, case laws, and MCQs. Please note that this revision book does not give in-depth explanations of topics, and that is not required at this stage.$tg_body$),
        jsonb_build_object('title', 'Study Advice', 'body', 'From next time onwards, do not depend on last-day preparation. Start studying from the beginning, using the original book, because the LLB course is very important for your career.'),
        jsonb_build_object('title', 'Revision Use', 'body', 'Use this book only for final revision, not as your main study material.'),
        jsonb_build_object('title', 'Book Covers', 'body', 'All 5 Subjects of Osmania University Syllabus')
      )
    )
  ),
  (
    'last-minute-exam-prep-guide-llb-first-semester-ap',
    'ebook',
    'Last Minute Exam Prep Guide for LLB - First Semester - AP',
    $ap_book$This book is specially designed for students who start their exam preparation just one day before the exam. It is meant only for last-minute revision. You will also have another book, which is the original and official book, meant for serious, long-term preparation. That book covers the entire syllabus from the beginning, in very simple language, with detailed explanations, section numbers, case laws, and MCQs. Please note that this revision book does not give in-depth explanations of topics, and that is not required at this stage.

From next time onwards, do not depend on last-day preparation. Start studying from the beginning, using the original book, because the LLB course is very important for your career.

Use this book only for final revision, not as your main study material.

Book Covers:
All 5 Subjects of Andhra University Syllabus$ap_book$,
    '/images/last-minute-exam-prep-ap.png',
    199,
    'INR',
    'published',
    TRUE,
    'K Keerthi',
    'eBooks',
    5,
    'PDF',
    TRUE,
    TRUE,
    2,
    ARRAY['LLB', 'AP', 'Exam Prep'],
    '[]'::jsonb,
    jsonb_build_object(
      'stateName', 'Andhra Pradesh',
      'universityName', 'Andhra University',
      'semesterLabel', NULL,
      'downloadConfirmationMessage', 'This eBook will be exported with your contact watermark on every page. Continue?',
      'readerProtection', jsonb_build_object('disableRightClick', TRUE, 'blockDevtoolsShortcuts', TRUE, 'singleDeviceNotice', TRUE),
      'pageContents', jsonb_build_array(
        jsonb_build_object('title', 'Book Name', 'body', 'Last Minute Exam Prep Guide for LLB - First Semester - AP', 'imageUrl', '/images/last-minute-exam-prep-ap.png'),
        jsonb_build_object('title', 'Book Description', 'body', $ap_body$This book is specially designed for students who start their exam preparation just one day before the exam. It is meant only for last-minute revision. You will also have another book, which is the original and official book, meant for serious, long-term preparation. That book covers the entire syllabus from the beginning, in very simple language, with detailed explanations, section numbers, case laws, and MCQs. Please note that this revision book does not give in-depth explanations of topics, and that is not required at this stage.$ap_body$),
        jsonb_build_object('title', 'Study Advice', 'body', 'From next time onwards, do not depend on last-day preparation. Start studying from the beginning, using the original book, because the LLB course is very important for your career.'),
        jsonb_build_object('title', 'Revision Use', 'body', 'Use this book only for final revision, not as your main study material.'),
        jsonb_build_object('title', 'Book Covers', 'body', 'All 5 Subjects of Andhra University Syllabus')
      )
    )
  )
ON CONFLICT (slug) DO UPDATE
SET
  type = EXCLUDED.type,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  author_name = EXCLUDED.author_name,
  category = EXCLUDED.category,
  pages = EXCLUDED.pages,
  file_format = EXCLUDED.file_format,
  download_enabled = EXCLUDED.download_enabled,
  preview_enabled = EXCLUDED.preview_enabled,
  preview_count = EXCLUDED.preview_count,
  tags = EXCLUDED.tags,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

INSERT INTO catalog_items (
  slug,
  type,
  title,
  description,
  image_url,
  price,
  currency,
  status,
  featured,
  author_name,
  category,
  stock_quantity,
  tags,
  curriculum,
  metadata
)
SELECT
  src.slug,
  'physical_book',
  src.title,
  src.description,
  src.image_url,
  299,
  'INR',
  'published',
  src.featured,
  src.author_name,
  'Bookstore',
  50,
  src.tags,
  '[]'::jsonb,
  jsonb_build_object(
    'stateName', src.metadata->>'stateName',
    'universityName', src.metadata->>'universityName',
    'semesterLabel', src.metadata->>'semesterLabel',
    'isbn', CASE WHEN src.slug LIKE '%-tg-physical-book' THEN 'KANTRI-TG-LLB-001' ELSE 'KANTRI-AP-LLB-001' END,
    'galleryImages', jsonb_build_array(src.image_url),
    'shippingNotes', 'Ships via DTDC after order confirmation.'
  )
FROM (
  SELECT
    CASE
      WHEN slug = 'last-minute-exam-prep-guide-llb-first-semester-tg'
        THEN 'last-minute-exam-prep-guide-llb-first-semester-tg-physical-book'
      ELSE 'last-minute-exam-prep-guide-llb-first-semester-ap-physical-book'
    END AS slug,
    title,
    description,
    image_url,
    featured,
    author_name,
    tags,
    metadata
  FROM catalog_items
  WHERE slug IN (
    'last-minute-exam-prep-guide-llb-first-semester-tg',
    'last-minute-exam-prep-guide-llb-first-semester-ap'
  )
) AS src
ON CONFLICT (slug) DO UPDATE
SET
  type = EXCLUDED.type,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  author_name = EXCLUDED.author_name,
  category = EXCLUDED.category,
  stock_quantity = EXCLUDED.stock_quantity,
  tags = EXCLUDED.tags,
  curriculum = EXCLUDED.curriculum,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

INSERT INTO catalog_items (
  slug,
  type,
  title,
  description,
  image_url,
  price,
  currency,
  status,
  featured,
  instructor_name,
  category,
  duration_label,
  duration_minutes,
  scheduled_at,
  meeting_url,
  spots_total,
  spots_remaining,
  tags,
  curriculum,
  metadata
)
VALUES (
  'law-of-contracts-i-live-revision-class',
  'live_class',
  'Law of Contracts - I Live Revision Class',
  'Google Meet live revision class for OU Semester-1 Law of Contracts - I learners.',
  '/images/logo.png',
  499,
  'INR',
  'published',
  TRUE,
  'Kantri Lawyer',
  'Live Classes',
  '2 hours',
  120,
  NOW() + INTERVAL '14 days',
  'https://meet.google.com/kantri-lawyer-demo',
  100,
  100,
  ARRAY['OU Semester-1', 'Live Revision'],
  jsonb_build_array(
    jsonb_build_object('title', 'Contract formation recap', 'duration', '30 min'),
    jsonb_build_object('title', 'Free consent and void agreements', 'duration', '30 min'),
    jsonb_build_object('title', 'Discharge and remedies', 'duration', '30 min'),
    jsonb_build_object('title', 'Specific Relief Act Q&A', 'duration', '30 min')
  ),
  jsonb_build_object(
    'meetingProvider', 'google_meet',
    'liveClassStatus', 'scheduled',
    'joinWindowMinutes', 30,
    'registeredEmailRequired', TRUE
  )
)
ON CONFLICT (slug) DO UPDATE
SET
  type = EXCLUDED.type,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  instructor_name = EXCLUDED.instructor_name,
  category = EXCLUDED.category,
  duration_label = EXCLUDED.duration_label,
  duration_minutes = EXCLUDED.duration_minutes,
  scheduled_at = EXCLUDED.scheduled_at,
  meeting_url = EXCLUDED.meeting_url,
  spots_total = EXCLUDED.spots_total,
  spots_remaining = EXCLUDED.spots_remaining,
  tags = EXCLUDED.tags,
  curriculum = EXCLUDED.curriculum,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

INSERT INTO catalog_items (
  slug,
  type,
  title,
  description,
  image_url,
  price,
  currency,
  status,
  featured,
  instructor_name,
  category,
  duration_label,
  time_limit_minutes,
  question_count,
  attempts_allowed,
  passing_score,
  tags,
  metadata
)
VALUES (
  'law-of-contracts-i-practice-exam',
  'practice_exam',
  'Law of Contracts - I Practice Exam',
  'Timed practice exam for OU Semester-1 Law of Contracts - I revision.',
  '/images/logo.png',
  149,
  'INR',
  'published',
  TRUE,
  'Kantri Lawyer',
  'Practice Exams',
  '30 minutes',
  30,
  3,
  3,
  60,
  ARRAY['OU Semester-1', 'Practice Exam'],
  jsonb_build_object(
    'stateName', 'Telangana',
    'universityName', 'Osmania University',
    'semesterLabel', 'Semester I',
    'examMode', 'timed_secure',
    'certificateEnabled', TRUE,
    'resultEmailEnabled', TRUE,
    'security', jsonb_build_object('disableRightClick', TRUE, 'blockDevtoolsShortcuts', TRUE, 'hideCorrectAnswers', TRUE)
  )
)
ON CONFLICT (slug) DO UPDATE
SET
  type = EXCLUDED.type,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  instructor_name = EXCLUDED.instructor_name,
  category = EXCLUDED.category,
  duration_label = EXCLUDED.duration_label,
  time_limit_minutes = EXCLUDED.time_limit_minutes,
  question_count = EXCLUDED.question_count,
  attempts_allowed = EXCLUDED.attempts_allowed,
  passing_score = EXCLUDED.passing_score,
  tags = EXCLUDED.tags,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

DELETE FROM practice_exam_questions
WHERE exam_item_id = (
  SELECT id FROM catalog_items WHERE slug = 'law-of-contracts-i-practice-exam'
);

INSERT INTO practice_exam_questions (
  exam_item_id,
  question_type,
  prompt,
  image_url,
  options,
  correct_answers,
  points,
  position
)
SELECT
  ci.id,
  v.question_type,
  v.prompt,
  NULL,
  v.options::jsonb,
  v.correct_answers::jsonb,
  v.points,
  v.position
FROM catalog_items ci
JOIN (
  VALUES
    (
      'single_select',
      'Which element is essential for a valid contract?',
      '[{"id":"a","text":"Offer and acceptance","imageUrl":null},{"id":"b","text":"A social invitation only","imageUrl":null},{"id":"c","text":"An agreement to do an illegal act","imageUrl":null},{"id":"d","text":"No consideration in every case","imageUrl":null}]',
      '["a"]',
      1,
      1
    ),
    (
      'multiple_choice',
      'Select TWO topics covered in Law of Contracts - I.',
      '[{"id":"a","text":"Doctrine of Privity of Contract","imageUrl":null},{"id":"b","text":"Quantum Meruit","imageUrl":null},{"id":"c","text":"Company share buyback procedure","imageUrl":null},{"id":"d","text":"Trademark opposition filing","imageUrl":null}]',
      '["a","b"]',
      2,
      2
    ),
    (
      'fill_blank',
      'Fill in the blank: Discharge by impossibility of performance is also known as the Doctrine of __________.',
      '[]',
      '["frustration","doctrine of frustration"]',
      1,
      3
    )
) AS v(question_type, prompt, options, correct_answers, points, position)
  ON ci.slug = 'law-of-contracts-i-practice-exam';

INSERT INTO catalog_items (
  slug,
  type,
  title,
  description,
  image_url,
  price,
  currency,
  status,
  featured,
  instructor_name,
  author_name,
  category,
  tags,
  curriculum,
  metadata
)
VALUES (
  'law-of-contracts-i-study-article',
  'article',
  'Law of Contracts - I Study Article',
  'Read-only article covering how to approach OU Semester-1 Law of Contracts - I revision.',
  '/images/logo.png',
  0,
  'INR',
  'published',
  TRUE,
  'Kantri Lawyer',
  'Kantri Lawyer',
  'Articles',
  ARRAY['Read Only', 'OU Semester-1'],
  '[]'::jsonb,
  jsonb_build_object(
    'content', 'Use the Law of Contracts - I syllabus unit by unit. Start with offer, acceptance, consideration, capacity, free consent, discharge, quasi-contracts, remedies, and the Specific Relief Act. This article is read only and does not allow comments or discussion.',
    'videoLinks', jsonb_build_array('https://www.youtube.com/watch?v=dD9mgeTm5vQ&list=PLvCHZZv1IA1ko1XwmGJxoGyFn1kQdFRaL'),
    'publishedAt', NOW()
  )
)
ON CONFLICT (slug) DO UPDATE
SET
  type = EXCLUDED.type,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  instructor_name = EXCLUDED.instructor_name,
  author_name = EXCLUDED.author_name,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  curriculum = EXCLUDED.curriculum,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

INSERT INTO delivery_serviceability (pin_code, city, state, carrier, estimated_days, is_active, notes)
VALUES
  ('500072', 'Kukatpally', 'Telangana', 'DTDC', 4, TRUE, 'Kantri Lawyer operating location'),
  ('500081', 'Hyderabad', 'Telangana', 'DTDC', 4, TRUE, 'Hyderabad route')
ON CONFLICT (pin_code) DO UPDATE
SET
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  carrier = EXCLUDED.carrier,
  estimated_days = EXCLUDED.estimated_days,
  is_active = EXCLUDED.is_active,
  notes = EXCLUDED.notes;
