"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/MatchCard";
import { CreateMatchForm } from "@/components/CreateMatchForm";
import { useSupabase } from "@/components/providers";
import { createMatch } from "@/components/actions";

interface Match {
  id: string;
  creator_id: string;
  title: string;
  location: string | null;
  map_url: string | null;
  match_date: string;
  player_limit: number | null;
  status: string;
}

interface PlayersData {
  userIds: string[];
  mainCount: number;
  substituteCount: number;
}

interface MatchListProps {
  initialMatches: Match[];
  initialPlayersData: Record<string, PlayersData>;
}

export function MatchList({ initialMatches, initialPlayersData }: MatchListProps) {
  const router = useRouter();
  const { userId } = useSupabase();
  const [showForm, setShowForm] = useState(false);

  const myMatches = useMemo(
    () => initialMatches.filter((m) => m.creator_id === userId),
    [initialMatches, userId]
  );

  const joinedMatches = useMemo(
    () => initialMatches.filter(
      (m) =>
        m.creator_id !== userId &&
        initialPlayersData[m.id]?.userIds.includes(userId)
    ),
    [initialMatches, initialPlayersData, userId]
  );

  // Separate past matches (date before now)
  const now = new Date();
  const pastMatches = useMemo(
    () => initialMatches.filter(
      (m) =>
        new Date(m.match_date) < now &&
        (m.creator_id === userId || initialPlayersData[m.id]?.userIds.includes(userId))
    ),
    [initialMatches, initialPlayersData, userId]
  );

  // Filter out past matches from upcoming lists
  const upcomingMyMatches = myMatches.filter((m) => new Date(m.match_date) >= now);
  const upcomingJoinedMatches = joinedMatches.filter((m) => new Date(m.match_date) >= now);

  const handleCreateMatch = async (data: {
    title: string; description: string; location: string; mapUrl: string;
    matchDate: string; matchTime: string; playerLimit: number | null;
    name?: string; notes?: string;
  }) => {
    if (!userId) return;
    const { error, matchId } = await createMatch(userId, {
      title: data.title, description: data.description || null,
      location: data.location || null, mapUrl: data.mapUrl || null,
      matchDate: data.matchDate, matchTime: data.matchTime,
      playerLimit: data.playerLimit, name: data.name, notes: data.notes,
    });
    if (error) throw error;
    if (matchId) {
      if (data.name && typeof window !== "undefined") {
        localStorage.setItem("pachanga_anonymous_name", data.name);
      }
      router.push(`/partido/${matchId}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold italic text-zinc-100">Mis partidos</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="bg-green-600 font-semibold text-white hover:bg-green-500"
        >
          {showForm ? "✕ Cancelar" : "+ Crear"}
        </Button>
      </div>

      {showForm && (
        <div className="mb-6">
          <CreateMatchForm creatorId={userId} onSubmit={handleCreateMatch} />
        </div>
      )}

      {upcomingMyMatches.length === 0 && upcomingJoinedMatches.length === 0 && pastMatches.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-zinc-500">No has creado ningún partido</p>
          <p className="mt-2 text-sm text-zinc-600">
            Crea uno o pide a un amigo que te comparta la URL
          </p>
        </div>
      ) : (
        <>
          {upcomingMyMatches.length > 0 && (
            <div className="space-y-3">
              {upcomingMyMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  mainCount={initialPlayersData[match.id]?.mainCount ?? 0}
                  substituteCount={initialPlayersData[match.id]?.substituteCount ?? 0}
                  onClick={() => router.push(`/partido/${match.id}`)}
                />
              ))}
            </div>
          )}

          {upcomingJoinedMatches.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-bold italic text-zinc-100">
                Partidos a los que estás apuntado
              </h3>
              <div className="space-y-3">
                {upcomingJoinedMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    mainCount={initialPlayersData[match.id]?.mainCount ?? 0}
                    substituteCount={initialPlayersData[match.id]?.substituteCount ?? 0}
                    onClick={() => router.push(`/partido/${match.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {pastMatches.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-bold italic text-zinc-500">
                Partidos pasados
              </h3>
              <div className="space-y-3 opacity-60">
                {pastMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    mainCount={initialPlayersData[match.id]?.mainCount ?? 0}
                    substituteCount={initialPlayersData[match.id]?.substituteCount ?? 0}
                    onClick={() => router.push(`/partido/${match.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}