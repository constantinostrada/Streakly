"use client";

/**
 * INTERFACES LAYER — Client Component
 *
 * StreakWidget shows the current "streak": how many consecutive days the user
 * has completed at least one habit. It reads/writes its own localStorage record
 * ({ lastDate, count }) and recomputes whenever a habit is completed elsewhere
 * — signalled by the `habit:completed` window event.
 *
 * All streak logic (storage + day math) is self-contained here; it never flows
 * through the domain or any use case, so it stays entirely within this layer.
 */

import { useEffect, useState } from "react";

/** Window event dispatched by the habits UI whenever a habit is completed. */
export const HABIT_COMPLETED_EVENT = "habit:completed";

const STORAGE_KEY = "streak-widget";

interface StreakData {
  /** Local calendar day of the most recent completion (YYYY-MM-DD). */
  lastDate: string;
  /** Consecutive-day count ending on lastDate. */
  count: number;
}

// ─── Day-math helpers ────────────────────────────────────────────────────────

/** Local-calendar day key (YYYY-MM-DD) — timezone-stable, unlike toISOString. */
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Midnight-local epoch ms for a YYYY-MM-DD key. */
function keyToTime(key: string): number {
  const parts = key.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
}

/** Whole days from `fromKey` to `toKey` (both YYYY-MM-DD); negative if toKey is earlier. */
function daysBetween(fromKey: string, toKey: string): number {
  return Math.round((keyToTime(toKey) - keyToTime(fromKey)) / 86_400_000);
}

// ─── localStorage helpers ──────────────────────────────────────────────────

function isStreakData(value: unknown): value is StreakData {
  if (typeof value !== "object" || value === null) return false;
  const d = value as Record<string, unknown>;
  return typeof d.lastDate === "string" && typeof d.count === "number";
}

function loadStreak(): StreakData | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (isStreakData(parsed)) return parsed;
  } catch {
    // Corrupt or unavailable storage — treat as no streak yet.
  }
  return null;
}

function saveStreak(data: StreakData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage may be full or disabled; the in-memory value still renders.
  }
}

// ─── Streak logic ────────────────────────────────────────────────────────────

/** Streak still "alive" if the last completion was today or yesterday; else broken. */
function currentStreak(data: StreakData | null, todayKey: string): number {
  if (!data) return 0;
  const gap = daysBetween(data.lastDate, todayKey);
  return gap === 0 || gap === 1 ? data.count : 0;
}

/** Apply a completion on `todayKey` and persist the new streak record. */
function recordCompletion(todayKey: string): StreakData {
  const prev = loadStreak();
  let next: StreakData;
  if (!prev) {
    next = { lastDate: todayKey, count: 1 };
  } else {
    const gap = daysBetween(prev.lastDate, todayKey);
    if (gap <= 0) {
      next = { lastDate: prev.lastDate, count: prev.count }; // already counted today
    } else if (gap === 1) {
      next = { lastDate: todayKey, count: prev.count + 1 }; // consecutive day
    } else {
      next = { lastDate: todayKey, count: 1 }; // streak broken — restart
    }
  }
  saveStreak(next);
  return next;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StreakWidget(): React.JSX.Element {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const refresh = (): void => setStreak(currentStreak(loadStreak(), toDateKey(new Date())));
    const onCompleted = (): void => {
      const next = recordCompletion(toDateKey(new Date()));
      setStreak(currentStreak(next, toDateKey(new Date())));
    };

    refresh();
    window.addEventListener(HABIT_COMPLETED_EVENT, onCompleted);
    return (): void => window.removeEventListener(HABIT_COMPLETED_EVENT, onCompleted);
  }, []);

  const label =
    streak === 0 ? "Empezá hoy" : streak === 1 ? "1 día seguido" : `${streak} días seguidos`;

  return (
    <section className="rounded border border-border bg-surface p-6 text-center shadow-sm">
      <div className="text-5xl font-bold leading-none text-primary">
        {streak} <span aria-hidden>🔥</span>
      </div>
      <p className="mt-3 text-sm font-medium text-muted">{label}</p>
    </section>
  );
}
