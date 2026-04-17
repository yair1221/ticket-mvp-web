"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, ArrowRight } from "lucide-react";
import { logError } from "@/lib/logger";

export default function GameError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    logError("games/[gameId]/error", error, { digest: error.digest });
  }, [error]);

  return (
    <div className="px-4 pt-10 pb-6 flex flex-col items-center text-center gap-4">
      <AlertTriangle size={32} className="text-red-500" />
      <h2 className="text-lg font-bold">לא ניתן לטעון את המשחק</h2>
      <p className="text-sm text-slate-500 max-w-xs">יתכן שיש בעיית רשת זמנית.</p>
      <div className="flex gap-2">
        <button
          onClick={() => unstable_retry()}
          className="flex items-center gap-2 bg-brand text-white font-bold px-5 py-2.5 rounded-xl"
        >
          <RotateCcw size={16} /> נסו שוב
        </button>
        <Link
          href="/games"
          className="flex items-center gap-2 bg-slate-100 text-slate-700 font-bold px-5 py-2.5 rounded-xl"
        >
          <ArrowRight size={16} /> לכל המשחקים
        </Link>
      </div>
    </div>
  );
}
