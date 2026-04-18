import * as cheerio from "cheerio";

export type ScrapedMatch = {
  externalId: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  stadium: string;
  round: number | null;
  league: string | null;
  dateIsRange: boolean;
  timeIsTbd: boolean;
};

const TIME_TBD_SENTINEL = "00:00";

function normalizeDate(raw: string): { date: string; isRange: boolean } | null {
  const trimmed = raw.trim();
  const m = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
  if (!m) return null;
  const dd = m[1]!;
  const mm = m[2]!;
  const yy = m[3]!;
  const yyyy = yy.length === 2 ? `20${yy}` : yy;
  const iso = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  const isRange = trimmed.length > m[0]!.length;
  return { date: iso, isRange };
}

function normalizeTime(raw: string): { time: string; isTbd: boolean } {
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return { time: TIME_TBD_SENTINEL, isTbd: true };
  return { time: `${m[1]!.padStart(2, "0")}:${m[2]!}`, isTbd: false };
}

function splitTeams(label: string): { home: string; away: string } | null {
  const parts = label.split(/ +- +/);
  if (parts.length !== 2) return null;
  return { home: parts[0]!.trim(), away: parts[1]!.trim() };
}

export function parseMatches(html: string): ScrapedMatch[] {
  const $ = cheerio.load(html);
  const matches: ScrapedMatch[] = [];
  const WINNER_LEAGUE_ID = "902";

  $(".games-round-container").each((_, container) => {
    const league = $(container).attr("data-league") ?? null;
    if (league !== WINNER_LEAGUE_ID) return;
    const round = Number($(container).attr("data-round")) || null;

    $(container)
      .find(".current-round-details-row")
      .each((_, row) => {
        const $row = $(row);
        const labels = $row.find("label.current-round-details-row-label");
        const dateRaw = $(labels[0]).text().trim();
        const time = $(labels[2]).text().trim();
        const teamsRaw = $(labels[3]).text().trim();
        const stadium = $(labels[labels.length - 1]).text().trim();

        const gameLink = $row.find("a[href^='/game/']").first().attr("href") ?? "";
        const externalId = gameLink.replace("/game/", "").replace(/\/$/, "");

        const teams = splitTeams(teamsRaw);
        const parsedDate = normalizeDate(dateRaw);
        const parsedTime = normalizeTime(time);
        if (!teams || !externalId || !parsedDate) return;

        matches.push({
          externalId,
          homeTeam: teams.home,
          awayTeam: teams.away,
          date: parsedDate.date,
          time: parsedTime.time,
          stadium,
          round,
          league,
          dateIsRange: parsedDate.isRange,
          timeIsTbd: parsedTime.isTbd,
        });
      });
  });

  return matches;
}
