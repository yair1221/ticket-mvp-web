'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Phone, Ticket, Trophy, ShieldCheck, Banknote, Headphones, ChevronDown, ChevronUp, ShoppingCart, Tag } from 'lucide-react';
import SiteLogo from '@/components/shared/SiteLogo';
import { cn } from '@/lib/utils/cn';

const buyerSteps = [
  {
    number: 1,
    title: 'חפש משחק',
    description: 'בחר את המשחק שאתה רוצה לראות מתוך רשימת המשחקים הקרובים.',
    icon: Search,
  },
  {
    number: 2,
    title: 'בחר כרטיס',
    description: 'עיין בכרטיסים הזמינים, סנן לפי יציע ומצא את הכרטיס הטוב עבורך.',
    icon: Ticket,
  },
  {
    number: 3,
    title: 'צור קשר עם המוכר',
    description: 'לחץ על "צור קשר" ותועבר ישירות לוואטסאפ של המוכר לסגירת העסקה.',
    icon: Phone,
  },
  {
    number: 4,
    title: 'קבל את הכרטיס',
    description: 'סכמו על אופן ההעברה וקבל את הכרטיס. תהנה מהמשחק!',
    icon: Trophy,
  },
];

const sellerSteps = [
  {
    number: 1,
    title: 'בחר משחק',
    description: 'לחץ על "מכור" ובחר את המשחק שיש לך כרטיס אליו.',
    icon: Search,
  },
  {
    number: 2,
    title: 'הזן פרטי הכרטיס',
    description: 'מלא את פרטי הכרטיס שלך ואת המחיר המבוקש.',
    icon: Tag,
  },
  {
    number: 3,
    title: 'אמת את הזהות',
    description: 'התחבר עם מספר טלפון וקוד SMS.',
    icon: Phone,
  },
  {
    number: 4,
    title: 'קבל פניות',
    description: 'קונים יצרו איתך קשר ישירות בוואטסאפ. סגרו עסקה בקלות.',
    icon: ShoppingCart,
  },
];

const buyerFAQ = [
  {
    q: 'האם יש עמלה על רכישת כרטיס?',
    a: 'לא! TicketIL לא גובה עמלות. התשלום מתבצע ישירות בין הקונה למוכר.',
  },
  {
    q: 'איך מתבצע התשלום?',
    a: 'התשלום מתבצע ישירות בין הקונה למוכר בדרך שתסכמו ביניכם (העברה בנקאית, ביט, מזומן וכו\').',
  },
  {
    q: 'מה אם המוכר לא מגיב?',
    a: 'אם המוכר לא מגיב, תוכל לפנות לתמיכה שלנו או לחפש כרטיס ממוכר אחר.',
  },
  {
    q: 'האם אפשר לבטל עסקה?',
    a: 'ביטולים מתבצעים ישירות בין הקונה למוכר. TicketIL אינה אחראית על תהליכי ביטול.',
  },
];

const sellerFAQ = [
  {
    q: 'כמה כרטיסים אפשר לפרסם?',
    a: 'ניתן לפרסם עד 10 כרטיסים פעילים בו-זמנית.',
  },
  {
    q: 'מה המחיר המקסימלי?',
    a: 'המחיר המקסימלי הוא 5,000₪. חל איסור למכור במחיר גבוה מהמחיר הנקוב על הכרטיס.',
  },
  {
    q: 'מה קורה אחרי שהמשחק עובר?',
    a: 'כרטיסים של משחקים שכבר התקיימו לא יוצגו עוד לקונים באתר - הם פשוט לא יופיעו בחיפושים. אתה תמיד יכול להיכנס ל"הכרטיסים שלי" כדי לראות את ההיסטוריה שלך.',
  },
  {
    q: 'איך אני מסמן שכרטיס נמכר?',
    a: 'היכנס ל"הכרטיסים שלי" ולחץ על "סמן כנמכר". הכרטיס יוסר מהרשימה.',
  },
  {
    q: 'האם צריך להתחבר כדי לפרסם?',
    a: 'אתה יכול למלא את כל הפרטים בלי להתחבר. רק בלחיצה על "פרסם" תתבקש להזדהות עם מספר טלפון.',
  },
  {
    q: 'איך מעלים כרטיס, שלב אחר שלב?',
    a: '1. לחץ על "מכור" בתפריט התחתון.\n2. בחר את המשחק מתוך רשימת המשחקים הקרובים.\n3. מלא מחיר, יציע, שורה וכסא (שורה וכסא אופציונליים).\n4. לחץ "פרסם". אם עדיין לא התחברת - תועבר להזדהות בקוד SMS, והפרטים שמילאת יישמרו אוטומטית.\n5. אחרי ההזדהות הכרטיס יפורסם מיד ויופיע לקונים.',
  },
  {
    q: 'איך אני מוחק כרטיס שאני כבר לא רוצה למכור?',
    a: 'היכנס ל"הכרטיסים שלי" מהתפריט, מצא את הכרטיס ולחץ על "הסר". הכרטיס יוסר מיידית מהחיפושים. אם הכרטיס נמכר בפועל ואתה רוצה להשאיר אותו בהיסטוריה - השתמש ב"סמן כנמכר" במקום.',
  },
];

