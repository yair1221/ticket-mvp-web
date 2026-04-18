const SCORES_URL = "https://www.football.co.il/scores/";

export async function fetchScoresHtml(): Promise<string> {
  const res = await fetch(SCORES_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      "Accept-Language": "he-IL,he;q=0.9,en;q=0.8",
    },
  });
  if (!res.ok) {
    throw new Error(`fetch failed: HTTP ${res.status}`);
  }
  return res.text();
}
