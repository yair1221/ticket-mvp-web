"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { logError } from "@/lib/logger";

export default function SellError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    logError("sell/error", error, { digest: error.digest });
  }, [error]);

  return (
    <div className="px-4 pt-10 pb-6 flex flex-col items-center text-center gap-4">
      <AlertTriangle size={32} className="text-red-500" />
      <h2 className="text-lg font-bold">לא הצלחנו לפרסם את הכרטיס</h2>
      <p className="text-sm text-slate-500 max-w-xs">נסו שוב, ואם זה ממשיך פנו לתמיכה.</p>
      <div className="flex gap-2">
        <button
          onClick={() => unstable_retry()}
          className="flex items-center gap-2 bg-brand text-white font-bold px-5 py-2.5 rounded-xl"
        >
          <RotateCcw size={16} /> נסו שוב
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 bg-slate-100 text-slate-700 font-bold px-5 py-2.5 rounded-xl"
        >
          <Home size={16} /> לעמוד הבית
        </Link>
      </div>
    </div>
  );
}
