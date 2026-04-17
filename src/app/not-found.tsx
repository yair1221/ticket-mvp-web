import Link from "next/link";
import { Ticket, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="px-4 pt-10 pb-6 flex flex-col items-center text-center gap-4 min-h-[60vh] justify-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
        <Ticket size={32} className="text-slate-400" />
      </div>
      <h1 className="text-2xl font-bold">404</h1>
      <p className="text-base font-medium">העמוד לא נמצא</p>
      <p className="text-sm text-slate-500 max-w-xs">
        הקישור שניסיתם לפתוח כבר לא קיים או הוסר.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 bg-brand text-white font-bold px-5 py-2.5 rounded-xl mt-2 hover:bg-brand-dark transition-colors"
      >
        <Home size={16} />
        חזרה לעמוד הבית
      </Link>
    </div>
  );
}
