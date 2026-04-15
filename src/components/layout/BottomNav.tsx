'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, PlusCircle, HelpCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const tabs = [
  { href: '/profile', label: 'פרופיל', icon: User },
  { href: '/how-it-works', label: 'איך זה עובד', icon: HelpCircle },
  { href: '/sell', label: 'מכור', icon: PlusCircle, highlight: true },
  { href: '/games', label: 'משחקים', icon: Trophy },
  { href: '/', label: 'בית', icon: Home },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.href === '/'
            ? pathname === '/'
            : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors',
                isActive ? 'text-brand' : 'text-gray-400',
                tab.highlight && !isActive && 'text-brand'
              )}
            >
              {tab.highlight ? (
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center -mt-3',
                  isActive ? 'bg-brand text-white' : 'bg-brand/10 text-brand'
                )}>
                  <Icon size={22} />
                </div>
              ) : (
                <Icon size={22} />
              )}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
