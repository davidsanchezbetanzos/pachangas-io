"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/MatchCard";
import { CreateMatchForm } from "@/components/CreateMatchForm";
import { useSupabase } from "@/components/providers";

interface Match {
  id: string;
  title: string;
  location: string | null;
  map_url: string | null;
  match_date: string;
  player_limit: number | null;
  status: string;
}

interface PlayerCount {
  matchId: string;
  mainCount: number;
  substituteCount: number;
}

export default function HomePage() {
  const router = useRouter();
  const { supabase, userId } = useSupabase();
  const [matches, setMatches] = useState<Match[]>([]);
  const [counts, setCounts] = useState<Record<string, PlayerCount>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("matches")
      .select("*")
      .eq("status", "open")
      .order("match_date", { ascending: true });
    if (data) {
      setMatches(data);
      loadCounts(data.map((m) => m.id));
    }
    setLoading(false);
  };

  const loadCounts = async (matchIds: string[]) => {
    if (!supabase || matchIds.length === 0) return;
    const { data } = await supabase
      .from("players")
      .select("match_id, status")
      .in("match_id", matchIds);
    if (data) {
      const newCounts: Record<string, PlayerCount> = {};
      matchIds.forEach((id) => {
        const mainCount = data.filter(
          (p) => p.match_id === id && p.status === "main"
        ).length;
        const subCount = data.filter(
          (p) => p.match_id === id && p.status === "substitute"
        ).length;
        newCounts[id] = { matchId: id, mainCount, substituteCount: subCount };
      });
      setCounts(newCounts);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#25d366] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Partidos Disponibles</h2>
        <Button onClick={() => setShowForm(!showForm)} variant="outline" size="sm">
          {showForm ? "✕ Cancelar" : "+ Crear"}
        </Button>
      </div>

      {showForm && (
        <div className="mb-6">
          <CreateMatchForm creatorId={userId} onSubmit={handleCreateMatch} />
        </div>
      )}

      {matches.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[#737373]">No hay partidos programados</p>
          <p className="mt-2 text-sm text-[#a3a3a3]">
            Crea el primero para empezar a jugar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              mainCount={counts[match.id]?.mainCount ?? 0}
              substituteCount={counts[match.id]?.substituteCount ?? 0}
              onClick={() => router.push(`/partido/${match.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}