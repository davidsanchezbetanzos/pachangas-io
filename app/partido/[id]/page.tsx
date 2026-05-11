"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlayerList } from "@/components/PlayerList";
import { JoinDialog } from "@/components/JoinDialog";
import { useSupabase } from "@/components/providers";
import {
  formatDate,
  formatTime,
  generateShareText,
  getWhatsAppUrl,
} from "@/lib/utils";

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
  status: "main" | "substitute";
  created_at: string;
}

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const { supabase, userId } = useSupabase();
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinOpen, setJoinOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestNotes, setGuestNotes] = useState("");

  const matchId = params.id as string;

  useEffect(() => {
    if (matchId) loadMatch();
  }, [matchId]);

  const loadMatch = async () => {
    if (!supabase || !matchId) return;
    const { data: matchData } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();
    if (matchData) setMatch(matchData);
    const { data: playersData } = await supabase
      .from("players")
      .select("*")
      .eq("match_id", matchId)
      .order("position");
    if (playersData) setPlayers(playersData);
    setLoading(false);
  };

  const mainPlayers = players.filter((p) => p.status === "main");
  const substitutePlayers = players.filter((p) => p.status === "substitute");
  const isFull = match !== null && match.player_limit !== null && mainPlayers.length >= match.player_limit;
  const currentUser = players.find((p) => p.user_id === userId);
  const isCreator = match?.creator_id === userId;

  const handleJoin = async (name: string, notes: string) => {
    if (!supabase || !userId) return;
    const { data: existing } = await supabase
      .from("players")
      .select("id")
      .eq("match_id", matchId)
      .eq("user_id", userId)
      .single();
    if (existing) return;
    const isMatchFull =
      match !== null && match.player_limit !== null && mainPlayers.length >= match.player_limit;
    const status = isMatchFull ? "substitute" : "main";
    const position =
      status === "main"
        ? mainPlayers.length + 1
        : substitutePlayers.length + 1;
    await supabase.from("players").insert({
      match_id: matchId,
      user_id: userId,
      name,
      notes: notes || null,
      is_guest: false,
      status,
      position,
    });
    loadMatch();
  };

  const handleLeave = async () => {
    if (!supabase || !userId) return;
    await supabase.rpc("leave_match", {
      p_match_id: matchId,
      p_user_id: userId,
    });
    loadMatch();
  };

  const handleInviteGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !userId || !guestName.trim()) return;
    const isMatchFull =
      match !== null && match.player_limit !== null && mainPlayers.length >= match.player_limit;
    const status = isMatchFull ? "substitute" : "main";
    const position =
      status === "main"
        ? mainPlayers.length + 1
        : substitutePlayers.length + 1;
    await supabase.from("players").insert({
      match_id: matchId,
      user_id: `${userId}_guest_${Date.now()}`,
      name: guestName.trim(),
      notes: guestNotes.trim() || null,
      is_guest: true,
      guest_of: userId,
      status,
      position,
    });
    setGuestName("");
    setGuestNotes("");
    setGuestOpen(false);
    loadMatch();
  };

  const handleShare = () => {
    if (!match) return;
    const text = generateShareText(
      match.title,
      match.location || "",
      match.match_date,
      mainPlayers.length,
      substitutePlayers.length,
      `${window.location.origin}/partido/${match.id}`
    );
    window.open(getWhatsAppUrl(text), "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#25d366] border-t-transparent" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="py-12 text-center">
        <p className="text-[#737373]">Partido no encontrado</p>
        <Button onClick={() => router.push("/")} variant="link" className="mt-2">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button onClick={() => router.push("/")} variant="ghost" size="sm" className="mb-4">
        ← Volver
      </Button>

      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
        <h1 className="mb-2 text-xl font-bold">{match.title}</h1>
        <div className="mb-3 flex items-center gap-2 text-sm text-[#737373]">
          <span>📅 {formatDate(match.match_date)}</span>
          <span>🕐 {formatTime(match.match_date)}</span>
        </div>
        {match.location && (
          <div className="mb-2 text-sm text-[#737373]">
            📍 {match.location}
          </div>
        )}
        {match.map_url && (
          <a
            href={match.map_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-2 block text-sm text-[#25d366] hover:underline"
          >
            📍 Ver en Maps
          </a>
        )}
        {match.description && (
          <p className="mt-3 text-sm text-[#737373]">{match.description}</p>
        )}
        <div className="mt-4 flex gap-2">
          <Button onClick={handleShare} variant="outline" size="sm">
            📤 Compartir en WhatsApp
          </Button>
        </div>
      </div>

      <div className="mb-6">
        {currentUser ? (
          <div className="flex gap-2">
            <Button onClick={handleLeave} variant="destructive" className="flex-1">
              Desapuntarse
            </Button>
            <Button onClick={() => setGuestOpen(true)} variant="secondary" className="flex-1">
              + Invitar
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setJoinOpen(true)}
            className="w-full"
            size="lg"
          >
            {isFull ? "Entrar en Lista de Espera" : "Apuntarse"}
          </Button>
        )}
      </div>

      {guestOpen && (
        <div className="mb-6 rounded-xl bg-[#f4f4f4] p-4">
          <h3 className="mb-3 font-semibold">Invitar a un amigo</h3>
          <form onSubmit={handleInviteGuest} className="space-y-3">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Nombre del invitado"
              className="w-full rounded border border-[#e5e5e5] px-3 py-2"
              required
            />
            <input
              type="text"
              value={guestNotes}
              onChange={(e) => setGuestNotes(e.target.value)}
              placeholder="Notas (opcional)"
              className="w-full rounded border border-[#e5e5e5] px-3 py-2"
            />
            <div className="flex gap-2">
              <Button type="button" onClick={() => setGuestOpen(false)} variant="ghost" size="sm">
                Cancelar
              </Button>
              <Button type="submit" size="sm">
                Invitar
              </Button>
            </div>
          </form>
        </div>
      )}

      <PlayerList
        mainPlayers={mainPlayers}
        substitutePlayers={substitutePlayers}
        currentUserId={userId}
      />

      <JoinDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        onSubmit={handleJoin}
        playerLimit={match.player_limit}
        mainCount={mainPlayers.length}
        isFull={isFull}
      />
    </div>
  );
}