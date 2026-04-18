import Link from 'next/link';
import type { EventWithStats } from '@/lib/types/database';
import { formatEventDate } from '@/lib/utils/format';
import TeamLogo from '@/components/shared/TeamLogo';

interface GameCardProps {
  event: EventWithStats;
}

export default function GameCard({ event }: GameCardProps) {
  return (
    <Link href={`/games/${event.id}`} className="block">
      <div className="bg-white rounded-2xl px-4 py-2.5 shadow-md border border-slate-200 transition-shadow hover:shadow-lg">
        <div className="flex items-center justify-between">
          {/* Away team */}
          <div className="flex flex-col items-center gap-1 flex-1">
            <TeamLogo teamName={event.away_team} size={42} />
            <span className="text-sm font-semibold text-center leading-tight">{event.away_team}</span>
            <span className="text-[10px] text-slate-400 font-semibold">(חוץ)</span>
          </div>

          {/* Center - VS & date */}
          <div className="flex flex-col items-center gap-0.5 px-2">
            <span className="text-xs font-semibold text-slate-400">VS</span>
            <span className="text-sm font-bold">{formatEventDate(event.date, event.date_tbd)}</span>
          </div>

          {/* Home team */}
          <div className="flex flex-col items-center gap-1 flex-1">
            <TeamLogo teamName={event.home_team} size={42} />
            <span className="text-sm font-semibold text-center leading-tight">{event.home_team}</span>
            <span className="text-[10px] text-green-600 font-semibold">(בית)</span>
          </div>
        </div>

        {/* Footer - price and badges */}
        <div className="flex items-center justify-between mt-1.5">
          {event.min_price ? (
            <span className="text-base font-extrabold text-brand">החל מ-₪{event.min_price}</span>
          ) : (
            <span className="text-[11px] text-slate-400">אין כרטיסים עדיין</span>
          )}

          {event.listing_count > 3 && (
            <span className="text-[11px] font-bold bg-brand/10 text-brand px-3 py-1 rounded-full">
              ביקוש גבוה
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
