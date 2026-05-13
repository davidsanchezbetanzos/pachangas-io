"use client";

import { cn, formatDate } from "@/lib/utils";
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

export function PlayerList({ mainPlayers, substitutePlayers, currentUserId }: PlayerListProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-sm font-medium text-[#737373]">
          Lista Principal ({mainPlayers.length})
        </h4>
        <div className="space-y-2">
          {mainPlayers.length === 0 ? (
            <p className="text-sm text-[#a3a3a3]">No hay jugadores aún</p>
          ) : (
            mainPlayers.map((player, index) => (
              <div
                key={player.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg bg-[#f4f4f4] p-3",
                  currentUserId === player.user_id && "border-2 border-[#25d366]"
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-sm font-medium text-white">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">
                      {player.name}
                      {currentUserId === player.user_id && (
                        <span className="ml-1 text-[#25d366]"> (tú)</span>
                      )}
                    </span>
                    {player.is_guest && (
                      <span className="shrink-0 rounded bg-[#fef3c7] px-1 py-0.5 text-xs text-[#92400e]">
                        INV.
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-[#a3a3a3]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatJoined(player.created_at)}
                    </span>
                    {player.notes && (
                      <span className="truncate">📝 {player.notes}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {substitutePlayers.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-[#737373]">
            Suplentes ({substitutePlayers.length})
          </h4>
          <div className="space-y-2 rounded-lg border-2 border-dashed border-[#e5e5e5] p-3">
            {substitutePlayers.map((player, index) => (
              <div key={player.id} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f4f4f4] text-xs text-[#737373]">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#737373]">
                      {player.name}
                      {player.is_guest && (
                        <span className="ml-1 text-xs">(invitado)</span>
                      )}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-[#a3a3a3]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatJoined(player.created_at)}
                    </span>
                    {player.notes && (
                      <span className="truncate">📝 {player.notes}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}