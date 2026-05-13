"use client";

import { cn } from "@/lib/utils";
import { formatDate, formatTime } from "@/lib/utils";

interface MatchCardProps {
  match: {
    id: string;
    title: string;
    location: string | null;
    map_url: string | null;
    match_date: string;
    player_limit: number | null;
    status: string;
  };
  mainCount: number;
  substituteCount: number;
  onClick?: () => void;
}

export function MatchCard({ match, mainCount, substituteCount, onClick }: MatchCardProps) {
  const matchDate = new Date(match.match_date);
  const isFull =
    match.player_limit !== null && mainCount >= match.player_limit;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-800/50",
        match.status === "cancelled" && "opacity-50"
      )}
    >
      {/* Player count badge */}
      <div
        className={cn(
          "absolute right-4 top-4 rounded-full border px-2.5 py-0.5 text-xs font-mono",
          isFull
            ? "border-yellow-700 bg-yellow-900/30 text-yellow-400"
            : "border-zinc-700 bg-zinc-800 text-zinc-300"
        )}
      >
        {mainCount}/{match.player_limit ?? "∞"}
      </div>

      <div className="pr-20">
        <h3 className="text-base font-semibold text-zinc-100">
          {match.title}
        </h3>
        <div className="mt-2 flex items-center gap-3 text-sm text-zinc-400">
          <span>{formatDate(matchDate)}</span>
          <span className="text-zinc-600">·</span>
          <span>{formatTime(matchDate)}</span>
        </div>
        {match.location && (
          <div className="mt-1 text-sm text-zinc-500 truncate">
            Ubicación: {match.location}
          </div>
        )}
      </div>

      {substituteCount > 0 && (
        <p className="mt-2 text-xs text-zinc-600">
          +{substituteCount} en espera
        </p>
      )}
    </div>
  );
}