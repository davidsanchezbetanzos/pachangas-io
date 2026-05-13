"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";

export async function joinMatch(
  matchId: string,
  userId: string,
  name: string,
  notes: string | null = null,
  isGuest: boolean = false,
  guestOf: string | null = null
): Promise<{ error: unknown }> {
  if (!userId) {
    return { error: "No user ID" };
  }
  
  const supabase = createServerClient();

  const { data: currentPlayers, error: fetchError } = await supabase
    .from("players")
    .select("id, user_id, status, position")
    .eq("match_id", matchId);

  if (fetchError) return { error: fetchError };

  const existing = (currentPlayers || []).find(p => p.user_id === userId);
  if (existing) return { error: null };

  const mainPlayers = (currentPlayers || []).filter(p => p.status === "main");
  const substitutePlayers = (currentPlayers || []).filter(p => p.status === "substitute");

  const { data: match } = await supabase
    .from("matches")
    .select("player_limit")
    .eq("id", matchId)
    .single();

  const isFull = match?.player_limit && mainPlayers.length >= match.player_limit;
  const status = isFull ? "substitute" : "main";
  const position = status === "main" ? mainPlayers.length + 1 : substitutePlayers.length + 1;

  const { error: insertError } = await supabase.from("players").insert({
    match_id: matchId,
    user_id: userId,
    name,
    notes,
    is_guest: isGuest,
    guest_of: guestOf,
    status,
    position,
  });

  if (insertError) return { error: insertError };

  revalidatePath(`/partido/${matchId}`);
  return { error: null };
}

export async function leaveMatch(matchId: string, userId: string): Promise<{ error: unknown }> {
  if (!userId) return { error: "No user ID" };

  const supabase = createServerClient();

  const { data: player, error: fetchError } = await supabase
    .from("players")
    .select("id, status")
    .eq("match_id", matchId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !player) return { error: null };

  const { error: deleteError } = await supabase
    .from("players")
    .delete()
    .eq("id", player.id);

  if (deleteError) return { error: deleteError };

  if (player.status === "main") {
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

  return { error: null };
}