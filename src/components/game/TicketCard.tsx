'use client';

import { User, MessageCircle, ShieldCheck } from 'lucide-react';
import type { ListingWithSeller } from '@/lib/types/database';
import { buildWhatsappLink } from '@/lib/utils/whatsapp';

interface TicketCardProps {
  listing: ListingWithSeller;
  homeTeam: string;
  awayTeam: string;
}

export default function TicketCard({ listing, homeTeam, awayTeam }: TicketCardProps) {
  const handleContact = () => {
    const phone = listing.profiles?.whatsapp || listing.profiles?.phone || '';
    const link = buildWhatsappLink(phone, homeTeam, awayTeam, listing.section, listing.price);
    window.open(link, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl px-3.5 py-2.5 border border-gray-100 shadow-sm">
      {/* Top row: seller info */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-base font-bold">{listing.profiles?.name || 'מוכר'}</span>
            <div className="flex items-center gap-1 text-green-500">
              <span className="text-[10px] font-semibold">מאומת</span>
              <ShieldCheck size={12} />
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <User size={18} className="text-brand" />
          </div>
        </div>
      </div>

      {/* Details row */}
      <div className="flex items-center justify-between mt-1.5">
        <div className="bg-brand/10 rounded-full px-4 py-1.5">
          <span className="text-base font-extrabold text-brand">₪{listing.price}</span>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-gray-500">
        {listing.section && (
          <span className="font-bold text-gray-700 text-sm">{listing.section}</span>
        )}
        {listing.row_number && (
          <>
            <span className="text-gray-300">·</span>
            <span>שורה {listing.row_number}</span>
          </>
        )}
        {listing.seat_number && (
          <>
            <span className="text-gray-300">·</span>
            <span>כסא {listing.seat_number}</span>
          </>
        )}
        </div>
      </div>

      {/* Notes */}
      {listing.notes && (
        <p className="text-[11px] text-gray-400 text-right mt-1.5">{listing.notes}</p>
      )}

      {/* Contact button */}
      <button
        onClick={handleContact}
        className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
      >
        <MessageCircle size={16} />
        <span className="text-sm">צור קשר בוואטסאפ</span>
      </button>
    </div>
  );
}
