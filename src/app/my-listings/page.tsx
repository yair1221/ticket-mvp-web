'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, LogIn, Ticket, Calendar, Loader2, CheckCircle, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { posthog } from '@/lib/posthog';
import { cn } from '@/lib/utils/cn';
import { formatEventDate } from '@/lib/utils/format';
import SiteLogo from '@/components/shared/SiteLogo';
import type { Listing, Event } from '@/lib/types/database';

interface ListingWithEvent extends Listing {
  events: Event;
}

export default function MyListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<ListingWithEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'sold'>('all');
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    let query = supabase
      .from('listings')
      .select('*, events(*)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (filter !== 'all') query = query.eq('status', filter);

    const { data } = await query;
    setListings((data as ListingWithEvent[]) || []);
    setLoading(false);
  }, [user, filter]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleStatusChange = async (id: string, status: 'sold' | 'removed') => {
    const label = status === 'sold' ? 'לסמן כנמכר' : 'להסיר';
    if (!confirm(`האם אתה בטוח שברצונך ${label}?`)) return;

    const supabase = createClient();
    await supabase.from('listings').update({ status }).eq('id', id);
    posthog.capture(status === 'sold' ? 'listing_marked_sold' : 'listing_removed', { listing_id: id });
    fetchListings();
  };

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
        <Lock size={64} className="text-slate-300" />
        <h2 className="text-xl font-bold mt-4">נדרשת התחברות</h2>
        <p className="text-sm text-slate-500 text-center mt-2">עליך להתחבר כדי לצפות בכרטיסים שלך</p>
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

  const filters: { key: 'all' | 'active' | 'sold'; label: string }[] = [
    { key: 'all', label: 'הכל' },
    { key: 'active', label: 'פעילות' },
    { key: 'sold', label: 'נמכרו' },
  ];

  return (
    <div className="pt-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-4 border-b border-slate-200">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
          <ArrowLeft size={16} className="text-brand" />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">הכרטיסים שלי</h1>
        <Link href="/"><SiteLogo /></Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-4 py-2 border-b border-slate-200">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key);
              posthog.capture('listings_filtered', { filter: f.key });
            }}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-medium border transition-colors',
              filter === f.key
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-slate-600 border-slate-200'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={32} className="text-brand animate-spin" />
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {listings.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <Ticket size={48} className="text-slate-300" />
              <p className="text-sm text-slate-500 mt-2">אין כרטיסים עדיין</p>
              <button
                onClick={() => router.push('/sell')}
                className="text-sm font-semibold text-brand mt-4"
              >
                פרסם כרטיס ראשון
              </button>
            </div>
          ) : (
            listings.map((listing) => (
              <div key={listing.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                {/* Status badge */}
                <span className={cn(
                  'inline-block text-[10px] font-bold px-2.5 py-1 rounded-full',
                  listing.status === 'active' && 'bg-green-100 text-green-600',
                  listing.status === 'sold' && 'bg-slate-100 text-slate-500',
                  listing.status === 'removed' && 'bg-red-100 text-red-500'
                )}>
                  {listing.status === 'active' ? 'פעיל' : listing.status === 'sold' ? 'נמכר' : 'הוסר'}
                </span>

                {/* Match */}
                <p className="text-sm font-bold text-right">
                  {listing.events?.home_team} VS {listing.events?.away_team}
                </p>

                {/* Date */}
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-500">
                    {listing.events && formatEventDate(listing.events.date)} | {listing.events?.time?.slice(0, 5)}
                  </span>
                </div>

                {/* Seat grid */}
                <div className="flex bg-slate-50 rounded-xl p-3">
                  {listing.section && (
                    <>
                      <div className="flex-1 text-center">
                        <p className="text-[10px] text-slate-400">יציע</p>
                        <p className="text-xs font-bold">{listing.section}</p>
                      </div>
                      <div className="w-px bg-gray-200 mx-2" />
                    </>
                  )}
                  {listing.row_number && (
                    <>
                      <div className="flex-1 text-center">
                        <p className="text-[10px] text-slate-400">שורה</p>
                        <p className="text-lg font-bold">{listing.row_number}</p>
                      </div>
                      <div className="w-px bg-gray-200 mx-2" />
                    </>
                  )}
                  {listing.seat_number && (
                    <>
                      <div className="flex-1 text-center">
                        <p className="text-[10px] text-slate-400">כיסא</p>
                        <p className="text-lg font-bold">{listing.seat_number}</p>
                      </div>
                      <div className="w-px bg-gray-200 mx-2" />
                    </>
                  )}
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-slate-400">מחיר</p>
                    <p className="text-lg font-bold text-brand">₪{listing.price}</p>
                  </div>
                </div>

                {/* Actions */}
                {listing.status === 'active' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(listing.id, 'sold')}
                      className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-green-500 text-white rounded-xl text-xs font-bold"
                    >
                      <CheckCircle size={16} />
                      <span>סמן כנמכר</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(listing.id, 'removed')}
                      className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium"
                    >
                      <Trash2 size={16} />
                      <span>הסר</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
