-- Demo accounts (password for both: demo12345)
-- bcrypt hash: rounds 10, precomputed in repo for reproducible seeds

INSERT INTO users (email, password_hash, name)
VALUES (
  'demo@learnhub.local',
  '$2a$10$U90AGkWOvfMSlHXO8d6.N.FAOBWLM1QNvDHR1v0qhA9J8Gs7zDpLC',
  'Demo Learner'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password_hash, name)
VALUES (
  'admin@learnhub.local',
  '$2a$10$U90AGkWOvfMSlHXO8d6.N.FAOBWLM1QNvDHR1v0qhA9J8Gs7zDpLC',
  'Admin User'
)
ON CONFLICT (email) DO NOTHING;
