"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlayerLimitOptions } from "@/lib/utils";

interface CreateMatchFormProps {
  creatorId: string;
  onSubmit: (data: {
    title: string;
    description: string;
    location: string;
    mapUrl: string;
    matchDate: string;
    matchTime: string;
    playerLimit: number | null;
  }) => Promise<void>;
}

export function CreateMatchForm({ creatorId, onSubmit }: CreateMatchFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("");
  const [playerLimit, setPlayerLimit] = useState<number | null>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
            <div className="rounded bg-[#fef2f2] p-3 text-sm text-[#ef4444]">
              {error}
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
              className="w-full rounded border border-[#e5e5e5] px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Fecha *</label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full rounded border border-[#e5e5e5] px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Hora *</label>
              <input
                type="time"
                value={matchTime}
                onChange={(e) => setMatchTime(e.target.value)}
                className="w-full rounded border border-[#e5e5e5] px-3 py-2"
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
              className="w-full rounded border border-[#e5e5e5] px-3 py-2"
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
              className="w-full rounded border border-[#e5e5e5] px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Límite de jugadores</label>
            <select
              value={playerLimit ?? ""}
              onChange={(e) =>
                setPlayerLimit(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full rounded border border-[#e5e5e5] px-3 py-2"
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
              placeholder="Precio, norma, pelota..."
              rows={2}
              className="w-full rounded border border-[#e5e5e5] px-3 py-2"
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