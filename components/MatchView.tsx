"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlayerList } from "@/components/PlayerList";
import { JoinDialog } from "@/components/JoinDialog";
import { EditMatchForm } from "@/components/EditMatchForm";
import { useSupabase } from "@/components/providers";
import { formatDate, formatTime, getWhatsAppUrl } from "@/lib/utils";
import { formatDate, formatTime, getWhatsAppUrl } from "@/lib/utils";

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
  joinMatch: (matchId: string, userId: string, name: string, notes?: string | null, isGuest?: boolean, guestOf?: string | null) => Promise<{ error: unknown }>;
  leaveMatch: (matchId: string, userId: string) => Promise<{ error: unknown }>;
  deleteMatch: (matchId: string, userId: string) => Promise<{ error: unknown }>;
  updateMatch: (matchId: string, userId: string, data: { title: string; description: string | null; location: string | null; mapUrl: string | null; matchDate: string; matchTime: string; playerLimit: number | null }) => Promise<{ error: unknown }>;
}

export function MatchView({ match, players: serverPlayers, joinMatch: doJoin, leaveMatch: doLeave, deleteMatch: doDelete, updateMatch: doUpdate }: MatchViewProps) {
  const router = useRouter();
  const { userId } = useSupabase();
  const [players, setPlayers] = useState(serverPlayers);
  const [joinOpen, setJoinOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestNotes, setGuestNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState("");

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
      const { error } = await doJoin(match.id, userId, name, notes || null);
      if (error) { setActionError("Error al apuntarse. Intenta de nuevo."); return; }
      setJoinOpen(false);
      router.refresh();
    } finally { setLoading(false); }
  };

  const handleLeave = async () => {
    if (!userId) return;
    setLoading(true);
    setActionError("");
    try {
      const { error } = await doLeave(match.id, userId);
      if (error) { setActionError("Error al desapuntarse."); return; }
      router.refresh();
    } finally { setLoading(false); }
  };

  const handleInviteGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !guestName.trim()) return;
    setLoading(true);
    setActionError("");
    try {
      const guestUserId = crypto.randomUUID();
      const { error } = await doJoin(match.id, guestUserId, guestName.trim(), guestNotes.trim() || null, true, userId);
      if (error) { setActionError("Error al invitar."); return; }
      setGuestName(""); setGuestNotes(""); setGuestOpen(false);
      router.refresh();
    } finally { setLoading(false); }
  };

  const handleShare = () => {
    const text = `⚽ *${match.title}*\n📅 ${formatDate(match.match_date)} a las ${formatTime(match.match_date)}\n${match.location ? `📍 ${match.location}\n` : ""}👥 ${mainPlayers.length} jugadores${substitutePlayers.length > 0 ? ` (+${substitutePlayers.length} en espera)` : ""}\n\n${window.location.origin}/partido/${match.id}`;
    window.open(getWhatsAppUrl(text), "_blank");
  };

  const isCreator = userId === match.creator_id;

  const handleDelete = async () => {
    if (!userId) return;
    setLoading(true);
    const { error } = await doDelete(match.id, userId);
    if (!error) router.push("/");
    else setActionError("Error al eliminar");
    setLoading(false);
  };

  const handleEdit = async (data: { title: string; description: string | null; location: string | null; mapUrl: string | null; matchDate: string; matchTime: string; playerLimit: number | null }) => {
    if (!userId) return;
    setLoading(true);
    const { error } = await doUpdate(match.id, userId, data);
    if (!error) { setEditOpen(false); router.refresh(); }
    else setActionError("Error al guardar");
    setLoading(false);
  };

  const matchUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/partido/${match.id}`;

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="mb-4 inline-flex items-center gap-1 rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-800/50 hover:text-zinc-200"
      >
        ← Volver
      </button>

      {/* Match info card */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h1 className="text-xl font-bold italic text-zinc-100">{match.title}</h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-zinc-400">
          <span>{formatDate(match.match_date)}</span>
          <span className="text-zinc-700">·</span>
          <span>{formatTime(match.match_date)}</span>
        </div>
        {match.location && (
          <div className="mt-1 text-sm text-zinc-500">Ubicación: {match.location}</div>
        )}
        {match.map_url && (
          <a href={match.map_url} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm text-green-500 hover:underline">
            Ver en Maps →
          </a>
        )}
        {match.description && (
          <p className="mt-3 text-sm text-zinc-500 leading-relaxed">{match.description}</p>
        )}

        {/* WhatsApp + URL */}
        <div className="mt-4 space-y-2">
          <button
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366]/10 px-4 py-2.5 text-sm font-medium text-[#25D366] transition-colors hover:bg-[#25D366]/20 border border-[#25D366]/20"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Compartir por WhatsApp
          </button>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={matchUrl}
              className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={() => navigator.clipboard.writeText(matchUrl)}
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              Copiar
            </button>
          </div>
        </div>
      </div>

      {/* Edit form */}
      {editOpen && (
        <div className="mb-6">
          <EditMatchForm
            initial={match}
            onSubmit={handleEdit}
            onCancel={() => setEditOpen(false)}
          />
        </div>
      )}

      {/* Creator actions */}
      {isCreator && !editOpen && (
        <div className="mb-4 flex gap-2">
          <button onClick={() => setEditOpen(true)} className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors">
            ✎ Editar
          </button>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} className="rounded-md border border-red-800/40 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/30 transition-colors">
              🗑 Eliminar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">¿Confirmar?</span>
              <button onClick={handleDelete} disabled={loading} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500">
                Sí, eliminar
              </button>
              <button onClick={() => setConfirmDelete(false)} className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800">
                No
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {actionError && (
        <div className="mb-4 rounded-md bg-red-950/30 border border-red-800/50 p-3 text-sm text-red-400">
          {actionError}
        </div>
      )}

      {/* Action buttons */}
      <div className="mb-6 space-y-3">
        {currentUser ? (
          <div className="flex gap-2">
            <Button onClick={handleLeave} variant="destructive" disabled={loading} className="flex-1">
              {loading ? "..." : "Desapuntarse"}
            </Button>
            <Button onClick={() => setGuestOpen(true)} variant="secondary" disabled={loading} className="flex-1">
              + Invitar amigo
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setJoinOpen(true)}
            disabled={loading}
            className="w-full bg-green-600 font-semibold text-white hover:bg-green-500"
          >
            {isFull ? "Entrar en Lista de Espera" : "Apuntarse"}
          </Button>
        )}
      </div>

      {/* Guest form */}
      {guestOpen && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-300">Invitar a un amigo</h3>
          <form onSubmit={handleInviteGuest} className="space-y-3">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Nombre del invitado"
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500"
              required
            />
            <input
              type="text"
              value={guestNotes}
              onChange={(e) => setGuestNotes(e.target.value)}
              placeholder="Notas (opcional)"
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setGuestOpen(false)} className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800">
                Cancelar
              </button>
              <Button type="submit" disabled={loading} className="bg-green-600 font-semibold text-white hover:bg-green-500">
                Invitar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Player table */}
      <PlayerList
        mainPlayers={mainPlayers}
        substitutePlayers={substitutePlayers}
        currentUserId={userId}
      />

      {/* Join dialog */}
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