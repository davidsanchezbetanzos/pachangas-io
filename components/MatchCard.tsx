import * as React from "react"
import { cn } from "@/lib/utils"
import { formatDate, formatTime } from "@/lib/utils"

interface MatchCardProps {
  match: {
    id: string
    title: string
    location: string | null
    map_url: string | null
    match_date: string
    player_limit: number | null
    status: string
  }
  mainCount: number
  substituteCount: number
  onClick?: () => void
}

export function MatchCard({ match, mainCount, substituteCount, onClick }: MatchCardProps) {
  const isFull = match.player_limit !== null && mainCount >= match.player_limit
  const matchDate = new Date(match.match_date)

  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md hover:border-primary/30",
        match.status === "cancelled" && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-card-foreground">{match.title}</h3>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>📅 {formatDate(matchDate)}</span>
            <span>🕐 {formatTime(matchDate)}</span>
          </div>
          {match.location && (
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <span>📍</span>
              <span className="truncate">{match.location}</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <div
            className={cn(
              "rounded-full px-2 py-1 text-xs font-medium",
              isFull
                ? "bg-yellow-900/30 text-yellow-300"
                : "bg-primary/10 text-primary"
            )}
          >
            {mainCount}/{match.player_limit ?? "∞"}
          </div>
          {substituteCount > 0 && (
            <div className="mt-1 text-xs text-muted-foreground">
              +{substituteCount} suplentes
            </div>
          )}
        </div>
      </div>
    </div>
  )
}