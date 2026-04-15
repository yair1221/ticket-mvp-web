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
    <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3.5">
      {/* Seller + Verified */}
      <div className="flex items-center gap-2 justify-end">
        <div className="flex items-center gap-1 bg-green-500 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
          <ShieldCheck size={12} />
          <span>מוכר מאומת</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <User size={20} className="text-brand" />
        </div>
      </div>

      {/* Section + Price row */}
      <div className="flex items-center justify-between">
        <div className="bg-brand/10 rounded-2xl px-3 py-1.5">
          <span className="text-base font-bold text-brand">₪{listing.price}</span>
        </div>
        <div className="text-right flex-1">
          {listing.section && (
            <p className="text-lg font-bold">{listing.section}</p>
          )}
          {(listing.row_number || listing.seat_number) && (
            <p className="text-[13px] text-gray-500 mt-0.5">
              {[
                listing.row_number && `שורה ${listing.row_number}`,
                listing.seat_number && `כסא ${listing.seat_number}`,
              ].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Notes */}
      {listing.notes && (
        <p className="text-xs text-gray-400 text-right">{listing.notes}</p>
      )}

      {/* Contact */}
      <button
        onClick={handleContact}
        className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        <MessageCircle size={18} />
        <span>צור קשר</span>
      </button>
    </div>
  );
}
