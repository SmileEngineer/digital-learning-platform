UPDATE catalog_items
SET
  author_name = COALESCE(author_name, 'LearnHub Editorial Team'),
  preview_enabled = TRUE,
  preview_count = CASE
    WHEN preview_count > 0 THEN preview_count
    ELSE 5
  END,
  download_enabled = CASE
    WHEN slug IN ('modern-javascript-guide', 'ui-ux-design-playbook') THEN TRUE
    ELSE download_enabled
  END,
  metadata = COALESCE(metadata, '{}'::jsonb)
    || jsonb_build_object(
      'downloadConfirmationMessage',
      COALESCE(metadata->>'downloadConfirmationMessage', 'This eBook will be exported with your contact watermark on every page. Continue?'),
      'readerProtection',
      jsonb_build_object(
        'disableRightClick', TRUE,
        'blockDevtoolsShortcuts', TRUE,
        'singleDeviceNotice', TRUE
      ),
      'pageContents',
      COALESCE(
        metadata->'pageContents',
        CASE slug
          WHEN 'modern-javascript-guide' THEN jsonb_build_array(
            jsonb_build_object('title', 'JavaScript Now', 'body', 'Understand variables, functions, closures, and ES6 modules with practical examples.', 'imageUrl', image_url),
            jsonb_build_object('title', 'Async Patterns', 'body', 'Promises, async/await, and resilient API handling for modern web applications.', 'imageUrl', image_url),
            jsonb_build_object('title', 'UI Architecture', 'body', 'Component composition, state management, and accessible frontend structure.'),
            jsonb_build_object('title', 'Performance', 'body', 'Code splitting, memoization, and rendering optimization strategies.'),
            jsonb_build_object('title', 'Deployment', 'body', 'Bundle, ship, and monitor production JavaScript applications confidently.')
          )
          WHEN 'python-for-data-analysis' THEN jsonb_build_array(
            jsonb_build_object('title', 'Data Loading', 'body', 'Import CSV, Excel, and JSON sources into pandas-ready workflows.', 'imageUrl', image_url),
            jsonb_build_object('title', 'Data Cleaning', 'body', 'Handle missing values, normalize columns, and standardize datasets.'),
            jsonb_build_object('title', 'Exploration', 'body', 'Group, aggregate, and visualize trends before modeling.'),
            jsonb_build_object('title', 'Feature Prep', 'body', 'Engineer columns and prepare clean data for machine learning.'),
            jsonb_build_object('title', 'Reporting', 'body', 'Summarize findings into dashboard-ready narratives for stakeholders.')
          )
          WHEN 'ui-ux-design-playbook' THEN jsonb_build_array(
            jsonb_build_object('title', 'User Flows', 'body', 'Turn product requirements into low-friction user journeys.', 'imageUrl', image_url),
            jsonb_build_object('title', 'Wireframes', 'body', 'Sketch quick layouts that support information hierarchy and usability.'),
            jsonb_build_object('title', 'Design Systems', 'body', 'Build reusable tokens, components, and states that scale.'),
            jsonb_build_object('title', 'Usability Reviews', 'body', 'Spot friction points early with repeatable review checklists.'),
            jsonb_build_object('title', 'Handoff', 'body', 'Package designs, annotations, and assets for implementation teams.')
          )
          ELSE jsonb_build_array(
            jsonb_build_object('title', 'Preview Page 1', 'body', description, 'imageUrl', image_url),
            jsonb_build_object('title', 'Preview Page 2', 'body', description),
            jsonb_build_object('title', 'Preview Page 3', 'body', description)
          )
        END
      )
    ),
  pages = COALESCE(pages, 5)
WHERE type = 'ebook';
