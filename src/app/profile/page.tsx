'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, HelpCircle, FileText, Headphones, ChevronLeft, LogIn, Ticket, LogOut, Loader2, Pencil, Check, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import SiteLogo from '@/components/shared/SiteLogo';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<{ name: string | null; phone: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', user.id)
        .single();
      setProfile(data);
    };
    fetchProfile();
  }, [user]);

  const handleSaveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setSaveError('נא להזין שם מלא');
      return;
    }
    if (trimmed.length > 60) {
      setSaveError('שם ארוך מדי');
      return;
    }
    setSaving(true);
    setSaveError('');
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ name: trimmed })
      .eq('id', user!.id);
    setSaving(false);
    if (error) {
      setSaveError('שמירה נכשלה, נסה שוב');
      return;
    }
    setProfile((p) => (p ? { ...p, name: trimmed } : p));
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
      const supabase = createClient();
      supabase.auth.signOut().then(() => {
        router.replace('/');
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-brand animate-spin" />
      </div>
    );
  }

  const generalLinks: MenuItem[] = [
    { icon: <HelpCircle size={20} />, label: 'איך זה עובד?', href: '/how-it-works' },
    { icon: <FileText size={20} />, label: 'תקנון', href: '/terms' },
    { icon: <Headphones size={20} />, label: 'תמיכה', href: '/support' },
  ];

  return (
    <div className="px-4 pt-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="w-8" />
        <h1 className="text-lg font-bold flex-1 text-center">פרופיל</h1>
        <Link href="/"><SiteLogo /></Link>
      </div>

      {/* Avatar + Info */}
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
          <User size={40} className="text-slate-300" />
        </div>
        {user ? (
          <>
            {isEditing ? (
              <div className="w-full max-w-xs space-y-2">
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value.slice(0, 60))}
                  maxLength={60}
                  autoFocus
                  placeholder="שם מלא"
                  className="w-full border border-slate-200 rounded-xl p-3 text-center text-base font-bold bg-white"
                />
                {saveError && (
                  <p className="text-xs text-red-500 text-center">{saveError}</p>
                )}
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="flex items-center gap-1 bg-brand text-white font-bold px-4 py-2 rounded-xl disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    <span className="text-sm">שמור</span>
                  </button>
                  <button
                    onClick={() => { setIsEditing(false); setSaveError(''); }}
                    className="flex items-center gap-1 bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-xl"
                  >
                    <X size={16} />
                    <span className="text-sm">ביטול</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">{profile?.name || 'משתמש'}</h2>
                  <button
                    onClick={() => { setNameDraft(profile?.name ?? ''); setIsEditing(true); }}
                    aria-label="ערוך שם"
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                  >
                    <Pencil size={14} className="text-brand" />
                  </button>
                </div>
                <p className="text-xs text-slate-500">{profile?.phone}</p>
              </>
            )}
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold">אורח</h2>
            <p className="text-xs text-slate-500">התחבר כדי לגשת לכל הפיצ&apos;רים</p>
          </>
        )}
      </div>

      {/* Auth / My Tickets */}
      {!user ? (
        <Link
          href="/login"
          className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors"
        >
          <span>התחבר / הירשם</span>
          <LogIn size={20} />
        </Link>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <Link
            href="/my-listings"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={18} className="text-slate-300" />
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">הכרטיסים שלי</span>
              <Ticket size={20} className="text-slate-500" />
            </div>
          </Link>
        </div>
      )}

      {/* General Links */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {generalLinks.map((link, i) => (
          <Link
            key={link.label}
            href={link.href!}
            className={`flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${
              i < generalLinks.length - 1 ? 'border-b border-slate-200' : ''
            }`}
          >
            <ChevronLeft size={18} className="text-slate-300" />
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{link.label}</span>
              <span className="text-slate-500">{link.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Logout */}
      {user && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={18} className="text-slate-300" />
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-red-500">התנתק</span>
              <LogOut size={20} className="text-red-500" />
            </div>
          </button>
        </div>
      )}

      <p className="text-center text-[10px] text-slate-400 pb-4">גרסה 1.0.0</p>
    </div>
  );
}
