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
  console.log("joinMatch called:", { matchId, userId, name, isGuest });
  
  if (!userId) {
    console.error("No userId provided");
    return { error: "No user ID" };
  }
  
  const supabase = createServerClient();

  try {
    // Get current players
    const { data: currentPlayers, error: fetchError } = await supabase
      .from("players")
      .select("id, user_id, status, position")
      .eq("match_id", matchId);

    if (fetchError) {
      console.error("Error fetching players:", fetchError);
      return { error: fetchError };
    }

    // Check if already joined
    const existing = (currentPlayers || []).find(p => p.user_id === userId);
    if (existing) {
      console.log("Player already joined");
      return { error: null };
    }

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

    console.log("Inserting player:", { status, position, isFull, limit: match?.player_limit });

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

    if (insertError) {
      console.error("Error inserting player:", insertError);
      return { error: insertError };
    }

    console.log("Player joined successfully");
    revalidatePath(`/partido/${matchId}`);
    return { error: null };
  } catch (err) {
    console.error("Unexpected error in joinMatch:", err);
    return { error: err };
  }
}

export async function leaveMatch(matchId: string, userId: string): Promise<{ error: unknown }> {
  console.log("leaveMatch called:", { matchId, userId });
  
  if (!userId) {
    return { error: "No user ID" };
  }

  const supabase = createServerClient();

  try {
    // Get player to check status
    const { data: player, error: fetchError } = await supabase
      .from("players")
      .select("id, status")
      .eq("match_id", matchId)
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching player:", fetchError);
      return { error: fetchError };
    }

    if (!player) {
      return { error: null };
    }

    // Delete player
    const { error: deleteError } = await supabase
      .from("players")
      .delete()
      .eq("id", player.id);

    if (deleteError) {
      console.error("Error deleting player:", deleteError);
      return { error: deleteError };
    }

    if (player.status === "main") {
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

    return { error: null };
  } catch (err) {
    console.error("Unexpected error in leaveMatch:", err);
    return { error: err };
  }
}