-- Add external_id to events for dedupe with scraper source
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS external_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_events_external_id
  ON events(external_id)
  WHERE external_id IS NOT NULL;
