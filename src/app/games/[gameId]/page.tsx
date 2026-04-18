'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Loader2, Ticket } from 'lucide-react';
import TeamLogo from '@/components/shared/TeamLogo';
import TicketCard from '@/components/game/TicketCard';
import ShareButton from '@/components/game/ShareButton';
import { formatEventDate, formatEventTime } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/client';
import { posthog } from '@/lib/posthog';
import { logError } from '@/lib/logger';
import { SECTION_OPTIONS } from '@/lib/constants/stands';
import { cn } from '@/lib/utils/cn';
import type { Event, ListingWithSeller } from '@/lib/types/database';

export default function GameDetailsPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [listings, setListings] = useState<ListingWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

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
          posthog.capture('game_detail_viewed', {
            game_id: gameId,
            home_team: eventData.home_team,
            away_team: eventData.away_team,
          });
          const { data: listingsData } = await supabase
            .from('listings')
            .select('*, profiles(name, phone, whatsapp)')
            .eq('event_id', gameId)
            .eq('status', 'active')
            .order('price', { ascending: true });
          setListings(listingsData || []);
        }
      } catch (err) {
        logError('game.fetchData', err, { gameId });
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
        <p className="text-slate-500">האירוע לא נמצא</p>
        <Link href="/games" className="text-brand font-medium mt-4 inline-block">חזרה למשחקים</Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/games" className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center">
          <ArrowLeft size={20} className="text-brand" />
        </Link>
        <h1 className="text-base font-bold flex-1 text-center">פרטי המשחק</h1>
        <ShareButton
          title={`${event.home_team} VS ${event.away_team}`}
          text={`כרטיסים ל${event.home_team} נגד ${event.away_team} - ${formatEventDate(event.date, event.date_tbd)} ב${event.stadium}`}
        />
      </div>

      {/* Hero */}
      <div>
        {/* Teams */}
        <div className="px-2 pt-4 pb-3">
          <div className="flex items-center justify-between">
            {/* Away team */}
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <TeamLogo teamName={event.away_team} size={56} />
              <span className="text-sm font-bold text-center leading-tight">{event.away_team}</span>
              <span className="text-[10px] text-slate-400 font-semibold">(חוץ)</span>
            </div>

            {/* VS + Time */}
            <div className="flex flex-col items-center gap-1 px-3">
              <span className="text-xs font-bold text-slate-300">VS</span>
              <span className="text-2xl font-medium text-gray-900">{formatEventTime(event.time, event.time_tbd)}</span>
            </div>

            {/* Home team */}
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <TeamLogo teamName={event.home_team} size={56} />
              <span className="text-sm font-bold text-center leading-tight">{event.home_team}</span>
              <span className="text-[10px] text-green-600 font-semibold">(בית)</span>
            </div>
          </div>
        </div>

        {/* Info Bar */}
        <div className="px-2 py-2 flex items-center text-[13px] text-slate-500">
          <div className="flex-1 flex items-center justify-center gap-1.5">
            <Calendar size={14} className="text-brand" />
            <span className="font-medium">{formatEventDate(event.date, event.date_tbd)}</span>
          </div>
          <div className="w-px h-4 bg-gray-300" />
          <div className="flex-1 flex items-center justify-center gap-1.5">
            <MapPin size={14} className="text-brand" />
            <span className="font-medium">{event.stadium}, {event.city}</span>
          </div>
        </div>

        {/* Section Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-1 py-2 flex-row-reverse">
          <button
            onClick={() => {
              setSelectedSection(null);
              posthog.capture('section_filter_clicked', { section: 'all' });
            }}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors',
              selectedSection === null
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-slate-600 border-slate-200'
            )}
          >
            הכל
          </button>
          {[...SECTION_OPTIONS].reverse().map((opt) => (
            <button
              key={opt}
              onClick={() => {
                const newSection = selectedSection === opt ? null : opt;
                setSelectedSection(newSection);
                posthog.capture('section_filter_clicked', { section: newSection || 'all' });
              }}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors',
                selectedSection === opt
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-slate-600 border-slate-200'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] text-slate-400">מהמחיר הנמוך לגבוה</span>
          <h2 className="text-sm font-bold">כרטיסים זמינים ({selectedSection ? listings.filter(l => l.section === selectedSection).length : listings.length})</h2>
        </div>

        {listings.length > 0 ? (
          <div className="space-y-3">
            {listings
              .filter((l) => !selectedSection || l.section === selectedSection)
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
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm">
            <Ticket size={44} className="text-gray-200 mx-auto" />
            <p className="text-sm text-slate-400 mt-3">אין כרטיסים זמינים כרגע</p>
            <Link
              href="/sell"
              className="inline-block bg-brand text-white text-sm font-bold px-6 py-2.5 rounded-xl mt-4 hover:bg-brand-dark transition-colors"
            >
              פרסם כרטיס למכירה
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
