export interface Event {
  id: string;
  home_team: string;
  away_team: string;
  date: string;
  time: string;
  stadium: string;
  city: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  created_at?: string;
}

export interface EventWithStats extends Event {
  listing_count: number;
  min_price: number | null;
}

export interface Listing {
  id: string;
  event_id: string;
  seller_id: string;
  price: number;
  section: string | null;
  row_number: string | null;
  seat_number: string | null;
  quantity: number;
  notes: string | null;
  status: 'active' | 'sold' | 'removed';
  created_at?: string;
}

export interface Profile {
  id: string;
  name: string | null;
  phone: string;
  whatsapp?: string | null;
}

export interface ListingWithSeller extends Listing {
  profiles: {
    name: string | null;
    phone: string;
    whatsapp: string | null;
  } | null;
}
