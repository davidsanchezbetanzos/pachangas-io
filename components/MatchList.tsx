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

interface PlayerCount {
  mainCount: number;
  substituteCount: number;
}

interface MatchListProps {
  initialMatches: Match[];
  initialCounts: Record<string, PlayerCount>;
}

export function MatchList({ initialMatches, initialCounts }: MatchListProps) {
  const router = useRouter();
  const { supabase, userId } = useSupabase();
  const [showForm, setShowForm] = useState(false);

  // Filter matches to show only those created by current user
  const myMatches = useMemo(
    () => initialMatches.filter((m) => m.creator_id === userId),
    [initialMatches, userId]
  );

  const handleCreateMatch = async (data: {
    title: string;
    description: string;
    location: string;
    mapUrl: string;
    matchDate: string;
    matchTime: string;
    playerLimit: number | null;
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
      await supabase.from("players").insert({
        match_id: match.id,
        user_id: userId,
        name: "Creador",
        notes: null,
        is_guest: false,
        status: "main",
        position: 1,
      });
      router.push(`/partido/${match.id}`);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
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

      {myMatches.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[#737373]">No has creado ningún partido</p>
          <p className="mt-2 text-sm text-[#a3a3a3]">
            Crea uno o pide a un amigo que te comparta la URL
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {myMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              mainCount={initialCounts[match.id]?.mainCount ?? 0}
              substituteCount={initialCounts[match.id]?.substituteCount ?? 0}
              onClick={() => router.push(`/partido/${match.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}