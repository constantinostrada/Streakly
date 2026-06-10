"use client";

/**
 * INTERFACES LAYER — Client Component
 *
 * HabitGrid renders a GitHub-style contribution grid for a single habit,
 * covering roughly the last 30 days. Each cell is a toggle: click to mark
 * the day as completed (or undo it). The set of completed days is persisted
 * to localStorage, keyed per habit id, so it survives reloads.
 *
 * It also shows the current streak — the number of consecutive completed days
 * ending today (today may still be pending without breaking the streak).
 *
 * This is pure presentation state local to the browser; it does not flow
 * through the domain or any use case, so it stays entirely in this layer.
 */

import { useCallback, useEffect, useMemo, useState } from "react";

interface HabitGridProps {
  habitId: string;
  /** How many trailing days to display. Defaults to 30. */
  days?: number;
}

const DEFAULT_DAYS = 30;
const STORAGE_PREFIX = "habit-grid:";

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Format a Date as a local-time YYYY-MM-DD key (avoids UTC offset drift). */
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

/** Oldest → newest list of the last `n` days (each at local midnight). */
function lastNDays(n: number): Date[] {
  const today = startOfToday();
  const result: Date[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push(d);
  }
  return result;
}

/**
 * Count consecutive completed days ending today. If today is not yet marked,
 * counting starts from yesterday so an unfinished "today" doesn't reset it.
 */
function currentStreak(completed: ReadonlySet<string>): number {
  const cursor = startOfToday();
  if (!completed.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (completed.has(dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// ─── localStorage helpers ───────────────────────────────────────────────────

function storageKey(habitId: string): string {
  return `${STORAGE_PREFIX}${habitId}`;
}

function loadCompleted(habitId: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(storageKey(habitId));
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((v): v is string => typeof v === "string"));
    }
  } catch {
    // Corrupt or unavailable storage — start fresh rather than crashing the UI.
  }
  return new Set();
}

function saveCompleted(habitId: string, completed: ReadonlySet<string>): void {
  try {
    window.localStorage.setItem(storageKey(habitId), JSON.stringify([...completed]));
  } catch {
    // Storage may be full or disabled; the in-memory state still works for now.
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HabitGrid({ habitId, days = DEFAULT_DAYS }: HabitGridProps): React.JSX.Element {
  // Start empty so server and first client render match; hydrate from storage
  // in an effect once we're on the client.
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCompleted(loadCompleted(habitId));
    setHydrated(true);
  }, [habitId]);

  const dayList = useMemo(() => lastNDays(days), [days]);
  const todayKey = useMemo(() => dateKey(startOfToday()), []);
  const streak = useMemo(() => currentStreak(completed), [completed]);

  const toggleDay = useCallback(
    (key: string): void => {
      setCompleted((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        saveCompleted(habitId, next);
        return next;
      });
    },
    [habitId],
  );

  // Pad the front so the first column aligns to the correct weekday (Sun-first),
  // giving the GitHub-style week-per-column layout.
  const leadingBlanks = dayList[0]?.getDay() ?? 0;
  const cells: (Date | null)[] = [...Array<null>(leadingBlanks).fill(null), ...dayList];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <span style={{ fontSize: "0.9rem" }} aria-hidden>
          🔥
        </span>
        <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
          {streak} day{streak === 1 ? "" : "s"} streak
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>· last {days} days</span>
      </div>

      <div
        role="group"
        aria-label={`Completion grid for the last ${days} days`}
        style={{
          display: "grid",
          gridTemplateRows: "repeat(7, 1fr)",
          gridAutoFlow: "column",
          gridAutoColumns: "1fr",
          gap: "3px",
          maxWidth: "fit-content",
        }}
      >
        {cells.map((date, i) => {
          if (date === null) {
            return <span key={`blank-${i}`} aria-hidden style={{ width: 14, height: 14 }} />;
          }
          const key = dateKey(date);
          const isDone = completed.has(key);
          const isToday = key === todayKey;
          const label = date.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleDay(key)}
              aria-pressed={isDone}
              aria-label={`${label} — ${isDone ? "completed" : "not completed"}`}
              title={`${label}${isDone ? " ✓" : ""}`}
              disabled={!hydrated}
              style={{
                width: 14,
                height: 14,
                padding: 0,
                borderRadius: 3,
                border: isToday
                  ? "1px solid var(--color-primary)"
                  : "1px solid var(--color-border)",
                background: isDone ? "var(--color-success)" : "var(--color-bg)",
                transition: "background 0.15s ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
