'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Info, Tag, ArrowLeftRight, XCircle, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import SiteLogo from '@/components/shared/SiteLogo';

const sections = [
  {
    icon: <Info size={20} />,
    title: 'מבוא והגדרות',
    content: 'Ticketil היא פלטפורמה המקשרת בין מוכרי כרטיסים לספורט לבין קונים פוטנציאליים. האתר אינו מבצע עסקאות ואינו אחראי לתשלומים בין הצדדים.',
  },
  {
    icon: <Tag size={20} />,
    title: 'כללי קנייה ומכירה',
    content: '• איסור ספסרות: חל איסור מוחלט למכור כרטיס במחיר הגבוה מהמחיר הנקוב.\n\n• אמינות הכרטיס: המוכר מתחייב כי הכרטיס שברשותו תקף ומקורי.\n\n• העברת כרטיס: העברת הכרטיס מתבצעת ישירות בין המוכר לקונה.\n\n• אחריות: המוכר אחראי באופן מלא לתקינות הכרטיס.',
  },
  {
    icon: <ArrowLeftRight size={20} />,
    title: 'תשלומים ועמלות',
    content: 'Ticketil אינה גובה עמלות על פרסום או מכירת כרטיסים. התשלום מתבצע ישירות בין הקונה למוכר.',
  },
  {
    icon: <XCircle size={20} />,
    title: 'ביטולים והחזרים',
    content: 'ביטולים והחזרים מתבצעים ישירות בין הקונה למוכר. Ticketil אינה אחראית על תהליכי ביטול או החזרים.',
  },
];

export default function TermsPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(1);

  return (
    <div className="pt-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-100">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <ArrowLeft size={16} className="text-brand" />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">תקנון שימוש</h1>
        <Link href="/"><SiteLogo /></Link>
      </div>

      {/* Intro */}
      <div className="bg-gray-50 p-4 text-center">
        <p className="text-sm font-bold text-brand mb-3">עודכן לאחרונה: ינואר 2024</p>
        <p className="text-sm text-gray-600 leading-relaxed">
          ברוכים הבאים לפלטפורמת הכרטיסים המאובטחת של אוהדי הספורט בישראל. השימוש באפליקציה כפוף לתנאים המפורטים להלן.
        </p>
      </div>

      {/* Sections */}
      <div className="p-4 space-y-2">
        {sections.map((sec, i) => (
          <button
            key={i}
            onClick={() => setExpanded(expanded === i ? null : i)}
            className={`w-full text-right bg-white rounded-xl p-4 border transition-colors ${
              expanded === i ? 'border-brand border-1.5' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-brand">{sec.icon}</span>
                <span className="text-base font-bold">{sec.title}</span>
              </div>
              {expanded === i ? (
                <ChevronUp size={20} className="text-gray-400" />
              ) : (
                <ChevronDown size={20} className="text-gray-400" />
              )}
            </div>
            {expanded === i && (
              <p className="text-sm text-gray-600 leading-7 mt-3 pt-3 border-t border-gray-100 whitespace-pre-line">
                {sec.content}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="px-4 pb-4">
        <h3 className="text-base font-bold text-right mb-2">יצירת קשר ודיווח</h3>
        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            נתקלתם בבעיה? יש לכם שאלה לגבי התקנון? צוות התמיכה שלנו זמין עבורכם.
          </p>
          <Link
            href="/support"
            className="w-full bg-brand text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors"
          >
            <Mail size={20} />
            <span>שלח פנייה לתמיכה</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
