'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Phone, Loader2, ShieldCheck, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
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

    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({ phone: formatPhone(phone) });
    if (err) setError(err.message);
    else setStep('otp');
    setLoading(false);
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
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').upsert(
        { id: data.user.id, phone },
        { onConflict: 'id' }
      );
      router.replace('/');
    }
    setLoading(false);
  };

  return (
    <div className="px-6 pt-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => step === 'otp' ? setStep('phone') : router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <ArrowRight size={20} className="text-brand" />
        </button>
        <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center">
          <span className="text-white text-sm">⚽</span>
        </div>
      </div>

      {step === 'phone' ? (
        <>
          <div className="flex flex-col items-center gap-2 pt-4">
            <div className="w-[72px] h-[72px] rounded-full bg-brand/10 flex items-center justify-center">
              <Phone size={32} className="text-brand" />
            </div>
            <h1 className="text-xl font-bold text-center mt-4">אימות מספר טלפון</h1>
            <p className="text-sm text-gray-500 text-center">נא להזין את מספר הטלפון שלך לאימות החשבון</p>
          </div>

          <div>
            <label className="block text-xs font-medium mb-2 pr-1">מספר טלפון</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05X-XXX-XXXX"
              className="w-full border border-gray-200 rounded-xl p-3.5 text-center text-lg font-semibold bg-white tracking-widest"
              dir="ltr"
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            <Info size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">מספר הטלפון ישמש כמזהה הייחודי שלך באפליקציה</span>
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

          <div className="flex items-center justify-center gap-2 mt-4">
            <ShieldCheck size={14} className="text-gray-300" />
            <span className="text-[10px] text-gray-400">המספר שלך מאובטח ולא ישותף</span>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center gap-2 pt-4">
            <div className="w-[72px] h-[72px] rounded-full bg-brand/10 flex items-center justify-center">
              <Phone size={32} className="text-brand" />
            </div>
            <h1 className="text-xl font-bold text-center mt-4">אימות טלפון</h1>
            <p className="text-sm text-gray-500 text-center">הזן את הקוד בן 6 הספרות שנשלח אל</p>
            <p className="text-base font-semibold">{phone}</p>
          </div>

          <input
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="w-full border border-gray-200 rounded-xl p-3.5 text-center text-xl font-bold bg-gray-50 tracking-[0.5em]"
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
            <span className="text-xs text-gray-500">לא קיבלת קוד?</span>
            <button onClick={handleSendOtp} className="text-xs font-semibold text-brand">
              שלח שוב
            </button>
          </div>
        </>
      )}
    </div>
  );
}
