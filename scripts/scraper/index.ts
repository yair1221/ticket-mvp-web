import { fetchScoresHtml } from "./fetch";
import { parseMatches } from "./parse";
import { upsertMatches } from "./upsert";

function filterFuture(matches: Awaited<ReturnType<typeof parseMatches>>) {
  const today = new Date().toISOString().slice(0, 10);
  return matches.filter((m) => m.date >= today);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const html = await fetchScoresHtml();
  const all = parseMatches(html);
  const future = filterFuture(all);

  console.log(`Parsed ${all.length} total, ${future.length} upcoming`);

  if (dryRun) {
    console.log(JSON.stringify(future, null, 2));
    return;
  }

  const { upserted } = await upsertMatches(future);
  console.log(`Upserted ${upserted} rows to events`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
