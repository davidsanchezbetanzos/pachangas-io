"use client";

import { useEffect, useState, useCallback } from "react";
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

export function MatchView({ match, players: serverPlayers, joinMatch, leaveMatch }: MatchViewProps) {
  const router = useRouter();
  const { userId } = useSupabase();
  const [players, setPlayers] = useState(serverPlayers);
  const [joinOpen, setJoinOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestNotes, setGuestNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Sincroniza las props del servidor con el estado local
  useEffect(() => {
    setPlayers(serverPlayers);
  }, [serverPlayers]);

  const mainPlayers = players.filter((p) => p.status === "main");
  const substitutePlayers = players.filter((p) => p.status === "substitute");
  const isFull = match.player_limit !== null && mainPlayers.length >= match.player_limit;
  const currentUser = players.find((p) => p.user_id === userId);

  const handleJoin = async (name: string, notes: string) => {
    if (!userId) return;
    setLoading(true);
    setActionError("");
    try {
      const { error } = await joinMatch(match.id, userId, name, notes || null);
      if (error) {
        setActionError("Error al apuntarse. Intenta de nuevo.");
        return;
      }
      // Cerrar el diálogo y refrescar
      setJoinOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!userId) return;
    setLoading(true);
    setActionError("");
    try {
      const { error } = await leaveMatch(match.id, userId);
      if (error) {
        setActionError("Error al desapuntarse. Intenta de nuevo.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleInviteGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !guestName.trim()) return;
    setLoading(true);
    setActionError("");
    try {
      const guestUserId = crypto.randomUUID();
      const { error } = await joinMatch(
        match.id,
        guestUserId,
        guestName.trim(),
        guestNotes.trim() || null,
        true,
        userId
      );
      if (error) {
        setActionError("Error al invitar. Intenta de nuevo.");
        return;
      }
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

      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h1 className="mb-3 text-xl font-bold italic text-card-foreground">{match.title}</h1>
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <span>📅 {formatDate(match.match_date)}</span>
          <span>🕐 {formatTime(match.match_date)}</span>
        </div>
        {match.location && (
          <div className="mb-2 text-sm text-muted-foreground">
            📍 {match.location}
          </div>
        )}
        {match.map_url && (
          <a
            href={match.map_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-2 block text-sm text-primary hover:underline"
          >
            📍 Ver en Maps
          </a>
        )}
        {match.description && (
          <p className="mt-3 text-sm text-muted-foreground">{match.description}</p>
        )}
        <div className="mt-4 space-y-2">
          <Button onClick={handleShare} size="sm">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </Button>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/partido/${match.id}`}
              className="flex-1 rounded border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const url = `${window.location.origin}/partido/${match.id}`;
                navigator.clipboard.writeText(url);
              }}
            >
              Copiar
            </Button>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="mb-4 rounded bg-destructive/10 p-3 text-sm text-destructive">
          {actionError}
        </div>
      )}

      <div className="mb-6 space-y-3">
        {currentUser ? (
          <div className="flex gap-2">
            <Button onClick={handleLeave} variant="destructive" disabled={loading}>
              {loading ? "..." : "Desapuntarse"}
            </Button>
            <Button
              onClick={() => setGuestOpen(true)}
              variant="secondary"
              disabled={loading}
            >
              + Invitar amigo
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setJoinOpen(true)}
            size="lg"
            disabled={loading}
            className="w-full"
          >
            {isFull ? "Entrar en Lista de Espera" : "Apuntarse"}
          </Button>
        )}
      </div>

      {guestOpen && (
        <div className="mb-6 rounded-xl bg-secondary p-4">
          <h3 className="mb-3 font-semibold">Invitar a un amigo</h3>
          <form onSubmit={handleInviteGuest} className="space-y-3">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Nombre del invitado"
              className="w-full rounded border border-border px-3 py-2"
              required
            />
            <input
              type="text"
              value={guestNotes}
              onChange={(e) => setGuestNotes(e.target.value)}
              placeholder="Notas (opcional)"
              className="w-full rounded border border-border px-3 py-2"
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