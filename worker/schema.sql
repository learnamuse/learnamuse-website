-- Optional D1 archive for contact messages (binding "DB").
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  received_at TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  wants_collaboration INTEGER NOT NULL DEFAULT 0,
  origin TEXT
);
CREATE INDEX IF NOT EXISTS idx_contact_messages_received_at ON contact_messages (received_at);
