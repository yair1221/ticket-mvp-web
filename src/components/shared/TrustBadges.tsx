import { ShieldCheck, Banknote, Headphones } from 'lucide-react';

const badges = [
  { icon: ShieldCheck, label: 'כרטיסים מאומתים', color: 'text-brand' },
  { icon: Banknote, label: 'ללא עמלות', color: 'text-brand' },
  { icon: Headphones, label: 'תמיכה 24/7', color: 'text-brand' },
];

export default function TrustBadges() {
  return (
    <div className="flex items-center justify-around py-4 px-2 bg-white rounded-2xl">
      {badges.map((badge) => {
        const Icon = badge.icon;
        return (
          <div key={badge.label} className="flex flex-col items-center gap-1.5">
            <Icon size={24} className={badge.color} />
            <span className="text-xs font-medium text-gray-600">{badge.label}</span>
          </div>
        );
      })}
    </div>
  );
}
