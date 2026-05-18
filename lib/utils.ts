import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} a las ${formatTime(date)}`;
}

export function generateShareText(
  title: string,
  location: string,
  matchDate: string,
  mainCount: number,
  substituteCount: number,
  url: string
): string {
  let text = `⚽ *${title}*\n📅 ${formatDateTime(matchDate)}`;
  if (location) text += `\n📍 ${location}`;
  text += `\n👥 ${mainCount} jugadores`;
  if (substituteCount > 0) text += ` (+${substituteCount} suplentes)`;
  text += `\n\n${url}`;
  return text;
}

export function getWhatsAppUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function getPlayerLimitOptions() {
    return [
      { label: "Sin límite", value: null },
      { label: "Fútbol 7 (14)", value: 14 },
      { label: "Fútbol Sala (10)", value: 10 },
      { label: "Fútbol 11 (22)", value: 22 },
    ];
}

export function getAnonymousId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("pachanga_anonymous_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("pachanga_anonymous_id", id);
  }
  return id;
}

export function getAnonymousName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("pachanga_anonymous_name") || "";
}

export function setAnonymousName(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("pachanga_anonymous_name", name);
}