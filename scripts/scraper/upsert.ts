import { createClient } from "@supabase/supabase-js";
import type { ScrapedMatch } from "./parse";

function teamCity(team: string): string {
  const map: Record<string, string> = {
    'הפועל ב"ש': "באר שבע",
    'הפועל פ"ת': "פתח תקווה",
    'הפועל ת"א': "תל אביב",
    'מכבי ת"א': "תל אביב",
    'בית"ר י-ם': "ירושלים",
    "מכבי חיפה": "חיפה",
    "הפועל חיפה": "חיפה",
    "מכבי בני ריינה": "ריינה",
    "עירוני טבריה": "טבריה",
    'הפועל ק"ש': "קריית שמונה",
    "מכבי נתניה": "נתניה",
    "אשדוד": "אשדוד",
    'מ.ס אשדוד': "אשדוד",
    "בני סכנין": "סכנין",
    "הפועל ירושלים": "ירושלים",
  };
  return map[team] ?? "";
}

export async function upsertMatches(matches: ScrapedMatch[]) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const rows = matches.map((m) => ({
    external_id: m.externalId,
    home_team: m.homeTeam,
    away_team: m.awayTeam,
    date: m.date,
    time: m.time,
    stadium: m.stadium,
    city: teamCity(m.homeTeam),
    status: "upcoming" as const,
  }));

  const { data, error } = await supabase
    .from("events")
    .upsert(rows, { onConflict: "external_id" })
    .select("id");

  if (error) throw error;
  return { upserted: data?.length ?? 0 };
}
