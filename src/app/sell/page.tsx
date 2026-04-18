'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tag, Loader2, Star, CheckCircle, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { posthog } from '@/lib/posthog';
import TeamFilter from '@/components/game/TeamFilter';
import TeamLogo from '@/components/shared/TeamLogo';
import { formatEventDate } from '@/lib/utils/format';
import { SECTION_OPTIONS } from '@/lib/constants/stands';
import { cn } from '@/lib/utils/cn';
import SiteLogo from '@/components/shared/SiteLogo';
import type { Event } from '@/lib/types/database';

const PENDING_LISTING_KEY = 'pending_listing';

interface PendingListing {
  eventId: string;
  price: string;
  section: string;
  rowNumber: string;
  seatNumber: string;
  notes: string;
}

export default function SellPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [section, setSection] = useState('');
  const [rowNumber, setRowNumber] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishedListingId, setPublishedListingId] = useState<string | null>(null);

  // טעינת אירועים - תמיד, גם בלי התחברות
  useEffect(() => {
    const fetchEvents = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });
      setEvents(data || []);
    };
    fetchEvents();
  }, []);

  // פרסום כרטיס ממתין אחרי התחברות
  const publishPendingListing = useCallback(async () => {
    const stored = sessionStorage.getItem(PENDING_LISTING_KEY);
    if (!stored || !user) return;

    const pending: PendingListing = JSON.parse(stored);
    sessionStorage.removeItem(PENDING_LISTING_KEY);

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from('listings').insert({
      event_id: pending.eventId,
      seller_id: user.id,
      price: parseInt(pending.price),
      section: pending.section,
      row_number: pending.rowNumber || null,
      seat_number: pending.seatNumber || null,
      quantity: 1,
      notes: pending.notes || null,
    }).select('id').single();

    setLoading(false);
    if (error) {
      posthog.capture('sell_form_error', { error: error.message, source: 'pending' });
      toast.error('שגיאה בפרסום הכרטיס: ' + error.message);
    } else {
      posthog.capture('sell_form_success', { listing_id: data.id, source: 'pending' });
      setPublishedListingId(data.id);
      setPublished(true);
    }
  }, [user]);

  useEffect(() => {
    if (user && !authLoading) {
      publishPendingListing();
    }
  }, [user, authLoading, publishPendingListing]);

  // שמירה ומעבר ללוגין, או פרסום ישיר
  const handleSubmit = async () => {
    if (!selectedEvent || !price || parseInt(price) < 1 || !section) return;
    posthog.capture('sell_form_submitted', {
      event_id: selectedEvent.id,
      home_team: selectedEvent.home_team,
      away_team: selectedEvent.away_team,
      price: parseInt(price),
      section,
    });

    if (!user) {
      const pending: PendingListing = {
        eventId: selectedEvent.id,
        price,
        section,
        rowNumber,
        seatNumber,
        notes,
      };
      sessionStorage.setItem(PENDING_LISTING_KEY, JSON.stringify(pending));
      router.push('/login');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from('listings').insert({
      event_id: selectedEvent.id,
      seller_id: user.id,
      price: parseInt(price),
      section,
      row_number: rowNumber || null,
      seat_number: seatNumber || null,
      quantity: 1,
      notes: notes || null,
    }).select('id').single();

    setLoading(false);
    if (error) {
      posthog.capture('sell_form_error', { error: error.message });
      toast.error('שגיאה בפרסום הכרטיס: ' + error.message);
    } else {
      posthog.capture('sell_form_success', { listing_id: data.id });
      setPublishedListingId(data.id);
      setPublished(true);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-brand animate-spin" />
      </div>
    );
  }

  // דף הצלחה
  if (published) {
    return (
      <div className="px-4 pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-9" />
          <h1 className="text-lg font-bold flex-1 text-center">פרסום כרטיס</h1>
          <Link href="/"><SiteLogo /></Link>
        </div>

        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={44} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold">הכרטיס פורסם בהצלחה!</h2>
          <p className="text-sm text-slate-500 text-center">הכרטיס שלך זמין כעת לקונים באתר</p>

          <Link
            href={publishedListingId ? '/my-listings' : '/my-listings'}
            className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors mt-4"
          >
            <Ticket size={18} />
            <span>צפה בכרטיסים שלי</span>
          </Link>

          <button
            onClick={() => {
              setPublished(false);
              setPublishedListingId(null);
              setSelectedEvent(null);
              setPrice('');
              setSection('');
              setRowNumber('');
              setSeatNumber('');
              setNotes('');
            }}
            className="w-full border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors hover:bg-slate-50"
          >
            <Tag size={18} />
            <span>פרסם כרטיס נוסף</span>
          </button>
        </div>
      </div>
    );
  }

  const filteredEvents = selectedTeam
    ? events.filter((e) => e.home_team === selectedTeam || e.away_team === selectedTeam)
    : events;

  return (
    <div className="px-4 pt-4 space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="w-9" />
        <h1 className="text-lg font-bold flex-1 text-center">פרסום כרטיס</h1>
        <Link href="/"><SiteLogo /></Link>
      </div>

      {/* Team Filter */}
      <TeamFilter selectedTeam={selectedTeam} onSelect={(t) => { setSelectedTeam(t); setSelectedEvent(null); setShowPicker(true); }} />

      {/* Event Selector */}
      <div>
        <label className="block text-xs font-medium text-right mb-2 pr-1">בחר משחק</label>
        {selectedEvent ? (
          <button
            onClick={() => { setSelectedEvent(null); setShowPicker(true); }}
            className="w-full bg-slate-50 rounded-2xl border border-slate-200 py-2 px-3 flex items-center justify-between flex-row-reverse"
          >
            <div className="flex flex-col items-center gap-0.5 flex-1">
              <TeamLogo teamName={selectedEvent.away_team} size={24} />
              <span className="text-[10px] font-semibold">{selectedEvent.away_team}</span>
            </div>
            <span className="text-xs font-bold">{formatEventDate(selectedEvent.date, selectedEvent.date_tbd)}</span>
            <div className="flex flex-col items-center gap-0.5 flex-1">
              <TeamLogo teamName={selectedEvent.home_team} size={24} />
              <span className="text-[10px] font-semibold">{selectedEvent.home_team}</span>
            </div>
          </button>
        ) : (
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-full border border-slate-200 rounded-xl p-3 text-right bg-white flex items-center justify-between"
          >
            <span className="text-sm text-slate-400">בחר משחק...</span>
            <span className="text-slate-300">▼</span>
          </button>
        )}

        {showPicker && !selectedEvent && (
          <div className="mt-2 max-h-[270px] overflow-y-auto space-y-1.5">
            {filteredEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => {
                  setSelectedEvent(event);
                  setShowPicker(false);
                  posthog.capture('sell_event_selected', {
                    event_id: event.id,
                    home_team: event.home_team,
                    away_team: event.away_team,
                  });
                }}
                className="w-full bg-slate-50 rounded-2xl border border-slate-200 py-2 px-3 flex items-center justify-between flex-row-reverse hover:bg-slate-100 transition-colors"
              >
                <div className="flex flex-col items-center gap-0.5 flex-1">
                  <TeamLogo teamName={event.away_team} size={24} />
                  <span className="text-[10px] font-semibold">{event.away_team}</span>
                    </div>
                <span className="text-xs font-bold">{formatEventDate(event.date, event.date_tbd)}</span>
                <div className="flex flex-col items-center gap-0.5 flex-1">
                  <TeamLogo teamName={event.home_team} size={24} />
                  <span className="text-[10px] font-semibold">{event.home_team}</span>
                    </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div>
        <label className="block text-xs font-medium text-right mb-2 pr-1">מחיר (₪)</label>
        <input
          type="text"
          inputMode="numeric"
          value={price}
          onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="0"
          className="w-full border border-slate-200 rounded-xl p-3 text-right bg-white"
        />
      </div>

      {/* Section selection */}
      <div>
        <label className="block text-xs font-medium text-right mb-2 pr-1">בחר יציע</label>
        <div className="flex flex-wrap gap-2 justify-end">
          {SECTION_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setSection(opt)}
              className={cn(
                'px-3.5 py-2.5 rounded-full text-[13px] font-medium border transition-colors flex items-center gap-1.5 flex-row-reverse',
                section === opt
                  ? 'bg-brand text-white border-brand'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-brand/50'
              )}
            >
              {opt === 'יציע כסף' && <Star size={14} className={section === opt ? 'text-white' : 'text-brand'} />}
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Row + Seat */}
      <div className="flex gap-3 flex-row-reverse">
        <div className="flex-1">
          <label className="block text-xs font-medium text-right mb-2 pr-1">
            שורה <span className="text-slate-400 font-normal">(אופציונלי)</span>
          </label>
          <input
            type="text"
            value={rowNumber}
            onChange={(e) => setRowNumber(e.target.value)}
            placeholder="12"
            className="w-full border border-slate-200 rounded-xl p-3 text-right bg-white"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-right mb-2 pr-1">
            כסא <span className="text-slate-400 font-normal">(אופציונלי)</span>
          </label>
          <input
            type="text"
            value={seatNumber}
            onChange={(e) => setSeatNumber(e.target.value)}
            placeholder="8"
            className="w-full border border-slate-200 rounded-xl p-3 text-right bg-white"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-right mb-2 pr-1">
          הערות <span className="text-slate-400 font-normal">(אופציונלי)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="מידע נוסף על הכרטיס..."
          rows={2}
          className="w-full border border-slate-200 rounded-xl p-3 text-right bg-white resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !selectedEvent || !price || parseInt(price) < 1 || !section}
        className={cn(
          'w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors',
          selectedEvent && price && parseInt(price) >= 1 && section
            ? 'bg-brand hover:bg-brand-dark text-white'
            : 'bg-brand/30 text-white/70 cursor-not-allowed'
        )}
      >
        {loading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <>
            <Tag size={18} />
            <span>פרסם כרטיס</span>
          </>
        )}
      </button>
    </div>
  );
}
