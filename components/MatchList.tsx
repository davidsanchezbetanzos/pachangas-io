"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/MatchCard";
import { CreateMatchForm } from "@/components/CreateMatchForm";
import { useSupabase } from "@/components/providers";

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
  const { supabase, userId } = useSupabase();
  const [showForm, setShowForm] = useState(false);
  const [creatorName, setCreatorName] = useState("");
  const [creatorNotes, setCreatorNotes] = useState("");
  const [nameRequired, setNameRequired] = useState(false);

  // Mis partidos: los que yo creé
  const myMatches = useMemo(
    () => initialMatches.filter((m) => m.creator_id === userId),
    [initialMatches, userId]
  );

  // Partidos donde estoy apuntado pero no soy el creador
  const joinedMatches = useMemo(
    () => initialMatches.filter(
      (m) =>
        m.creator_id !== userId &&
        initialPlayersData[m.id]?.userIds.includes(userId)
    ),
    [initialMatches, initialPlayersData, userId]
  );

  const handleCreateMatch = async (data: {
    title: string;
    description: string;
    location: string;
    mapUrl: string;
    matchDate: string;
    matchTime: string;
    playerLimit: number | null;
    name?: string;
    notes?: string;
  }) => {
    if (!supabase || !userId) return;
    const matchDateTime = `${data.matchDate}T${data.matchTime}:00`;
    const { data: match, error } = await supabase
      .from("matches")
      .insert({
        creator_id: userId,
        title: data.title,
        description: data.description || null,
        location: data.location || null,
        map_url: data.mapUrl || null,
        match_date: matchDateTime,
        player_limit: data.playerLimit,
      })
      .select()
      .single();
    if (error) throw error;
    if (match) {
      const playerName = data.name || "Creador";
      // Guardar nombre para futuros usos
      if (data.name && typeof window !== "undefined") {
        localStorage.setItem("pachanga_anonymous_name", data.name);
      }
      await supabase.from("players").insert({
        match_id: match.id,
        user_id: userId,
        name: playerName,
        notes: data.notes || null,
        is_guest: false,
        status: "main",
        position: 1,
      });
      router.push(`/partido/${match.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tus Partidos</h2>
        <Button onClick={() => setShowForm(!showForm)} variant="outline" size="sm">
          {showForm ? "✕ Cancelar" : "+ Crear"}
        </Button>
      </div>

      {showForm && (
        <div className="mb-6">
          <CreateMatchForm creatorId={userId} onSubmit={handleCreateMatch} />
        </div>
      )}

      {myMatches.length === 0 && joinedMatches.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[#a1a1aa]">No has creado ningún partido</p>
          <p className="mt-2 text-sm text-[#71717a]">
            Crea uno o pide a un amigo que te comparta la URL
          </p>
        </div>
      ) : (
        <>
          {myMatches.length > 0 && (
            <div className="space-y-3">
              {myMatches.map((match) => (
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

          {joinedMatches.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-[#a1a1aa]">
                Partidos donde estás apuntado
              </h3>
              <div className="space-y-3">
                {joinedMatches.map((match) => (
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