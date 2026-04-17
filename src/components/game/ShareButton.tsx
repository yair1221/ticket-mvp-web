'use client';

import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  text: string;
}

export default function ShareButton({ title, text }: ShareButtonProps) {
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('הקישור הועתק!');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
    >
      <Share2 size={16} className="text-slate-500" />
    </button>
  );
}
