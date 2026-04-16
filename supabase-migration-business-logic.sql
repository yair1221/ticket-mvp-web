-- ============================================
-- TicketIL - Business Logic Migration
-- Run this in Supabase SQL Editor AFTER the initial setup
-- ============================================

-- ============================================
-- 1. CONSTRAINTS - וולידציות בצד שרת
-- ============================================

-- מחיר: מינימום 1₪, מקסימום 5000₪
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_price_check;
ALTER TABLE listings ADD CONSTRAINT listings_price_check CHECK (price >= 1 AND price <= 5000);

-- section חובה
ALTER TABLE listings ALTER COLUMN section SET NOT NULL;

-- מניעת כרטיס כפול (אותו מוכר, אותו אירוע, אותו מקום)
CREATE UNIQUE INDEX IF NOT EXISTS idx_listings_unique_seat
ON listings(event_id, seller_id, section, COALESCE(row_number, ''), COALESCE(seat_number, ''))
WHERE status = 'active';

-- ============================================
-- 2. TRIGGER - וולידציה לפני יצירת listing
-- ============================================

CREATE OR REPLACE FUNCTION validate_listing()
RETURNS TRIGGER AS $$
BEGIN
  -- בדיקה שהאירוע פעיל (upcoming)
  IF NOT EXISTS (
    SELECT 1 FROM events WHERE id = NEW.event_id AND status = 'upcoming'
  ) THEN
    RAISE EXCEPTION 'ניתן לפרסם כרטיסים רק למשחקים פעילים';
  END IF;

  -- הגבלת מקסימום 10 כרטיסים פעילים למשתמש
  IF (
    SELECT COUNT(*) FROM listings
    WHERE seller_id = NEW.seller_id AND status = 'active'
  ) >= 10 THEN
    RAISE EXCEPTION 'ניתן לפרסם עד 10 כרטיסים פעילים';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS validate_listing_before_insert ON listings;
CREATE TRIGGER validate_listing_before_insert
  BEFORE INSERT ON listings
  FOR EACH ROW EXECUTE FUNCTION validate_listing();

-- ============================================
-- 3. TRIGGER - סגירת כרטיסים אוטומטית
--    כשאירוע עובר ל-completed/cancelled
-- ============================================

CREATE OR REPLACE FUNCTION auto_close_listings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('completed', 'cancelled') AND OLD.status = 'upcoming' THEN
    UPDATE listings
    SET status = 'removed'
    WHERE event_id = NEW.id AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS auto_close_listings_on_event_change ON events;
CREATE TRIGGER auto_close_listings_on_event_change
  AFTER UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION auto_close_listings();
