import { Search, Phone, Ticket, Trophy, ShieldCheck, Banknote, Headphones, ChevronDown } from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'מצא כרטיס',
    description: 'חפש את המשחק שאתה רוצה לראות ובחר כרטיס',
    icon: Search,
  },
  {
    number: 2,
    title: 'צור קשר עם המוכר',
    description: 'צור קשר ישיר בטלפון או בוואטסאפ',
    icon: Phone,
  },
  {
    number: 3,
    title: 'קבל את הכרטיס',
    description: 'תאם עם המוכר את העברת הכרטיס',
    icon: Ticket,
  },
  {
    number: 4,
    title: 'היכנס למשחק',
    description: 'הצג את הכרטיס בכניסה לאצטדיון ותיהנה!',
    icon: Trophy,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="pt-4">
      {/* Header */}
      <div className="flex items-center justify-center px-4 pb-4 border-b border-gray-100">
        <h1 className="text-lg font-bold">איך זה עובד?</h1>
        <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center absolute left-4" style={{ position: 'absolute', right: 16 }}>
          <span className="text-white text-sm">⚽</span>
        </div>
      </div>

      {/* Steps */}
      <div className="p-3">
        <h2 className="text-base font-bold text-right mb-3">4 צעדים פשוטים</h2>

        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.number}>
              <div className="flex bg-white rounded-xl overflow-hidden shadow-sm mb-1">
                {/* Accent bar */}
                <div className="w-1 bg-brand" />
                <div className="flex-1 flex items-center gap-3 p-4">
                  <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                    <Icon size={28} className="text-brand" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-lg font-bold">{step.title}</span>
                      <span className="text-[10px] font-bold bg-brand text-white px-2 py-0.5 rounded-full">
                        שלב {step.number}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <ChevronDown size={28} className="text-brand" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trust */}
      <div className="flex items-center justify-around bg-gray-50 mx-4 mb-4 p-4 rounded-2xl">
        <div className="flex flex-col items-center">
          <ShieldCheck size={24} className="text-brand" />
          <span className="text-[10px] font-semibold text-gray-600 mt-1">כרטיסים מאומתים</span>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex flex-col items-center">
          <Banknote size={24} className="text-brand" />
          <span className="text-[10px] font-semibold text-gray-600 mt-1">ללא עמלות</span>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex flex-col items-center">
          <Headphones size={24} className="text-brand" />
          <span className="text-[10px] font-semibold text-gray-600 mt-1">תמיכה 24/7</span>
        </div>
      </div>
    </div>
  );
}
