import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { MatchView } from "@/components/MatchView";
import { joinMatch, leaveMatch, deleteMatch, updateMatch } from "@/components/actions";

interface Match {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  location: string | null;
  map_url: string | null;
  match_date: string;
  player_limit: number | null;
  status: string;
}

interface Player {
  id: string;
  user_id: string;
  name: string;
  notes: string | null;
  is_guest: boolean;
  guest_of: string;
  status: "main" | "substitute";
  created_at: string;
}

async function getMatch(id: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .single();
  return data as Match | null;
}

async function getPlayers(matchId: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("match_id", matchId)
    .order("position");
  return (data || []) as Player[];
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [match, players] = await Promise.all([
    getMatch(id),
    getPlayers(id)
  ]);

  if (!match) {
    notFound();
  }

  return (
    <MatchView
      match={match}
      players={players}
      joinMatch={joinMatch}
      leaveMatch={leaveMatch}
      deleteMatch={deleteMatch}
      updateMatch={updateMatch}
    />
  );
}