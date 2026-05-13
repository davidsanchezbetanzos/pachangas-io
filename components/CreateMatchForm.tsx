"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlayerLimitOptions } from "@/lib/utils";
import { useSupabase } from "@/components/providers";

interface CreateMatchFormData {
  title: string;
  description: string;
  location: string;
  mapUrl: string;
  matchDate: string;
  matchTime: string;
  playerLimit: number | null;
  name?: string;
  notes?: string;
}

interface CreateMatchFormProps {
  creatorId: string;
  onSubmit: (data: CreateMatchFormData) => Promise<void>;
}

export function CreateMatchForm({ creatorId, onSubmit }: CreateMatchFormProps) {
  const { user } = useSupabase();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("");
  const [playerLimit, setPlayerLimit] = useState<number | null>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [myName, setMyName] = useState("");
  const [myNotes, setMyNotes] = useState("");

  const isAnonymous = !user;
  const savedName = typeof window !== "undefined" ? localStorage.getItem("pachanga_anonymous_name") || "" : "";

  useEffect(() => {
    if (isAnonymous && savedName) {
      setMyName(savedName);
    } else if (user?.user_metadata?.full_name) {
      setMyName(user.user_metadata.full_name);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !matchDate || !matchTime) {
      setError("Rellena los campos obligatorios");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit({
        title,
        description,
        location,
        mapUrl,
        matchDate,
        matchTime,
        playerLimit,
        name: isAnonymous ? myName || undefined : undefined,
        notes: isAnonymous ? myNotes || undefined : undefined,
      });
    } catch (err) {
      setError("Error al crear el partido");
    } finally {
      setLoading(false);
    }
  };

  const limitOptions = getPlayerLimitOptions();

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Crear Partido</CardTitle>
        <CardDescription>
          Organiza un partido y comparte la invitación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {isAnonymous && (
            <div className="rounded-md bg-primary/10 p-3">
              <p className="mb-2 text-xs text-primary">
                Como usuario anónimo, indica tu nombre y notas
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={myName}
                  onChange={(e) => setMyName(e.target.value)}
                  placeholder="Tu nombre *"
                  className="w-full rounded border border-green-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500"
                  required
                />
                <input
                  type="text"
                  value={myNotes}
                  onChange={(e) => setMyNotes(e.target.value)}
                  placeholder="Observaciones (opcional)"
                  className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">
              Título del partido *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Partido del sáb/dom"
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 [color-scheme:dark]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Fecha *</label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Hora *</label>
              <input
                type="time"
                value={matchTime}
                onChange={(e) => setMatchTime(e.target.value)}
                className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Lugar</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Campo de fútbol"
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Enlace Google Maps
            </label>
            <input
              type="url"
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Límite de jugadores</label>
            <select
              value={playerLimit ?? ""}
              onChange={(e) =>
                setPlayerLimit(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 [color-scheme:dark]"
            >
              {limitOptions.map((opt) => (
                <option key={opt.label} value={opt.value ?? ""}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Observaciones</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Precio, normas, pelota..."
              rows={2}
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 [color-scheme:dark]"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando..." : "Crear Partido"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}