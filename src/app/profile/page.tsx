'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, HelpCircle, FileText, Headphones, ChevronLeft, LogIn, Ticket, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';

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
        <h1 className="text-lg font-bold">פרופיל</h1>
        <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center">
          <span className="text-white text-sm">⚽</span>
        </div>
      </div>

      {/* Avatar + Info */}
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <User size={40} className="text-gray-300" />
        </div>
        {user ? (
          <>
            <h2 className="text-lg font-bold">{profile?.name || 'משתמש'}</h2>
            <p className="text-xs text-gray-500">{profile?.phone}</p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold">אורח</h2>
            <p className="text-xs text-gray-500">התחבר כדי לגשת לכל הפיצ&apos;רים</p>
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <Link
            href="/my-listings"
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-300" />
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">הכרטיסים שלי</span>
              <Ticket size={20} className="text-gray-500" />
            </div>
          </Link>
        </div>
      )}

      {/* General Links */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {generalLinks.map((link, i) => (
          <Link
            key={link.label}
            href={link.href!}
            className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
              i < generalLinks.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <ChevronLeft size={18} className="text-gray-300" />
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{link.label}</span>
              <span className="text-gray-500">{link.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Logout */}
      {user && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-300" />
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-red-500">התנתק</span>
              <LogOut size={20} className="text-red-500" />
            </div>
          </button>
        </div>
      )}

      <p className="text-center text-[10px] text-gray-400 pb-4">גרסה 1.0.0</p>
    </div>
  );
}