export default function HowItWorksPage() {
  const [tab, setTab] = useState<'buyer' | 'seller'>('buyer');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const steps = tab === 'buyer' ? buyerSteps : sellerSteps;
  const faq = tab === 'buyer' ? buyerFAQ : sellerFAQ;

  return (
    <div className="pt-4">
      {/* Header */}
      <div className="flex items-center justify-center px-4 pb-4 border-b border-slate-200">
        <h1 className="text-lg font-bold flex-1 text-center">איך זה עובד?</h1>
        <Link href="/"><SiteLogo /></Link>
      </div>

      {/* Tabs */}
      <div className="relative flex mx-4 mt-4 bg-slate-100 rounded-full p-1">
        {/* Sliding indicator */}
        <div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-in-out"
          style={{ left: tab === 'seller' ? '4px' : 'calc(50% + 0px)', right: tab === 'buyer' ? '4px' : 'calc(50% + 0px)' }}
        />
        <button
          onClick={() => { setTab('seller'); setOpenFAQ(null); }}
          className={cn(
            'relative z-10 flex-1 py-2.5 rounded-full text-sm font-bold transition-colors duration-300 flex items-center justify-center gap-1.5',
            tab === 'seller' ? 'text-brand' : 'text-slate-400'
          )}
        >
          <Tag size={16} />
          מוכרים
        </button>
        <button
          onClick={() => { setTab('buyer'); setOpenFAQ(null); }}
          className={cn(
            'relative z-10 flex-1 py-2.5 rounded-full text-sm font-bold transition-colors duration-300 flex items-center justify-center gap-1.5',
            tab === 'buyer' ? 'text-brand' : 'text-slate-400'
          )}
        >
          <ShoppingCart size={16} />
          קונים
        </button>
      </div>

      {/* Steps */}
      <div className="p-4">
        <h2 className="text-lg font-bold text-right mb-4">
          {tab === 'buyer' ? '4 צעדים לקניית כרטיס' : '4 צעדים למכירת כרטיס'}
        </h2>

        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.number}>
              <div className="flex items-center justify-end mb-2 pr-1">
                <span className="text-xs font-bold bg-brand text-white px-3 py-1 rounded-full">
                  שלב {step.number}
                </span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                    <Icon size={24} className="text-brand" />
                  </div>
                  <div className="flex-1 text-right">
                    <span className="text-base font-bold">{step.title}</span>
                    <p className="text-sm text-slate-500 leading-relaxed mt-0.5">{step.description}</p>
                  </div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-center py-1.5">
                  <ChevronDown size={28} className="text-brand" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="px-4 pb-4">
        <h2 className="text-base font-bold text-right mb-3">
          שאלות נפוצות {tab === 'buyer' ? 'לקונים' : 'למוכרים'}
        </h2>
        <div className="space-y-2">
          {faq.map((item, i) => (
            <button
              key={i}
              onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
              className={cn(
                'w-full text-right bg-white rounded-xl p-4 border transition-colors',
                openFAQ === i ? 'border-brand' : 'border-slate-200'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="shrink-0">
                  {openFAQ === i ? (
                    <ChevronUp size={18} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400" />
                  )}
                </div>
                <span className="text-sm font-bold flex-1">{item.q}</span>
              </div>
              {openFAQ === i && (
                <p className="text-sm text-slate-500 leading-7 mt-3 pt-3 border-t border-slate-100">
                  {item.a}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Trust */}
      <div className="flex items-center justify-around bg-slate-100 mx-4 mb-4 p-4 rounded-2xl">
        <div className="flex flex-col items-center">
          <ShieldCheck size={24} className="text-brand" />
          <span className="text-[10px] font-medium text-slate-600 mt-1">כרטיסים מאומתים</span>
        </div>
        <div className="w-px h-8 bg-gray-300" />
        <div className="flex flex-col items-center">
          <Banknote size={24} className="text-brand" />
          <span className="text-[10px] font-medium text-slate-600 mt-1">ללא עמלות</span>
        </div>
        <div className="w-px h-8 bg-gray-300" />
        <div className="flex flex-col items-center">
          <Headphones size={24} className="text-brand" />
          <span className="text-[10px] font-medium text-slate-600 mt-1">תמיכה 24/7</span>
        </div>
      </div>
    </div>
  );
}
