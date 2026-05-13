"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getPlayerLimitOptions } from "@/lib/utils";

interface EditMatchFormData {
  title: string;
  description: string | null;
  location: string | null;
  mapUrl: string | null;
  matchDate: string;
  matchTime: string;
  playerLimit: number | null;
}

interface EditMatchFormProps {
  initial: {
    title: string;
    description: string | null;
    location: string | null;
    mapUrl: string | null;
    matchDate: string;
    playerLimit: number | null;
  };
  onSubmit: (data: EditMatchFormData) => Promise<void>;
  onCancel: () => void;
}

export function EditMatchForm({ initial, onSubmit, onCancel }: EditMatchFormProps) {
  const d = new Date(initial.matchDate);
  const dateStr = d.toISOString().slice(0, 10);
  const timeStr = d.toTimeString().slice(0, 5);

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description || "");
  const [location, setLocation] = useState(initial.location || "");
  const [mapUrl, setMapUrl] = useState(initial.mapUrl || "");
  const [matchDate, setMatchDate] = useState(dateStr);
  const [matchTime, setMatchTime] = useState(timeStr);
  const [playerLimit, setPlayerLimit] = useState<number | null>(initial.playerLimit);
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
      await onSubmit({ title, description: description || null, location: location || null, mapUrl: mapUrl || null, matchDate, matchTime, playerLimit });
    } catch {
      setError("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const limitOptions = getPlayerLimitOptions();

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <h3 className="text-sm font-semibold text-zinc-300">Editar Partido</h3>
      {error && <div className="rounded bg-red-950/30 border border-red-800/50 p-2 text-sm text-red-400">{error}</div>}

      <div>
        <label className="mb-1 block text-xs text-zinc-400">Título *</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Fecha *</label>
          <input type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 [color-scheme:dark]" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Hora *</label>
          <input type="time" value={matchTime} onChange={(e) => setMatchTime(e.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 [color-scheme:dark]" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-zinc-400">Lugar</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500" />
      </div>

      <div>
        <label className="mb-1 block text-xs text-zinc-400">Enlace Google Maps</label>
        <input type="url" value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} placeholder="https://maps.google.com/..." className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500" />
      </div>

      <div>
        <label className="mb-1 block text-xs text-zinc-400">Límite de jugadores</label>
        <select value={playerLimit ?? ""} onChange={(e) => setPlayerLimit(e.target.value ? Number(e.target.value) : null)} className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 [color-scheme:dark]">
          {limitOptions.map((opt) => (
            <option key={opt.label} value={opt.value ?? ""}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-zinc-400">Observaciones</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500" />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button type="submit" disabled={loading} className="flex-1 bg-green-600 font-semibold text-white hover:bg-green-500">{loading ? "Guardando..." : "Guardar"}</Button>
      </div>
    </form>
  );
}