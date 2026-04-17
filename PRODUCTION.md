# TicketIL — Production Launch Checklist

מדריך השקה שמרכז את כל הפעולות שדורשות גישה לדשבורדים חיצוניים (לא קוד).

## 1. Supabase Dashboard

### Auth Rate Limits (קריטי — למנוע שימוש לרעה של SMS)
📍 כתובת ישירה: `https://supabase.com/dashboard/project/fhtwztcqtprxyzhsgrza/auth/rate-limits`

הגדר:
- **"Rate limit for sending OTPs"** → 3 per hour per phone
- **"Rate limit for token verifications"** → 5 per 5 minutes
- **"Rate limit for sign ups and sign ins"** → 30 per hour per IP

### SMS Provider (חובה — בלי זה OTP לא ישלח בפרודקשן)
📍 `https://supabase.com/dashboard/project/fhtwztcqtprxyzhsgrza/auth/providers`

1. פתח את **Phone**
2. בחר ספק — **Twilio** (הכי נפוץ) או **MessageBird**
3. ב-Twilio Console (`console.twilio.com`):
   - צור Account SID + Auth Token
   - קנה Messaging Service SID (בישראל ~$1/חודש + SMS fees)
   - הגדר Sender ID: `TicketIL`
4. הדבק את 3 הערכים במסך Supabase
5. לחץ **Save**
6. בדוק עם מספר אמיתי משלך לפני לאנץ׳

### Backups
📍 `https://supabase.com/dashboard/project/fhtwztcqtprxyzhsgrza/database/backups/scheduled`

1. ודא ש-Daily backups פעילים (בדיפולט בתוכניות בתשלום)
2. ב-Pro plan+ : הפעל **PITR (Point In Time Recovery)** — נותן שחזור לכל רגע ב-7 הימים האחרונים

### Migration — ✅ בוצע אוטומטית
- `support_messages` table + RLS → בוצע
- FK indexes על `listings.seller_id` + `support_messages.user_id` → בוצע
- `search_path` מקובע על `validate_listing` + `auto_close_listings` → בוצע

### Migration ידני נוסף (מומלץ אחרי לאנץ׳)
יש policies כפולות מ-2 ריצות setup שונות. זה לא שובר כלום אבל פוגע בביצועים בקנה מידה.
להריץ ידנית ב-SQL Editor (מומלץ אחרי גיבוי):
```sql
-- ראה סוף הקובץ: consolidate_rls_policies.sql
```
הקובץ נמצא ב-`supabase-migration-consolidate-rls.sql` בשורש הפרויקט.

## 2. Vercel

### Project Setup
1. ייבא את הריפו
2. Root Directory: `ticket-il`
3. Framework Preset: Next.js (מזוהה אוטומטית)
4. Region: `fra1` (מוגדר ב-`vercel.json`)

### Environment Variables (Production + Preview)
הוסף את כל המשתנים מ-`.env.example` עם ערכים אמיתיים:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SITE_URL` → `https://ticketil.com`
- `RESEND_API_KEY` (server-only)
- `SUPPORT_EMAIL_TO`
- `SUPPORT_EMAIL_FROM`

### Domain
1. `Settings → Domains` → הוסף `ticketil.com`
2. הגדר DNS ב-רשם הדומיין (A/CNAME)
3. Force HTTPS (דיפולט)

## 3. PostHog (EU region)

### Create Project
1. `https://eu.posthog.com` → New Project
2. שם: `TicketIL Production`
3. העתק את ה-key ל-`NEXT_PUBLIC_POSTHOG_KEY`

### Dashboards מומלצים
- **Funnel**: home_viewed → game_detail_viewed → whatsapp_click
- **Funnel**: sell_form_submitted → login_started → signup_completed → sell_form_success
- **Retention**: signup_completed → listing_created (7/30 ימים)
- **Error rate**: error_occurred (לפי where)

### Alerts
1. הגדר התראה ל-error_occurred > 10/שעה → Slack/Email
2. התראה ל-whatsapp_click drop > 50% בהשוואה לשבוע שעבר

## 4. Resend (Email לטופס תמיכה)

