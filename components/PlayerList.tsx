"use client";

import { cn } from "@/lib/utils";

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
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25d366] text-sm font-medium text-white">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {player.name}
                      {currentUserId === player.user_id && (
                        <span className="ml-1 text-xs text-[#25d366]">(tú)</span>
                      )}
                    </span>
                    {player.is_guest && (
                      <span className="rounded bg-[#fef3c7] px-1 py-0.5 text-xs text-[#92400e]">
                        INVITADO
                      </span>
                    )}
                  </div>
                  {player.notes && (
                    <p className="text-sm text-[#737373]">{player.notes}</p>
                  )}
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
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f4f4f4] text-xs text-[#737373]">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <span className="text-sm text-[#737373]">
                    {player.name}
                    {player.is_guest && (
                      <span className="ml-1 text-xs">(invitado)</span>
                    )}
                  </span>
                  {player.notes && (
                    <p className="text-xs text-[#a3a3a3]">{player.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}