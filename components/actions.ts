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

export async function deleteMatch(matchId: string, userId: string): Promise<{ error: unknown }> {
  if (!userId) return { error: "No user ID" };
  const supabase = createServerClient();
  const { data: match, error: fetchError } = await supabase
    .from("matches").select("creator_id").eq("id", matchId).single();
  if (fetchError || !match) return { error: "Partido no encontrado" };
  if (match.creator_id !== userId) return { error: "No autorizado" };
  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) return { error };
  revalidatePath("/");
  return { error: null };
}

export async function updateMatch(
  matchId: string, userId: string,
  data: { title: string; description: string | null; location: string | null; mapUrl: string | null; matchDate: string; matchTime: string; playerLimit: number | null }
): Promise<{ error: unknown }> {
  if (!userId) return { error: "No user ID" };
  const supabase = createServerClient();
  const { data: match, error: fetchError } = await supabase
    .from("matches").select("creator_id").eq("id", matchId).single();
  if (fetchError || !match) return { error: "Partido no encontrado" };
  if (match.creator_id !== userId) return { error: "No autorizado" };
  const matchDateTime = `${data.matchDate}T${data.matchTime}:00`;
  const { error } = await supabase.from("matches").update({
    title: data.title, description: data.description, location: data.location,
    map_url: data.mapUrl, match_date: matchDateTime, player_limit: data.playerLimit,
    updated_at: new Date().toISOString(),
  }).eq("id", matchId);
  if (error) return { error };
  revalidatePath(`/partido/${matchId}`);
  return { error: null };
}

export async function removeGuest(matchId: string, guestUserId: string, hostUserId: string): Promise<{ error: unknown }> {
  if (!guestUserId || !hostUserId) return { error: "IDs requeridos" };
  const supabase = createServerClient();
  const { data: player, error: fetchError } = await supabase
    .from("players").select("id, status, guest_of").eq("match_id", matchId).eq("user_id", guestUserId).single();
  if (fetchError || !player) return { error: "Jugador no encontrado" };
  if (player.guest_of !== hostUserId) return { error: "No autorizado" };
  const { error: deleteError } = await supabase.from("players").delete().eq("id", player.id);
  if (deleteError) return { error: deleteError };
  if (player.status === "main") {
    const { data: firstSub } = await supabase.from("players").select("id").eq("match_id", matchId)
      .eq("status", "substitute").order("position").limit(1).single();
    if (firstSub) await supabase.from("players").update({ status: "main" }).eq("id", firstSub.id);
  }
  revalidatePath(`/partido/${matchId}`);
  return { error: null };
}