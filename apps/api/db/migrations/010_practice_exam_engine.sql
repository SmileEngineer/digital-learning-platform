CREATE TABLE IF NOT EXISTS practice_exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_item_id UUID NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'single_select', 'fill_blank')),
  prompt TEXT NOT NULL,
  image_url TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  points INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (exam_item_id, position)
);

CREATE INDEX IF NOT EXISTS idx_practice_exam_questions_exam_item_id
  ON practice_exam_questions (exam_item_id, position);

CREATE TABLE IF NOT EXISTS practice_exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_item_id UUID NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'submitted', 'auto_submitted')),
  score INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  passing_score INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_summary JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_practice_exam_attempts_exam_user
  ON practice_exam_attempts (exam_item_id, user_id, started_at DESC);

DELETE FROM practice_exam_questions
WHERE exam_item_id IN (
  SELECT id
  FROM catalog_items
  WHERE slug IN ('aws-solutions-architect-practice-exam', 'full-stack-developer-practice-exam')
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
  q.question_type,
  q.prompt,
  q.image_url,
  q.options::jsonb,
  q.correct_answers::jsonb,
  q.points,
  q.position
FROM catalog_items ci
JOIN (
  VALUES
    (
      'aws-solutions-architect-practice-exam',
      'single_select',
      'Which AWS service is best suited for storing and serving static website assets at scale?',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      '[{"id":"a","text":"Amazon RDS","imageUrl":null},{"id":"b","text":"Amazon S3","imageUrl":null},{"id":"c","text":"Amazon DynamoDB","imageUrl":null},{"id":"d","text":"Amazon EMR","imageUrl":null}]',
      '["b"]',
      1,
      1
    ),
    (
      'aws-solutions-architect-practice-exam',
      'multiple_choice',
      'Select TWO AWS services commonly used together for CDN-backed static content delivery.',
      NULL,
      '[{"id":"a","text":"Amazon CloudFront","imageUrl":null},{"id":"b","text":"Amazon S3","imageUrl":null},{"id":"c","text":"Amazon Neptune","imageUrl":null},{"id":"d","text":"Amazon MQ","imageUrl":null}]',
      '["a","b"]',
      2,
      2
    ),
    (
      'aws-solutions-architect-practice-exam',
      'fill_blank',
      'Fill in the blank: AWS __________ lets you run code without provisioning servers.',
      NULL,
      '[]',
      '["lambda","aws lambda"]',
      1,
      3
    ),
    (
      'full-stack-developer-practice-exam',
      'single_select',
      'Which HTTP status code is most appropriate for a successful resource creation request?',
      NULL,
      '[{"id":"a","text":"200","imageUrl":null},{"id":"b","text":"201","imageUrl":null},{"id":"c","text":"204","imageUrl":null},{"id":"d","text":"304","imageUrl":null}]',
      '["b"]',
      1,
      1
    ),
    (
      'full-stack-developer-practice-exam',
      'multiple_choice',
      'Select the statements that are true about React state updates.',
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      '[{"id":"a","text":"State updates can be batched","imageUrl":null},{"id":"b","text":"Direct mutation is the recommended pattern","imageUrl":null},{"id":"c","text":"Functional updates help when next state depends on previous state","imageUrl":null},{"id":"d","text":"useState only works in class components","imageUrl":null}]',
      '["a","c"]',
      2,
      2
    ),
    (
      'full-stack-developer-practice-exam',
      'fill_blank',
      'Fill in the blank: In SQL, the __________ clause is used to filter aggregated results.',
      NULL,
      '[]',
      '["having"]',
      1,
      3
    )
) AS q(slug, question_type, prompt, image_url, options, correct_answers, points, position)
  ON q.slug = ci.slug
WHERE ci.type = 'practice_exam';

UPDATE catalog_items ci
SET
  question_count = question_totals.total_questions,
  metadata = COALESCE(ci.metadata, '{}'::jsonb)
    || jsonb_build_object(
      'examMode', 'timed_secure',
      'certificateEnabled', TRUE,
      'resultEmailEnabled', TRUE,
      'security', jsonb_build_object(
        'disableRightClick', TRUE,
        'blockDevtoolsShortcuts', TRUE,
        'hideCorrectAnswers', TRUE
      )
    )
FROM (
  SELECT exam_item_id, COUNT(*)::int AS total_questions
  FROM practice_exam_questions
  GROUP BY exam_item_id
) AS question_totals
WHERE ci.id = question_totals.exam_item_id;
