import { createServerClient } from "@/lib/supabase-server";
import { MatchList } from "@/components/MatchList";

export const dynamic = "force-dynamic";

interface Match {
  id: string;
  creator_id: string;
  title: string;
  location: string | null;
  map_url: string | null;
  match_date: string;
  player_limit: number | null;
  status: string;
}

interface PlayerCount {
  mainCount: number;
  substituteCount: number;
}

async function getMatches(): Promise<Match[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("matches")
    .select("*")
    .order("match_date", { ascending: true });
  return (data || []) as Match[];
}

async function getPlayersByMatch(matchIds: string[]) {
  if (matchIds.length === 0) return {};
  const supabase = createServerClient();
  const { data } = await supabase
    .from("players")
    .select("match_id, user_id, status")
    .in("match_id", matchIds);

  // grouped: { [matchId]: { userIds: Set<string>, counts: {...} } }
  const result: Record<string, { userIds: string[]; mainCount: number; substituteCount: number }> = {};
  matchIds.forEach((id) => {
    result[id] = { userIds: [], mainCount: 0, substituteCount: 0 };
  });

  (data || []).forEach((p) => {
    if (result[p.match_id]) {
      result[p.match_id].userIds.push(p.user_id);
      if (p.status === "main") result[p.match_id].mainCount++;
      else if (p.status === "substitute") result[p.match_id].substituteCount++;
    }
  });

  return result;
}

export default async function HomePage() {
  const matches = await getMatches();
  const playersData = await getPlayersByMatch(matches.map((m) => m.id));

  return <MatchList initialMatches={matches} initialPlayersData={playersData} />;
}