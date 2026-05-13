"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface JoinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, notes: string) => Promise<void>;
  playerLimit: number | null;
  mainCount: number;
  isFull: boolean;
}

export function JoinDialog({
  open,
  onOpenChange,
  onSubmit,
  playerLimit,
  mainCount,
  isFull,
}: JoinDialogProps) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit(name.trim(), notes.trim());
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isFull ? "Apuntarse a Lista de Espera" : "Apuntarse al Partido"}
          </DialogTitle>
          <DialogDescription>
            {isFull
              ? `El partido tiene ${playerLimit} plazas filled. Te avisan si alguien se desapunta.`
              : `Hay ${mainCount}/${playerLimit ?? "∞"} plazas filled.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Tu nombre *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded border border-border px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Observaciones (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Llevo balón, necesito(chándal..."
              className="w-full rounded border border-border px-3 py-2"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
            {loading ? "Apuntando..." : isFull ? "Entrar en Lista de Espera" : "Apuntarse"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}