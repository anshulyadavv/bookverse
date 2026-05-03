import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

export function getGuestUser(): { id: string; name: string } {
  if (typeof window === "undefined") return { id: "guest", name: "Reader" };
  const stored = localStorage.getItem("bookverse_user");
  if (stored) return JSON.parse(stored);
  const user = { id: "guest_" + Date.now(), name: "Reader" };
  localStorage.setItem("bookverse_user", JSON.stringify(user));
  return user;
}
