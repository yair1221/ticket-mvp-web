"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { logError } from "@/lib/logger";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    logError("app/error", error, { digest: error.digest });
  }, [error]);

  return (
    <div className="px-4 pt-10 pb-6 flex flex-col items-center text-center gap-4 min-h-[60vh] justify-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <AlertTriangle size={32} className="text-red-500" />
      </div>
      <h1 className="text-xl font-bold">משהו השתבש</h1>
      <p className="text-sm text-slate-500 max-w-xs">
        נתקלנו בתקלה לא צפויה. אפשר לנסות שוב או לחזור לעמוד הבית.
      </p>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => unstable_retry()}
          className="flex items-center gap-2 bg-brand text-white font-bold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors"
        >
          <RotateCcw size={16} />
          נסו שוב
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 bg-slate-100 text-slate-700 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
        >
          <Home size={16} />
          לעמוד הבית
        </Link>
      </div>
    </div>
  );
}
