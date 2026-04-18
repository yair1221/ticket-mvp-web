'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import SiteLogo from '@/components/shared/SiteLogo';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="pt-4 pb-10">
      <div className="flex items-center justify-between px-4 pb-4 border-b border-slate-200">
        <button
          onClick={() => router.back()}
          className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-brand" />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">מדיניות פרטיות</h1>
        <Link href="/">
          <SiteLogo />
        </Link>
      </div>

      <div className="bg-slate-50 p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center mx-auto mb-3">
          <ShieldCheck size={28} className="text-white" />
        </div>
        <p className="text-sm font-bold text-brand mb-1">עודכן לאחרונה: אפריל 2026</p>
        <p className="text-sm text-slate-600 leading-relaxed">
          מדיניות הפרטיות מתארת איזה מידע נאסף, למה, כמה זמן הוא נשמר, ואיך ניתן למחוק אותו.
        </p>
      </div>

      <div className="px-4 py-5 space-y-5 text-right text-sm text-slate-700 leading-7">
        <section>
          <h2 className="text-base font-bold mb-2">1. מי אנחנו</h2>
          <p>
            TicketIL (&quot;האפליקציה&quot;, &quot;אנחנו&quot;) היא פלטפורמה לחיבור בין מוכרי כרטיסים לקונים
            למשחקי ליגת העל בכדורגל. האפליקציה פועלת בישראל וכפופה לחוק הגנת הפרטיות, התשמ&quot;א-1981.
            השימוש מותר מגיל 18 בלבד; איננו אוספים במודע מידע מקטינים. אם הגעת למידע שנאסף מקטין,
            פנה אלינו ונמחק אותו מיידית.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">2. מידע שנאסף</h2>
          <ul className="list-disc pr-5 space-y-1">
            <li>מספר טלפון (לאימות זהות דרך SMS OTP).</li>
            <li>שם פרטי ושם משפחה (מוצגים למוכר/קונה לצורך יצירת אמון).</li>
            <li>פרטי כרטיס שפרסמת (משחק, יציע, שורה, כסא, מחיר, הערות).</li>
            <li>נתוני שימוש אנונימיים (PostHog): דפים שביקרת בהם, לחיצות, מכשיר.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">3. למה אנחנו משתמשים במידע</h2>
          <ul className="list-disc pr-5 space-y-1">
            <li>לאימות זהות ומניעת הונאה.</li>
            <li>להצגת הכרטיסים שפרסמת לקונים פוטנציאליים.</li>
            <li>לאפשר יצירת קשר דרך WhatsApp (מספר הטלפון משמש בקישור).</li>
            <li>לשיפור השירות וניתוח שימוש מצטבר.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">4. שיתוף עם צדדים שלישיים</h2>
          <p>אנחנו לא מוכרים את המידע שלך. שימוש בשירותים חיצוניים:</p>
          <ul className="list-disc pr-5 space-y-1 mt-1">
            <li><strong>Supabase</strong> — אחסון נתונים ואימות זהות (SMS OTP), מאומת SOC 2. מספר הטלפון נשלח ל-Supabase Auth רק לצורך שליחת קוד אימות חד-פעמי.</li>
            <li><strong>PostHog</strong> — אנליטיקה (שרתי EU, תואם GDPR).</li>
            <li><strong>WhatsApp</strong> — כשאתה לוחץ &quot;צור קשר&quot;, מועבר קישור עם שם המוכר והקבוצות. המידע יוצא מהאפליקציה ומנוהל על ידי Meta.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">5. עוגיות (Cookies)</h2>
          <p>
            אנחנו משתמשים בעוגיות הכרחיות לתפקוד (session של Supabase) ובעוגיות אנליטיקה (PostHog).
            אין עוגיות שיווק של צד שלישי.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">6. שמירה ומחיקה</h2>
          <p>
            הנתונים נשמרים כל עוד החשבון שלך פעיל. אפשר לבקש מחיקה מלאה של החשבון והנתונים דרך
            <Link href="/support" className="text-brand font-semibold"> עמוד התמיכה</Link> —
            המחיקה תתבצע תוך 7 ימי עסקים.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">7. הזכויות שלך</h2>
          <ul className="list-disc pr-5 space-y-1">
            <li>זכות עיון במידע שנאסף.</li>
            <li>זכות לתיקון מידע שגוי.</li>
            <li>זכות למחיקה.</li>
            <li>זכות להתנגד לעיבוד מידע.</li>
            <li>
              זכות להגיש תלונה לרשות להגנת הפרטיות במשרד המשפטים אם אתה סבור
              שהפרנו את חוק הגנת הפרטיות.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">8. אבטחה</h2>
          <p>
            כל התקשורת מוצפנת ב-HTTPS. גישה למסד הנתונים מוגנת ב-Row Level Security של Supabase.
            מספרי טלפון לא מוצגים פומבית — רק שם המוכר נחשף לקונים.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">9. יצירת קשר</h2>
          <p>
            שאלות לגבי המדיניות?{' '}
            <Link href="/support" className="text-brand font-semibold">
              פנה אלינו
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
