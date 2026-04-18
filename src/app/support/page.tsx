'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, MessageCircle, Mail, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import SiteLogo from '@/components/shared/SiteLogo';
import { logError } from '@/lib/logger';
import { posthog } from '@/lib/posthog';

export default function SupportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subject, setSubject] = useState('בעיה ברכישת כרטיס');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const reportListingId = searchParams.get('reportListing');
    if (reportListingId) {
      setSubject('דיווח על מודעה מפרה / חשודה');
      setMessage(`מזהה מודעה: ${reportListingId}\n\nסיבת הדיווח:\n`);
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    if (!email || !message) {
      toast.error('נא למלא את כל השדות');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, email, message }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Request failed');
      }
      posthog.capture('support_message_sent', { subject });
      setSent(true);
    } catch (err) {
      logError('support.submit', err);
      toast.error('השליחה נכשלה, נסו שוב בעוד רגע');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-4 border-b border-slate-200">
        <button onClick={() => router.back()} className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center">
          <ArrowLeft size={20} className="text-brand" />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">תמיכה</h1>
        <Link href="/"><SiteLogo /></Link>
      </div>

      {/* Hero */}
      <div className="bg-slate-100 px-4 py-8 text-center">
        <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center mx-auto mb-4">
          <MessageCircle size={40} className="text-white" />
        </div>
        <h2 className="text-xl font-bold mb-2">צ&apos;אט זמין 24/7</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          שלחו לנו פנייה בטופס למטה ונחזור אליכם בהקדם.
        </p>
      </div>

      {/* Form */}
      <div className="mx-4 mb-4 bg-white rounded-2xl p-4">
        <div className="flex items-center justify-end gap-2 mb-4">
          <h3 className="text-base font-bold">שלחו לנו פנייה</h3>
          <Mail size={20} className="text-brand" />
        </div>

        <label className="block text-xs font-medium mb-2 text-right">נושא הפנייה</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm mb-4 appearance-none text-right"
        >
          <option>בעיה ברכישת כרטיס</option>
          <option>בעיה במכירת כרטיס</option>
          <option>בעיה בהתחברות</option>
          <option>בעיה טכנית באתר</option>
          <option>דיווח על מודעה מפרה / חשודה</option>
          <option>בקשה למחיקת חשבון</option>
          <option>שאלה על התקנון / מדיניות פרטיות</option>
          <option>הצעה לשיפור</option>
          <option>אחר</option>
        </select>

        <label className="block text-xs font-medium mb-2">אימייל לחזרה</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm mb-4 text-left"
          dir="ltr"
        />

        <label className="block text-xs font-medium mb-2">תוכן ההודעה</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="פרט/י כאן את הבעיה..."
          rows={5}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm mb-4 text-right resize-none"
        />

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-700 font-bold">הפנייה נשלחה בהצלחה!</p>
            <p className="text-green-600 text-sm mt-1">נחזור אליך בהקדם האפשרי</p>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-brand hover:bg-brand-dark disabled:bg-brand/40 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Send size={20} />
                <span>שליחת פנייה</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-slate-500">ניתן גם לשלוח מייל ישירות לכתובת:</p>
        <a href="mailto:ticketil.x@gmail.com" className="text-sm font-semibold text-brand">
          ticketil.x@gmail.com
        </a>
      </div>
    </div>
  );
}
