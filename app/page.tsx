import { createServerClient } from "@/lib/supabase-server";
import { MatchList } from "@/components/MatchList";

async function getMatches() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("matches")
    .select("*")
    .eq("status", "open")
    .order("match_date", { ascending: true });
  return data || [];
}

async function getPlayerCounts(matchIds: string[]) {
  if (matchIds.length === 0) return {};
  const supabase = createServerClient();
  const { data } = await supabase
    .from("players")
    .select("match_id, status")
    .in("match_id", matchIds);

  const counts: Record<string, { mainCount: number; substituteCount: number }> = {};
  matchIds.forEach((id) => {
    counts[id] = { mainCount: 0, substituteCount: 0 };
  });
  
  data?.forEach((p) => {
    const count = counts[p.match_id];
    if (count) {
      if (p.status === "main") {
        count.mainCount++;
      } else if (p.status === "substitute") {
        count.substituteCount++;
      }
    }
  });
  
  return counts;
}

export default async function HomePage() {
  const matches = await getMatches();
  const counts = await getPlayerCounts(matches.map((m) => m.id));

  return <MatchList initialMatches={matches} initialCounts={counts} />;
}