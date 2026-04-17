'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Headphones, MessageCircle, Phone, Mail, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import SiteLogo from '@/components/shared/SiteLogo';
import { logError } from '@/lib/logger';
import { posthog } from '@/lib/posthog';

export default function SupportPage() {
  const router = useRouter();
  const [subject, setSubject] = useState('בעיה ברכישת כרטיס');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
          <ArrowLeft size={16} className="text-brand" />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">תמיכה</h1>
        <Link href="/"><SiteLogo /></Link>
      </div>

      {/* Hero */}
      <div className="bg-slate-100 px-4 py-8 text-center">
        <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center mx-auto mb-4">
          <Headphones size={40} className="text-white" />
        </div>
        <h2 className="text-xl font-bold mb-2">אנחנו כאן בשבילך</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          נתקלת בבעיה? יש לך שאלה לגבי כרטיס? הצוות שלנו זמין לעזור בכל נושא.
        </p>
      </div>

      {/* Quick Contact */}
      <div className="p-4">
        <h3 className="text-base font-bold text-right mb-3">יצירת קשר מהיר</h3>
        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
              <MessageCircle size={24} className="text-brand" />
            </div>
            <p className="text-sm font-bold">צ&apos;אט נציג</p>
            <p className="text-xs text-slate-500">זמין 24/7</p>
          </div>
          <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
              <Phone size={24} className="text-brand" />
            </div>
            <p className="text-sm font-bold">מוקד טלפוני</p>
            <p className="text-xs text-slate-500">09:00 - 18:00</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-4 mb-4 bg-white rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Mail size={20} className="text-brand" />
          <h3 className="text-base font-bold">שלחו לנו פנייה</h3>
        </div>

        <label className="block text-xs font-medium mb-2">נושא הפנייה</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm mb-4 appearance-none"
        >
          <option>בעיה ברכישת כרטיס</option>
          <option>בעיה במכירת כרטיס</option>
          <option>בעיה בהתחברות</option>
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
        <a href="mailto:support@ticketil.com" className="text-sm font-semibold text-brand">
          support@ticketil.com
        </a>
      </div>
    </div>
  );
}
