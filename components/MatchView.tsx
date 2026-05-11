"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlayerList } from "@/components/PlayerList";
import { JoinDialog } from "@/components/JoinDialog";
import { useSupabase } from "@/components/providers";
import { formatDate, formatTime, generateShareText, getWhatsAppUrl } from "@/lib/utils";
import { joinMatch, leaveMatch } from "@/components/actions";

interface MatchViewProps {
  match: {
    id: string;
    creator_id: string;
    title: string;
    description: string | null;
    location: string | null;
    map_url: string | null;
    match_date: string;
    player_limit: number | null;
    status: string;
  };
  players: {
    id: string;
    user_id: string;
    name: string;
    notes: string | null;
    is_guest: boolean;
    status: "main" | "substitute";
    created_at: string;
  }[];
  joinMatch: (
    matchId: string,
    userId: string,
    name: string,
    notes?: string | null,
    isGuest?: boolean,
    guestOf?: string | null
  ) => Promise<{ error: unknown }>;
  leaveMatch: (matchId: string, userId: string) => Promise<{ error: unknown }>;
}

export function MatchView({ match, players: initialPlayers, joinMatch, leaveMatch }: MatchViewProps) {
  const router = useRouter();
  const { userId } = useSupabase();
  const [players, setPlayers] = useState(initialPlayers);
  const [joinOpen, setJoinOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestNotes, setGuestNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const mainPlayers = players.filter((p) => p.status === "main");
  const substitutePlayers = players.filter((p) => p.status === "substitute");
  const isFull = match.player_limit !== null && mainPlayers.length >= match.player_limit;
  const currentUser = players.find((p) => p.user_id === userId);

  const handleJoin = async (name: string, notes: string) => {
    if (!userId) return;
    setLoading(true);
    try {
      await joinMatch(match.id, userId, name, notes || null);
      router.refresh();
      setJoinOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await leaveMatch(match.id, userId);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleInviteGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !guestName.trim()) return;
    setLoading(true);
    try {
      await joinMatch(
        match.id,
        `${userId}_guest_${Date.now()}`,
        guestName.trim(),
        guestNotes.trim() || null,
        true,
        userId
      );
      setGuestName("");
      setGuestNotes("");
      setGuestOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
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

  return (
    <div>
      <Button
        onClick={() => router.push("/")}
        variant="ghost"
        size="sm"
        className="mb-4"
      >
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
            <Button onClick={handleLeave} variant="destructive" className="flex-1" disabled={loading}>
              {loading ? "..." : "Desapuntarse"}
            </Button>
            <Button
              onClick={() => setGuestOpen(true)}
              variant="secondary"
              className="flex-1"
              disabled={loading}
            >
              + Invitar
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setJoinOpen(true)}
            className="w-full"
            size="lg"
            disabled={loading}
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
              <Button
                type="button"
                onClick={() => setGuestOpen(false)}
                variant="ghost"
                size="sm"
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
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