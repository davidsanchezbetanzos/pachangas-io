"use client";

import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface Player {
  id: string;
  user_id: string;
  name: string;
  notes: string | null;
  is_guest: boolean;
  status: "main" | "substitute";
  created_at: string;
}

interface PlayerListProps {
  mainPlayers: Player[];
  substitutePlayers: Player[];
  currentUserId?: string;
}

function formatJoined(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;

  return d.toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PlayerRow({ player, index, isMain, isCurrentUser }: {
  player: Player;
  index: number;
  isMain: boolean;
  isCurrentUser: boolean;
}) {
  return (
    <tr className={cn(
      "border-b border-[#e5e5e5] text-sm",
      isCurrentUser && "bg-[#dcfce7]"
    )}>
      <td className="py-2 pr-2 text-center">
        <span className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
          isMain ? "bg-[#25d366] text-white" : "bg-[#f4f4f4] text-[#737373]"
        )}>
          {index + 1}
        </span>
      </td>
      <td className="py-2 pr-2">
        <div className="flex items-center gap-1.5">
          <span className={cn(isCurrentUser && "font-medium")}>
            {player.name}
            {isCurrentUser && <span className="ml-1 text-[#25d366]">(tú)</span>}
          </span>
          {player.is_guest && (
            <span className="rounded bg-[#fef3c7] px-1 py-0 text-xs text-[#92400e]">
              Inv.
            </span>
          )}
        </div>
      </td>
      <td className="hidden py-2 pr-2 text-[#a3a3a3] sm:table-cell">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatJoined(player.created_at)}
        </span>
      </td>
      <td className="py-2 text-[#737373]">
        {player.notes || "-"}
      </td>
    </tr>
  );
}

export function PlayerList({ mainPlayers, substitutePlayers, currentUserId }: PlayerListProps) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 text-sm font-medium text-[#737373]">
          Lista Principal ({mainPlayers.length})
        </h4>
        {mainPlayers.length === 0 ? (
          <p className="text-sm text-[#a3a3a3]">No hay jugadores aún</p>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e5e5] text-xs text-[#a3a3a3]">
                  <th className="py-2 pr-2 text-center font-medium">#</th>
                  <th className="py-2 pr-2 text-left font-medium">Jugador</th>
                  <th className="hidden py-2 pr-2 text-left font-medium sm:table-cell">Apuntado</th>
                  <th className="py-2 text-left font-medium">Observaciones</th>
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
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {substitutePlayers.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-[#737373]">
            Suplentes ({substitutePlayers.length})
          </h4>
          <div className="overflow-x-auto rounded-lg border-2 border-dashed border-[#e5e5e5] bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e5e5] text-xs text-[#a3a3a3]">
                  <th className="py-2 pr-2 text-center font-medium">#</th>
                  <th className="py-2 pr-2 text-left font-medium">Jugador</th>
                  <th className="hidden py-2 pr-2 text-left font-medium sm:table-cell">Apuntado</th>
                  <th className="py-2 text-left font-medium">Observaciones</th>
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