/**
 * INTERFACES LAYER — per-habit color (browser-local)
 *
 * A habit's accent color is a purely presentational preference, so — like the
 * completion grid — it lives in localStorage keyed by habit id rather than in
 * the domain model. Helpers here are the single source of truth for the palette
 * and its persistence, shared by the modal (writes) and the habit card (reads).
 */

export interface HabitColor {
  name: string;
  value: string;
}

export const HABIT_COLORS: readonly HabitColor[] = [
  { name: "Índigo", value: "#6366f1" },
  { name: "Esmeralda", value: "#22c55e" },
  { name: "Ámbar", value: "#f59e0b" },
  { name: "Rojo", value: "#ef4444" },
  { name: "Cielo", value: "#0ea5e9" },
  { name: "Violeta", value: "#8b5cf6" },
];

export const DEFAULT_HABIT_COLOR = HABIT_COLORS[0]?.value ?? "#6366f1";

const STORAGE_PREFIX = "habit-color:";

function storageKey(habitId: string): string {
  return `${STORAGE_PREFIX}${habitId}`;
}

export function loadHabitColor(habitId: string): string {
  try {
    const raw = window.localStorage.getItem(storageKey(habitId));
    if (raw) return raw;
  } catch {
    // Storage unavailable — fall back to the default accent.
  }
  return DEFAULT_HABIT_COLOR;
}

export function saveHabitColor(habitId: string, color: string): void {
  try {
    window.localStorage.setItem(storageKey(habitId), color);
  } catch {
    // Storage may be full or disabled; the accent simply falls back to default.
  }
}
