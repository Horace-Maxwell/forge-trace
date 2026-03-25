CREATE TABLE IF NOT EXISTS ingested_sessions (
  share_id TEXT PRIMARY KEY,
  session_id TEXT,
  source TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
