'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight, MapPin, Calendar, Loader2, Ticket } from 'lucide-react';
import TeamLogo from '@/components/shared/TeamLogo';
import TicketCard from '@/components/game/TicketCard';
import ShareButton from '@/components/game/ShareButton';
import { formatEventDate, formatEventTime } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/client';
import type { Event, ListingWithSeller } from '@/lib/types/database';

export default function GameDetailsPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [listings, setListings] = useState<ListingWithSeller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const { data: eventData } = await supabase
          .from('events')
          .select('*')
          .eq('id', gameId)
          .single();

        if (eventData) {
          setEvent(eventData);
          const { data: listingsData } = await supabase
            .from('listings')
            .select('*, profiles(name, phone, whatsapp)')
            .eq('event_id', gameId)
            .eq('status', 'active')
            .order('price', { ascending: true });
          setListings(listingsData || []);
        }
      } catch (err) {
        console.error('Failed to fetch game:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [gameId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-brand animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="px-4 pt-4 text-center py-20">
        <p className="text-gray-500">האירוע לא נמצא</p>
        <Link href="/games" className="text-brand font-medium mt-4 inline-block">חזרה למשחקים</Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <ShareButton
          title={`${event.home_team} VS ${event.away_team}`}
          text={`כרטיסים ל${event.home_team} נגד ${event.away_team} - ${formatEventDate(event.date)} ב${event.stadium}`}
        />
        <h1 className="text-base font-bold">פרטי המשחק</h1>
        <Link href="/games" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <ArrowRight size={16} className="text-gray-500" />
        </Link>
      </div>

      {/* Hero */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          {/* Home team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamLogo teamName={event.home_team} size={64} />
            <span className="text-xs font-semibold text-center">{event.home_team}</span>
            <span className="text-[10px] text-green-600 font-medium">(בית)</span>
          </div>

          {/* VS + time */}
          <div className="flex flex-col items-center gap-1 px-2">
            <span className="text-xs font-semibold text-gray-400">VS</span>
            <span className="text-base font-bold">{formatEventTime(event.time)}</span>
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamLogo teamName={event.away_team} size={64} />
            <span className="text-xs font-semibold text-center">{event.away_team}</span>
            <span className="text-[10px] text-gray-400 font-medium">(חוץ)</span>
          </div>
        </div>

        {/* Date + location */}
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-brand" />
            <span>{event.stadium}, {event.city}</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-brand" />
            <span>{formatEventDate(event.date)}</span>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400">ממוין לפי המחיר הנמוך</span>
          <h2 className="text-base font-bold">כרטיסים זמינים ({listings.length})</h2>
        </div>

        {listings.length > 0 ? (
          <div className="space-y-3">
            {listings
              .sort((a, b) => a.price - b.price)
              .map((listing) => (
                <TicketCard
                  key={listing.id}
                  listing={listing}
                  homeTeam={event.home_team}
                  awayTeam={event.away_team}
                />
              ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <Ticket size={48} className="text-gray-300 mx-auto" />
            <p className="text-gray-400 mt-2">אין כרטיסים זמינים כרגע</p>
            <Link href="/sell" className="text-brand font-medium text-sm mt-2 inline-block">
              רוצה למכור כרטיס? לחץ כאן
            </Link>
          </div>
        )}
      </div>

      <div className="h-4" />
    </div>
  );
}
