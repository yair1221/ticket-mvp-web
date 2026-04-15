import Link from 'next/link';
import type { EventWithStats } from '@/lib/types/database';
import { formatEventDate } from '@/lib/utils/format';
import TeamLogo from '@/components/shared/TeamLogo';

interface GameCardProps {
  event: EventWithStats;
}

export default function GameCard({ event }: GameCardProps) {
  return (
    <Link href={`/games/${event.id}`}>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between flex-row-reverse">
          {/* Home team */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <TeamLogo teamName={event.home_team} size={34} />
            <span className="text-[11px] font-semibold text-center leading-tight">{event.home_team}</span>
            <span className="text-[9px] text-green-600 font-medium">(בית)</span>
          </div>

          {/* Center - VS & date */}
          <div className="flex flex-col items-center gap-0.5 px-2">
            <span className="text-[10px] font-semibold text-gray-400">VS</span>
            <span className="text-sm font-bold">{formatEventDate(event.date)}</span>
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <TeamLogo teamName={event.away_team} size={34} />
            <span className="text-[11px] font-semibold text-center leading-tight">{event.away_team}</span>
            <span className="text-[9px] text-gray-400 font-medium">(חוץ)</span>
          </div>
        </div>

        {/* Footer - price and badges */}
        <div className="flex items-center justify-between mt-4">
          {event.min_price ? (
            <span className="text-sm font-bold text-brand">החל מ-₪{event.min_price}</span>
          ) : (
            <span className="text-[11px] text-gray-400">אין כרטיסים עדיין</span>
          )}

          {event.listing_count > 3 && (
            <span className="text-[10px] font-bold bg-brand/10 text-brand px-2.5 py-1 rounded-full">
              ביקוש גבוה
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
