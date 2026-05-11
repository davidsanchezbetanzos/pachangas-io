"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";

interface Player {
  id: string;
  user_id: string;
  name: string;
  notes: string | null;
  is_guest: boolean;
  status: "main" | "substitute";
  position: number;
}

export async function joinMatch(
  matchId: string,
  userId: string,
  name: string,
  notes: string | null = null,
  isGuest: boolean = false,
  guestOf: string | null = null
) {
  const supabase = createServerClient();

  // Get current players
  const { data: currentPlayers } = await supabase
    .from("players")
    .select("id, user_id, status, position")
    .eq("match_id", matchId);

  const mainPlayers = (currentPlayers || []).filter(p => p.status === "main");
  const substitutePlayers = (currentPlayers || []).filter(p => p.status === "substitute");

  // Get match to check limit
  const { data: match } = await supabase
    .from("matches")
    .select("player_limit")
    .eq("id", matchId)
    .single();

  const isFull = match?.player_limit && mainPlayers.length >= match.player_limit;
  const status = isFull ? "substitute" : "main";
  const position = status === "main" ? mainPlayers.length + 1 : substitutePlayers.length + 1;

  // Check if already joined
  const existing = (currentPlayers || []).find(p => p.user_id === userId);
  if (existing) return { error: null };

  const { error } = await supabase.from("players").insert({
    match_id: matchId,
    user_id: userId,
    name,
    notes,
    is_guest: isGuest,
    guest_of: guestOf,
    status,
    position,
  });

  if (!error) {
    revalidatePath(`/partido/${matchId}`);
  }

  return { error };
}

export async function leaveMatch(matchId: string, userId: string) {
  const supabase = createServerClient();

  // Get player to check status
  const { data: player } = await supabase
    .from("players")
    .select("id, status")
    .eq("match_id", matchId)
    .eq("user_id", userId)
    .single();

  if (!player) return { error: null };

  // Delete player
  const { error } = await supabase
    .from("players")
    .delete()
    .eq("id", player.id);

  if (!error && player.status === "main") {
    // Promote first substitute to main
    const { data: firstSub } = await supabase
      .from("players")
      .select("id")
      .eq("match_id", matchId)
      .eq("status", "substitute")
      .order("position")
      .limit(1)
      .single();

    if (firstSub) {
      await supabase
        .from("players")
        .update({ status: "main" })
        .eq("id", firstSub.id);
    }

    revalidatePath(`/partido/${matchId}`);
  }

  return { error };
}