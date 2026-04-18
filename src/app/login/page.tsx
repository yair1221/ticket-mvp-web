'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Loader2, ShieldCheck, Info, UserPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { posthog } from '@/lib/posthog';
import SiteLogo from '@/components/shared/SiteLogo';
import { cn } from '@/lib/utils/cn';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const formatPhone = (p: string) => {
    let clean = p.replace(/[-\s]/g, '');
    if (clean.startsWith('0')) clean = '+972' + clean.slice(1);
    else if (!clean.startsWith('+')) clean = '+972' + clean;
    return clean;
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    posthog.capture('login_started');

    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({ phone: formatPhone(phone) });
    if (err) {
      setError(err.message);
      posthog.capture('login_failed', { step: 'otp_send', error: err.message });
    } else {
      setStep('otp');
      posthog.capture('otp_sent');
    }
    setLoading(false);
  };

  const navigateAfterLogin = () => {
    const hasPending = sessionStorage.getItem('pending_listing');
    router.replace(hasPending ? '/sell' : '/');
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data, error: err } = await supabase.auth.verifyOtp({
      phone: formatPhone(phone),
      token: otp,
      type: 'sms',
    });

    if (err) {
      setError(err.message);
      posthog.capture('login_failed', { step: 'otp_verify', error: err.message });
      setLoading(false);
      return;
    }

    if (data.user) {
      posthog.capture('otp_verified');
      setUserId(data.user.id);

      // בדיקה אם למשתמש כבר יש שם
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', data.user.id)
        .single();

      if (profile?.name) {
        // משתמש קיים עם שם - ממשיכים
        navigateAfterLogin();
      } else {
        // משתמש חדש - צריך שם
        await supabase.from('profiles').upsert(
          { id: data.user.id, phone },
          { onConflict: 'id' }
        );
        setStep('name');
      }
    }
    setLoading(false);
  };

  const handleSaveName = async () => {
    if (!firstName.trim() || !lastName.trim() || !userId) return;
    setLoading(true);

    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ name: `${firstName.trim()} ${lastName.trim()}` })
      .eq('id', userId);

    posthog.capture('signup_completed');
    setLoading(false);
    navigateAfterLogin();
  };

  const handleBack = () => {
    if (step === 'otp') setStep('phone');
    else if (step === 'name') return; // לא ניתן לחזור אחורה משלב השם
    else router.back();
  };

  return (
    <div className="px-6 pt-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {step !== 'name' ? (
          <button
            onClick={handleBack}
            className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center"
          >
            <ArrowLeft size={20} className="text-brand" />
          </button>
        ) : (
          <div className="w-9" />
        )}
        <Link href="/"><SiteLogo /></Link>
      </div>

      {step === 'phone' && (
        <>
          <div className="flex flex-col items-center gap-2 pt-4">
            <div className="w-[72px] h-[72px] rounded-full bg-brand/10 flex items-center justify-center">
              <Phone size={32} className="text-brand" />
            </div>
            <h1 className="text-xl font-bold text-center mt-4">אימות מספר טלפון</h1>
            <p className="text-sm text-slate-500 text-center">נא להזין את מספר הטלפון שלך לאימות החשבון</p>
          </div>

          <div>
            <label className="block text-xs font-medium mb-2 pr-1">מספר טלפון</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05X-XXX-XXXX"
              className="w-full border border-slate-200 rounded-xl p-3.5 text-center text-lg font-semibold bg-white tracking-widest"
              dir="ltr"
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            <Info size={14} className="text-slate-400" />
            <span className="text-xs text-slate-500">מספר הטלפון ישמש כמזהה הייחודי שלך באפליקציה</span>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1 text-red-500">
              <span className="text-xs">{error}</span>
            </div>
          )}

          <button
            onClick={handleSendOtp}
            disabled={phone.length < 9 || loading}
            className={cn(
              'w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors',
              phone.length >= 9 && !loading
                ? 'bg-brand hover:bg-brand-dark text-white'
                : 'bg-brand/30 text-white/70 cursor-not-allowed'
            )}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <span>שלח קוד אימות</span>}
          </button>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed px-2">
            בלחיצה על &quot;שלח קוד אימות&quot; אתה מאשר את{' '}
            <Link href="/terms" className="text-brand font-semibold underline">
              תקנון השימוש
            </Link>
            {' '}ו-
            <Link href="/privacy" className="text-brand font-semibold underline">
              מדיניות הפרטיות
            </Link>
            , ומסכים לשמירת מספר הטלפון שלך לאימות.
          </p>

          <div className="flex items-center justify-center gap-2 mt-4">
            <ShieldCheck size={14} className="text-slate-300" />
            <span className="text-[10px] text-slate-400">המספר שלך מאובטח ולא ישותף</span>
          </div>
        </>
      )}

      {step === 'otp' && (
        <>
          <div className="flex flex-col items-center gap-2 pt-4">
            <div className="w-[72px] h-[72px] rounded-full bg-brand/10 flex items-center justify-center">
              <Phone size={32} className="text-brand" />
            </div>
            <h1 className="text-xl font-bold text-center mt-4">אימות טלפון</h1>
            <p className="text-sm text-slate-500 text-center">הזן את הקוד בן 6 הספרות שנשלח אל</p>
            <p className="text-base font-semibold">{phone}</p>
          </div>

          <input
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="w-full border border-slate-200 rounded-xl p-3.5 text-center text-xl font-bold bg-slate-50 tracking-[0.5em]"
            dir="ltr"
            autoFocus
          />

          {error && (
            <div className="flex items-center justify-center gap-1 text-red-500">
              <span className="text-xs">{error}</span>
            </div>
          )}

          <button
            onClick={handleVerifyOtp}
            disabled={otp.length < 6 || loading}
            className={cn(
              'w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors',
              otp.length >= 6 && !loading
                ? 'bg-brand hover:bg-brand-dark text-white'
                : 'bg-brand/30 text-white/70 cursor-not-allowed'
            )}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <span>אמת והמשך</span>}
          </button>

          <div className="flex items-center justify-center gap-1">
            <span className="text-xs text-slate-500">לא קיבלת קוד?</span>
            <button onClick={handleSendOtp} className="text-xs font-semibold text-brand">
              שלח שוב
            </button>
          </div>
        </>
      )}

      {step === 'name' && (
        <>
          <div className="flex flex-col items-center gap-2 pt-4">
            <div className="w-[72px] h-[72px] rounded-full bg-brand/10 flex items-center justify-center">
              <UserPlus size={32} className="text-brand" />
            </div>
            <h1 className="text-xl font-bold text-center mt-4">ברוך הבא!</h1>
            <p className="text-sm text-slate-500 text-center">הזן את שמך כדי להשלים את ההרשמה</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-2 pr-1">שם פרטי</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="ישראל"
                className="w-full border border-slate-200 rounded-xl p-3.5 text-right bg-white"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2 pr-1">שם משפחה</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="ישראלי"
                className="w-full border border-slate-200 rounded-xl p-3.5 text-right bg-white"
              />
            </div>
          </div>

          <button
            onClick={handleSaveName}
            disabled={!firstName.trim() || !lastName.trim() || loading}
            className={cn(
              'w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors',
              firstName.trim() && lastName.trim() && !loading
                ? 'bg-brand hover:bg-brand-dark text-white'
                : 'bg-brand/30 text-white/70 cursor-not-allowed'
            )}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <span>סיים הרשמה</span>}
          </button>
        </>
      )}
    </div>
  );
}
