"use client";

/**
 * INTERFACES LAYER — Client Component
 *
 * StatsCard summarises overall progress from the per-habit completion data that
 * HabitGrid persists in localStorage (keys "habit-grid:<id>", each an array of
 * YYYY-MM-DD day keys). A day "counts" when at least one habit was completed on
 * it. From the union of those days it derives:
 *   - Racha global: consecutive days up to today (today may still be pending).
 *   - Mejor racha: longest consecutive run ever.
 *   - Cumplimiento semanal: % of elapsed days this week (Mon→today) with ≥1 done.
 *
 * It owns all of this logic and reads storage directly, so it stays decoupled
 * from the other widgets. It recomputes on the `habit:completed` event and when
 * the tab regains focus (to catch grid toggles made in the same session).
 */

import { useCallback, useEffect, useState } from "react";

import { HABIT_COMPLETED_EVENT } from "./StreakWidget";

const GRID_PREFIX = "habit-grid:";
const DAY_MS = 86_400_000;

interface Stats {
  currentStreak: number;
  bestStreak: number;
  weeklyPercent: number;
}

const EMPTY_STATS: Stats = { currentStreak: 0, bestStreak: 0, weeklyPercent: 0 };

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Local-time YYYY-MM-DD key (avoids UTC offset drift). */
function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Midnight today, local time. */
function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Whole-day index for a YYYY-MM-DD key — lets us test consecutiveness with ±1. */
function keyToDayNumber(key: string): number {
  const parts = key.split("-");
  const t = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
  return Math.floor(t / DAY_MS);
}

// ─── Data gathering ────────────────────────────────────────────────────────────

/** Union of every day on which at least one habit was completed. */
function collectCompletedDays(): Set<string> {
  const days = new Set<string>();
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(GRID_PREFIX)) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const v of parsed) if (typeof v === "string") days.add(v);
      }
    }
  } catch {
    // Corrupt or unavailable storage — treat as no data.
  }
  return days;
}

// ─── Metric calculations ───────────────────────────────────────────────────────

/** Consecutive days ending today; if today isn't done yet, count from yesterday. */
function currentStreak(days: ReadonlySet<string>): number {
  const cursor = startOfToday();
  if (!days.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Longest run of consecutive completed days over all time. */
function bestStreak(days: ReadonlySet<string>): number {
  const nums = [...days].map(keyToDayNumber).sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const n of nums) {
    run = prev !== null && n === prev + 1 ? run + 1 : 1;
    if (run > best) best = run;
    prev = n;
  }
  return best;
}

/** % of elapsed days this week (Monday→today) with at least one completion. */
function weeklyPercent(days: ReadonlySet<string>): number {
  const today = startOfToday();
  const daysSinceMonday = (today.getDay() + 6) % 7; // Mon→0 … Sun→6
  let elapsed = 0;
  let done = 0;
  for (let i = 0; i <= daysSinceMonday; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - daysSinceMonday + i);
    elapsed++;
    if (days.has(dateKey(d))) done++;
  }
  return elapsed === 0 ? 0 : Math.round((done / elapsed) * 100);
}

function computeStats(): Stats {
  const days = collectCompletedDays();
  return {
    currentStreak: currentStreak(days),
    bestStreak: bestStreak(days),
    weeklyPercent: weeklyPercent(days),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface MetricProps {
  value: string;
  label: string;
}

function Metric({ value, label }: MetricProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-3xl font-bold leading-none text-primary">{value}</span>
      <span className="mt-1.5 text-xs text-muted">{label}</span>
    </div>
  );
}

export function StatsCard(): React.JSX.Element {
  // Start empty so server and first client render match; hydrate after mount.
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);

  const refresh = useCallback((): void => setStats(computeStats()), []);

  useEffect(() => {
    refresh();
    const onFocus = (): void => refresh();
    window.addEventListener(HABIT_COMPLETED_EVENT, refresh);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return (): void => {
      window.removeEventListener(HABIT_COMPLETED_EVENT, refresh);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refresh]);

  return (
    <section className="rounded border border-border bg-surface p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">📊 Estadísticas</h2>
      <div className="grid grid-cols-3 gap-4">
        <Metric value={`${stats.currentStreak} 🔥`} label="Racha global (días)" />
        <Metric value={`${stats.bestStreak}`} label="Mejor racha (días)" />
        <Metric value={`${stats.weeklyPercent}%`} label="Cumplimiento semanal" />
      </div>
    </section>
  );
}
