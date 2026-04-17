import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ticketil.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/games`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/sell`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/how-it-works`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/support`, changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];
    const { data: events } = await supabase
      .from("events")
      .select("id, date")
      .eq("status", "upcoming")
      .gte("date", today)
      .order("date", { ascending: true })
      .limit(200);

    const dynamicRoutes: MetadataRoute.Sitemap = (events || []).map(
      (e: { id: string; date: string }) => ({
        url: `${SITE_URL}/games/${e.id}`,
        lastModified: new Date(e.date),
        changeFrequency: "daily" as const,
        priority: 0.7,
      }),
    );

    return [...staticRoutes, ...dynamicRoutes];
  } catch {
    return staticRoutes;
  }
}
