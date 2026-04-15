'use client';

import { Share2 } from 'lucide-react';

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
      alert('הקישור הועתק!');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
    >
      <Share2 size={16} className="text-gray-500" />
    </button>
  );
}
