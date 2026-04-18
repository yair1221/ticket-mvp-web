import { createClient } from "@supabase/supabase-js";
import { getTeam } from "../../src/lib/constants/teams";
import type { ScrapedMatch } from "./parse";

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
    city: getTeam(m.homeTeam)?.city ?? "",
    status: "upcoming" as const,
  }));

  const { data, error } = await supabase
    .from("events")
    .upsert(rows, { onConflict: "external_id" })
    .select("id");

  if (error) throw error;
  return { upserted: data?.length ?? 0 };
}
