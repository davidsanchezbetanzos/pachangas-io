"use client";

import { cn } from "@/lib/utils";

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

interface PlayerListProps {
  mainPlayers: Player[];
  substitutePlayers: Player[];
  currentUserId?: string;
  onRemoveGuest?: (guestUserId: string) => void;
}

function formatJoined(date: string): string {
  const d = new Date(date);
  return d.toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PlayerRow({ player, index, isMain, isCurrentUser, canRemove, onRemove }: {
  player: Player;
  index: number;
  isMain: boolean;
  isCurrentUser: boolean;
  canRemove: boolean;
  onRemove?: (guestUserId: string) => void;
}) {
  return (
    <tr
      className={cn(
        "border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/30",
        isCurrentUser && "bg-green-950/20 hover:bg-green-950/30"
      )}
    >
      <td className="py-2.5 pr-2 text-center">
        <span
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
            isMain
              ? "bg-green-700 text-green-100"
              : "bg-zinc-800 text-zinc-400"
          )}
        >
          {index + 1}
        </span>
      </td>
      <td className="py-2.5 pr-2">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm", isCurrentUser ? "font-semibold text-green-400" : "text-zinc-200")}>
            {player.name}
          </span>
          {player.is_guest && (
            <span className="rounded bg-yellow-900/30 px-1.5 py-0 text-xs text-yellow-400">
              Inv.
            </span>
          )}
        </div>
      </td>
      <td className="py-2.5 pr-2 text-xs text-zinc-500">
        {formatJoined(player.created_at)}
      </td>
      <td className="py-2.5 text-sm text-zinc-400">
        {player.notes || <span className="text-zinc-700">—</span>}
      </td>
      <td className="py-2.5 pr-1 text-center">
        {canRemove && onRemove && (
          <button
            onClick={() => onRemove(player.user_id)}
            className="rounded p-1 text-xs text-red-400 hover:bg-red-950/30 transition-colors"
            title="Quitar invitado"
          >
            ✕
          </button>
        )}
      </td>
    </tr>
  );
}

export function PlayerList({ mainPlayers, substitutePlayers, currentUserId, onRemoveGuest }: PlayerListProps) {
  const hasRemovableGuest = onRemoveGuest && (
    mainPlayers.some(p => p.is_guest && p.guest_of === currentUserId) ||
    substitutePlayers.some(p => p.is_guest && p.guest_of === currentUserId)
  );

  return (
    <div className="space-y-8">
      {/* Main list */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h4 className="text-sm font-semibold text-zinc-300">
            Lista Principal
          </h4>
          <span className="rounded-full bg-zinc-800 px-2 py-0 text-xs font-mono text-zinc-400">
            {mainPlayers.length}
          </span>
        </div>
        {mainPlayers.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-600">Sin jugadores aún</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs text-zinc-500">
                  <th className="py-2 pr-2 text-center font-medium">#</th>
                  <th className="py-2 pr-2 text-left font-medium">Jugador</th>
                  <th className="py-2 pr-2 text-left font-medium">Apuntado</th>
                  <th className="py-2 text-left font-medium">Notas</th>
                  {hasRemovableGuest && <th className="py-2 w-8"></th>}
                </tr>
              </thead>
              <tbody>
                {mainPlayers.map((player, index) => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    index={index}
                    isMain
                    isCurrentUser={currentUserId === player.user_id}
                    canRemove={!!onRemoveGuest && player.is_guest && player.guest_of === currentUserId}
                    onRemove={onRemoveGuest}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Substitutes */}
      {substitutePlayers.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h4 className="text-sm font-semibold text-yellow-400/80">
              Lista de Espera
            </h4>
            <span className="rounded-full bg-yellow-900/20 px-2 py-0 text-xs font-mono text-yellow-400">
              {substitutePlayers.length}
            </span>
          </div>
          <div className="overflow-hidden rounded-lg border border-dashed border-yellow-800/50 bg-yellow-950/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-yellow-800/30 text-xs text-zinc-500">
                  <th className="py-2 pr-2 text-center font-medium">#</th>
                  <th className="py-2 pr-2 text-left font-medium">Jugador</th>
                  <th className="py-2 pr-2 text-left font-medium">Apuntado</th>
                  <th className="py-2 text-left font-medium">Notas</th>
                  {hasRemovableGuest && <th className="py-2 w-8"></th>}
                </tr>
              </thead>
              <tbody>
                {substitutePlayers.map((player, index) => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    index={index}
                    isMain={false}
                    isCurrentUser={currentUserId === player.user_id}
                    canRemove={!!onRemoveGuest && player.is_guest && player.guest_of === currentUserId}
                    onRemove={onRemoveGuest}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}