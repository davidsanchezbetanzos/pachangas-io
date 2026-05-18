import type { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient();

  const { data: matches } = await supabase
    .from("matches")
    .select("id, updated_at")
    .eq("status", "open")
    .order("updated_at", { ascending: false });

  const matchEntries: MetadataRoute.Sitemap = (matches || []).map((m) => ({
    url: `https://pachangas.top/partido/${m.id}`,
    lastModified: m.updated_at ? new Date(m.updated_at) : new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: "https://pachangas.top",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...matchEntries,
  ];
}