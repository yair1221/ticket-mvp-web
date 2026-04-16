-- ============================================
-- TicketIL - Supabase Database Setup
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================

-- 1. PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  phone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  stadium TEXT NOT NULL,
  city TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- 3. LISTINGS TABLE
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 1 AND price <= 5000),
  section TEXT NOT NULL,
  row_number TEXT,
  seat_number TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listings_event ON listings(event_id);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);

-- מניעת כרטיס כפול (אותו מוכר, אותו אירוע, אותו מקום)
CREATE UNIQUE INDEX IF NOT EXISTS idx_listings_unique_seat
ON listings(event_id, seller_id, section, COALESCE(row_number, ''), COALESCE(seat_number, ''))
WHERE status = 'active';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read_all" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- EVENTS (read-only for everyone, admin manages via dashboard)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_read_all" ON events
  FOR SELECT USING (true);

-- LISTINGS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listings_read_active" ON listings
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "listings_insert_own" ON listings
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "listings_update_own" ON listings
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "listings_delete_own" ON listings
  FOR DELETE USING (auth.uid() = seller_id);

-- ============================================
-- BUSINESS LOGIC - TRIGGERS
-- ============================================

-- וולידציה לפני יצירת listing
CREATE OR REPLACE FUNCTION validate_listing()
RETURNS TRIGGER AS $$
BEGIN
  -- בדיקה שהאירוע פעיל
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

-- סגירת כרטיסים אוטומטית כשאירוע נגמר/מבוטל
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

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, phone)
  VALUES (NEW.id, COALESCE(NEW.phone, ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SEED DATA - Israeli Premier League Games
-- ============================================

INSERT INTO events (home_team, away_team, date, time, stadium, city, status) VALUES
  ('מכבי תל אביב', 'הפועל באר שבע', '2026-04-18', '20:00', 'אצטדיון בלומפילד', 'תל אביב', 'upcoming'),
  ('מכבי חיפה', 'בית"ר ירושלים', '2026-04-19', '19:30', 'אצטדיון סמי עופר', 'חיפה', 'upcoming'),
  ('הפועל תל אביב', 'מכבי נתניה', '2026-04-20', '20:15', 'אצטדיון בלומפילד', 'תל אביב', 'upcoming'),
  ('הפועל חיפה', 'בני סחנין', '2026-04-25', '19:00', 'אצטדיון סמי עופר', 'חיפה', 'upcoming'),
  ('בית"ר ירושלים', 'מכבי תל אביב', '2026-04-26', '20:30', 'אצטדיון טדי', 'ירושלים', 'upcoming'),
  ('מ.ס. אשדוד', 'הפועל ירושלים', '2026-05-02', '19:00', 'אצטדיון י"א אשדוד', 'אשדוד', 'upcoming'),
  ('הפועל באר שבע', 'מכבי חיפה', '2026-05-03', '20:00', 'אצטדיון טרנר', 'באר שבע', 'upcoming'),
  ('בני סחנין', 'עירוני טבריה', '2026-05-09', '19:00', 'אצטדיון דוחא', 'סחנין', 'upcoming'),
  ('מכבי נתניה', 'הפועל חיפה', '2026-05-10', '20:00', 'אצטדיון נתניה', 'נתניה', 'upcoming'),
  ('הפועל ירושלים', 'הפועל תל אביב', '2026-05-16', '19:30', 'אצטדיון טדי', 'ירושלים', 'upcoming'),
  ('מכבי בני ריינה', 'מכבי תל אביב', '2026-05-17', '20:00', 'אצטדיון דוחא', 'בני ריינה', 'upcoming'),
  ('הפועל קריית שמונה', 'מ.ס. אשדוד', '2026-05-23', '19:00', 'אצטדיון קריית שמונה', 'קריית שמונה', 'upcoming'),
  ('הפועל פתח תקווה', 'בני סחנין', '2026-05-24', '20:00', 'אצטדיון המושבה', 'פתח תקווה', 'upcoming'),
  ('מכבי תל אביב', 'מכבי חיפה', '2026-05-30', '20:30', 'אצטדיון בלומפילד', 'תל אביב', 'upcoming');
