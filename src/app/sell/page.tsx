'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, LogIn, Tag, Loader2, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import TeamFilter from '@/components/game/TeamFilter';
import TeamLogo from '@/components/shared/TeamLogo';
import { formatEventDate } from '@/lib/utils/format';
import { SECTION_OPTIONS } from '@/lib/constants/stands';
import { cn } from '@/lib/utils/cn';
import type { Event } from '@/lib/types/database';

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

  useEffect(() => {
    if (!user) return;
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
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-brand animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8">
        <Lock size={64} className="text-gray-300" />
        <h2 className="text-xl font-bold mt-4">נדרשת התחברות</h2>
        <p className="text-sm text-gray-500 text-center mt-2">עליך להתחבר כדי לפרסם כרטיסים למכירה</p>
        <button
          onClick={() => router.push('/login')}
          className="flex items-center gap-2 bg-brand text-white font-bold py-3.5 px-8 rounded-xl mt-6 hover:bg-brand-dark transition-colors"
        >
          <span>התחבר עכשיו</span>
          <LogIn size={20} />
        </button>
      </div>
    );
  }

  const filteredEvents = selectedTeam
    ? events.filter((e) => e.home_team === selectedTeam || e.away_team === selectedTeam)
    : events;

  const handleSubmit = async () => {
    if (!selectedEvent || !price || parseInt(price) <= 0 || !section) return;
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.from('listings').insert({
      event_id: selectedEvent.id,
      seller_id: user!.id,
      price: parseInt(price),
      section: section || null,
      row_number: rowNumber || null,
      seat_number: seatNumber || null,
      quantity: 1,
      notes: notes || null,
    });

    setLoading(false);
    if (error) {
      alert('שגיאה: ' + error.message);
    } else {
      alert('הכרטיס פורסם בהצלחה!');
      router.push('/my-listings');
    }
  };

  return (
    <div className="px-4 pt-4 space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="w-8" />
        <h1 className="text-lg font-bold">פרסום כרטיס</h1>
        <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center">
          <span className="text-white text-sm">⚽</span>
        </div>
      </div>

      {/* Team Filter */}
      <TeamFilter selectedTeam={selectedTeam} onSelect={(t) => { setSelectedTeam(t); setSelectedEvent(null); setShowPicker(false); }} />

      {/* Event Selector */}
      <div>
        <label className="block text-xs font-medium text-right mb-2 pr-1">בחר משחק</label>
        {selectedEvent ? (
          <button
            onClick={() => { setSelectedEvent(null); setShowPicker(true); }}
            className="w-full bg-gray-50 rounded-2xl border border-gray-200 p-3 flex items-center justify-between flex-row-reverse"
          >
            <div className="flex items-center gap-1 flex-1 justify-center">
              <TeamLogo teamName={selectedEvent.home_team} size={24} />
              <span className="text-[10px] font-semibold">{selectedEvent.home_team}</span>
            </div>
            <span className="text-xs font-bold">{formatEventDate(selectedEvent.date)}</span>
            <div className="flex items-center gap-1 flex-1 justify-center">
              <TeamLogo teamName={selectedEvent.away_team} size={24} />
              <span className="text-[10px] font-semibold">{selectedEvent.away_team}</span>
            </div>
          </button>
        ) : (
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-full border border-gray-200 rounded-xl p-3 text-right bg-white flex items-center justify-between"
          >
            <span className="text-sm text-gray-400">בחר משחק...</span>
            <span className="text-gray-300">▼</span>
          </button>
        )}

        {showPicker && !selectedEvent && (
          <div className="mt-2 max-h-[280px] overflow-y-auto space-y-1.5">
            {filteredEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => { setSelectedEvent(event); setShowPicker(false); }}
                className="w-full bg-gray-50 rounded-2xl border border-gray-200 p-3 flex items-center justify-between flex-row-reverse hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-1 flex-1 justify-center">
                  <TeamLogo teamName={event.home_team} size={24} />
                  <span className="text-[10px] font-semibold">{event.home_team}</span>
                </div>
                <span className="text-xs font-bold">{formatEventDate(event.date)}</span>
                <div className="flex items-center gap-1 flex-1 justify-center">
                  <TeamLogo teamName={event.away_team} size={24} />
                  <span className="text-[10px] font-semibold">{event.away_team}</span>
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
          className="w-full border border-gray-200 rounded-xl p-3 text-right bg-white"
        />
      </div>

      {/* Section selection */}
      <div>
        <label className="block text-xs font-medium text-right mb-2 pr-1">בחר יציע</label>
        <div className="flex flex-wrap gap-2 justify-end flex-row-reverse">
          {SECTION_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setSection(opt)}
              className={cn(
                'px-3.5 py-2.5 rounded-full text-[13px] font-medium border transition-colors flex items-center gap-1.5 flex-row-reverse',
                section === opt
                  ? 'bg-brand text-white border-brand'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-brand/50'
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
          <label className="block text-xs font-medium text-right mb-2 pr-1">שורה</label>
          <input
            type="text"
            value={rowNumber}
            onChange={(e) => setRowNumber(e.target.value)}
            placeholder="12"
            className="w-full border border-gray-200 rounded-xl p-3 text-right bg-white"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-right mb-2 pr-1">כסא</label>
          <input
            type="text"
            value={seatNumber}
            onChange={(e) => setSeatNumber(e.target.value)}
            placeholder="8"
            className="w-full border border-gray-200 rounded-xl p-3 text-right bg-white"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-right mb-2 pr-1">הערות</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="מידע נוסף על הכרטיס..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl p-3 text-right bg-white resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !selectedEvent || !price || !section}
        className={cn(
          'w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors',
          selectedEvent && price && section
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
