'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { User, Loader2, ArrowUpDown, X } from 'lucide-react';
import GameCard from '@/components/game/GameCard';
import TeamFilter from '@/components/game/TeamFilter';
import { createClient } from '@/lib/supabase/client';
import type { EventWithStats } from '@/lib/types/database';

type SortOption = 'default' | 'date' | 'price';

export default function GamesPage() {
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSortModal, setShowSortModal] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const supabase = createClient();
      const today = new Date().toISOString().split('T')[0];
      let query = supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .gte('date', today)
        .order('date', { ascending: true });

      if (selectedTeam) {
        query = query.or(`home_team.eq.${selectedTeam},away_team.eq.${selectedTeam}`);
      }

      const { data: events } = await query;

      if (events && events.length > 0) {
        const eventIds = events.map((e: { id: string }) => e.id);
        const { data: listings } = await supabase
          .from('listings')
          .select('event_id, price')
          .eq('status', 'active')
          .in('event_id', eventIds);

        const statsMap = new Map<string, { count: number; min: number | null }>();
        (listings || []).forEach((l: { event_id: string; price: number }) => {
          const curr = statsMap.get(l.event_id) || { count: 0, min: null as number | null };
          curr.count++;
          curr.min = curr.min === null ? l.price : Math.min(curr.min, l.price);
          statsMap.set(l.event_id, curr);
        });

        const eventsWithStats: EventWithStats[] = events.map((e: EventWithStats) => ({
          ...e,
          listing_count: statsMap.get(e.id)?.count || 0,
          min_price: statsMap.get(e.id)?.min ?? null,
        }));
        setEvents(eventsWithStats);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTeam]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const sortedEvents =
    sortBy === 'default'
      ? events
      : [...events].sort((a, b) => {
          if (sortBy === 'price') {
            if (a.min_price === null) return 1;
            if (b.min_price === null) return -1;
            return a.min_price - b.min_price;
          }
          return a.date.localeCompare(b.date);
        });

  return (
    <div className="pt-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <Link href="/profile" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <User size={20} className="text-gray-400" />
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-bold text-brand">TicketIL</span>
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center">
            <span className="text-white text-sm">⚽</span>
          </div>
        </div>
      </div>

      {/* Team Filter */}
      <div className="px-4">
        <TeamFilter selectedTeam={selectedTeam} onSelect={setSelectedTeam} />
      </div>

      {/* Results count + sort */}
      <div className="flex items-center justify-between px-4 relative" style={{ zIndex: 10 }}>
        <button
          onClick={() => setShowSortModal(!showSortModal)}
          className="flex items-center gap-1 text-xs text-brand font-medium"
        >
          <ArrowUpDown size={14} />
          <span>{sortBy === 'default' ? 'מיון' : sortBy === 'date' ? 'תאריך' : 'מחיר'}</span>
        </button>
        <h2 className="text-[15px] font-bold text-gray-600">נמצאו {sortedEvents.length} משחקים</h2>

        {/* Sort Dropdown */}
        {showSortModal && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowSortModal(false)} />
            <div className="absolute top-8 left-0 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[200px] z-20">
              {([
                { key: 'default' as const, label: 'הכל' },
                { key: 'price' as const, label: 'מחיר (מהנמוך לגבוה)' },
                { key: 'date' as const, label: 'תאריך' },
              ]).map((option) => (
                <button
                  key={option.key}
                  className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setSortBy(option.key);
                    setShowSortModal(false);
                  }}
                >
                  <span className={`text-sm ${sortBy === option.key ? 'text-brand font-semibold' : 'text-gray-700'}`}>
                    {option.label}
                  </span>
                  {sortBy === option.key && <span className="text-brand">✓</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Game List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={32} className="text-brand animate-spin" />
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {sortedEvents.map((event) => (
            <GameCard key={event.id} event={event} />
          ))}

          {sortedEvents.length === 0 && (
            <div className="flex flex-col items-center py-12">
              <X size={48} className="text-gray-300" />
              <p className="text-sm text-gray-500 mt-2">אין משחקים להצגה</p>
            </div>
          )}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