### שלב 1 — הרשמה + אימות דומיין
1. פתח חשבון ב-`https://resend.com` (חינם עד 3,000 מיילים/חודש)
2. `Domains → Add Domain` → הזן `ticketil.com`
3. Resend ייתן לך 3 DNS records להוסיף:

| Type  | Name | Value |
|-------|------|-------|
| TXT   | `@` | `v=spf1 include:_spf.resend.com ~all` |
| TXT   | `resend._domainkey` | (value מ-Resend — ארוך) |
| MX    | `send.ticketil.com` | `10 feedback-smtp.eu-west-1.amazonses.com` |

הוסף את ה-records בספק הדומיין (GoDaddy / Namecheap / Cloudflare). פרסום לוקח 1-24 שעות.

### שלב 2 — API key
1. `API Keys → Create API Key`
2. שם: `ticketil-production` | Permission: `Sending access` | Domain: `ticketil.com`
3. העתק את ה-key → הוסף ל-Vercel env כ-`RESEND_API_KEY`

### שלב 3 — ENV vars נוספים ב-Vercel
```
RESEND_API_KEY=re_xxxxxxxx
SUPPORT_EMAIL_FROM=noreply@ticketil.com
SUPPORT_EMAIL_TO=support@ticketil.com   # לאן יגיעו הפניות
```

### שלב 4 — בדיקה
מלא טופס ב-`/support` אחרי הדפלוי — האימייל צריך להגיע תוך שניות.
אם לא מגיע: בדוק `Resend Dashboard → Logs`.

## 5. Sentry (אופציונלי — מומלץ)

אם PostHog `error_occurred` לא מספיק:
1. `https://sentry.io` → New Next.js project
2. הרץ `npx @sentry/wizard@latest -i nextjs`
3. הגדר sourcemaps upload ב-CI

## 6. Uptime Monitoring

### BetterStack / UptimeRobot
1. הוסף monitor על `https://ticketil.com` — 1 דקה
2. הוסף monitor על `https://ticketil.com/api/support` (POST עם payload תקין — או HEAD על הדומיין)
3. חבר להתראות (SMS/Slack)

## 7. Legal (ישראל)

- [ ] עברו על `/terms` ו-`/privacy` עם עו"ד שמתמצא בחוק הגנת הפרטיות
- [ ] אם מעל 10,000 טלפונים במאגר → רישום ברשם מאגרי המידע
- [ ] ודא ש-Consent checkbox בטופס הרשמה פעיל (כבר מימשנו ב-`/login`)

## 8. DNS / Email deliverability

- [ ] SPF record של Resend
- [ ] DKIM records
- [ ] DMARC record: `v=DMARC1; p=none; rua=mailto:support@ticketil.com`

## 9. Pre-launch Smoke Test

הרץ ידנית לפני Go-Live:
- [ ] טוענים את `/` מ-Chrome + Safari mobile → RTL תקין
- [ ] זורמים ל-`/games/[id]` → לחיצה על WhatsApp פותחת שיחה
- [ ] מילוי טופס `/sell` + התחברות OTP עם טלפון אמיתי → listing נוצר
- [ ] סימון `נמכר` ב-`/my-listings` → הסטטוס משתנה
- [ ] שליחת טופס `/support` → מגיע אימייל ל-support@
- [ ] ניווט לעמוד שלא קיים → 404 מעוצב
- [ ] לחיצה על הוספת כרטיס 11 → trigger דוחה
- [ ] מחיר 5001 → trigger דוחה
- [ ] `/robots.txt` → תגובה תקינה
- [ ] `/sitemap.xml` → מכיל את כל המשחקים הקרובים
- [ ] `curl -I https://ticketil.com` → כל security headers (X-Frame-Options, CSP, HSTS)
- [ ] Lighthouse על `/` ו-`/games/[id]` → Performance, A11y, SEO > 90

## 10. Post-launch

- [ ] השבוע הראשון: בדוק PostHog errors פעם ביום
- [ ] חודש ראשון: בדוק query performance ב-Supabase → הוסף אינדקסים חסרים
- [ ] ניטור עלויות: Supabase, Vercel, PostHog quota, Resend emails/SMS

---

**הערת אבטחה:** אם פעם נזלג service_role key — מיד `Settings → API → Reset service role key` ב-Supabase ועדכן את כל הסביבות.
