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
  price INTEGER NOT NULL CHECK (price > 0),
  section TEXT,
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
