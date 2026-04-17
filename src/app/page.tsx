'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { User, ShieldCheck, Banknote, Headphones, ArrowLeft, Loader2 } from 'lucide-react';
import GameCard from '@/components/game/GameCard';
import SiteLogo from '@/components/shared/SiteLogo';
import { createClient } from '@/lib/supabase/client';
import { posthog } from '@/lib/posthog';
import { logError } from '@/lib/logger';
import type { EventWithStats } from '@/lib/types/database';

export default function HomePage() {
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const supabase = createClient();
      const today = new Date().toISOString().split('T')[0];
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(10);

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
      }
    } catch (err) {
      logError('home.fetchEvents', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    posthog.capture('home_viewed');
  }, [fetchEvents]);

  const heroEvent = events[0];
  const upcomingEvents = events.slice(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-row-reverse">
        <Link href="/" className="flex items-center gap-1.5">
          <SiteLogo />
          <span className="text-xl font-bold text-brand">TicketIL</span>
        </Link>
        <Link href="/profile" className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
          <User size={20} className="text-slate-400" />
        </Link>
      </div>

      {/* Hero Event */}
      {heroEvent && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <Link href="/games" className="text-xs font-medium text-brand">ללוח המשחקים</Link>
            <h2 className="text-lg font-bold">המשחק הבא</h2>
          </div>
          <GameCard event={heroEvent} />
        </div>
      )}

      {/* Trust Section */}
      <div className="flex items-center justify-around bg-slate-100 rounded-2xl p-4">
        <div className="flex flex-col items-center">
          <ShieldCheck size={24} className="text-brand" />
          <span className="text-[10px] font-medium text-slate-600 mt-1">כרטיסים מאומתים</span>
        </div>
        <div className="w-px h-8 bg-gray-300" />
        <div className="flex flex-col items-center">
          <Banknote size={24} className="text-brand" />
          <span className="text-[10px] font-medium text-slate-600 mt-1">ללא עמלות</span>
        </div>
        <div className="w-px h-8 bg-gray-300" />
        <div className="flex flex-col items-center">
          <Headphones size={24} className="text-brand" />
          <span className="text-[10px] font-medium text-slate-600 mt-1">תמיכה 24/7</span>
        </div>
      </div>

      {/* All Games CTA */}
      <Link
        href="/games"
        className="flex items-center justify-center gap-2 bg-brand text-white font-bold py-4 rounded-2xl hover:bg-brand-dark transition-colors"
      >
        <span className="text-base">כל המשחקים</span>
        <ArrowLeft size={20} />
      </Link>

      {/* Upcoming */}
      {upcomingEvents.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-right mb-3">משחקים קרובים</h2>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <GameCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <SiteLogo size={64} />
          <p className="text-xl font-bold">אין אירועים כרגע</p>
          <p className="text-sm text-slate-500">אירועים חדשים יתווספו בקרוב!</p>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
