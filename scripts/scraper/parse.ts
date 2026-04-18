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
};

function normalizeDate(raw: string): string | null {
  const match = raw.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
  if (!match) return null;
  const [, dd, mm, yy] = match;
  const yyyy = yy.length === 2 ? `20${yy}` : yy;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function normalizeTime(raw: string): string | null {
  const match = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function splitTeams(label: string): { home: string; away: string } | null {
  const parts = label.split(/\s*-\s*/);
  if (parts.length !== 2) return null;
  return { home: parts[0].trim(), away: parts[1].trim() };
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
        const date = normalizeDate(dateRaw);
        const normalizedTime = normalizeTime(time);
        if (!teams || !externalId || !date || !normalizedTime) return;

        matches.push({
          externalId,
          homeTeam: teams.home,
          awayTeam: teams.away,
          date,
          time: normalizedTime,
          stadium,
          round,
          league,
        });
      });
  });

  return matches;
}
