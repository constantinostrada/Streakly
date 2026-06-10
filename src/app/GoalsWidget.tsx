"use client";

/**
 * INTERFACES LAYER — Client Component
 *
 * GoalsWidget manages a list of personal goals, each with a target number of
 * days and a current progress count (e.g. "12 / 30 days"), rendered as a
 * progress bar. Goals can be added, edited, and deleted. The whole list is
 * persisted to localStorage so it survives reloads.
 *
 * This is browser-local presentation state — it never flows through the domain
 * or any use case, so it stays entirely within this layer. Styling is Tailwind.
 */

import { useCallback, useEffect, useMemo, useState } from "react";

interface Goal {
  id: string;
  title: string;
  /** Days completed so far. */
  current: number;
  /** Target number of days. */
  target: number;
}

const STORAGE_KEY = "goals-widget";

// ─── localStorage helpers ───────────────────────────────────────────────────

function isGoal(value: unknown): value is Goal {
  if (typeof value !== "object" || value === null) return false;
  const g = value as Record<string, unknown>;
  return (
    typeof g.id === "string" &&
    typeof g.title === "string" &&
    typeof g.current === "number" &&
    typeof g.target === "number"
  );
}

function loadGoals(): Goal[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(isGoal);
  } catch {
    // Corrupt or unavailable storage — start fresh rather than crashing the UI.
  }
  return [];
}

function saveGoals(goals: readonly Goal[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  } catch {
    // Storage may be full or disabled; in-memory state still works for now.
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `goal-${Date.now()}`;
}

function clampTarget(n: number): number {
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

function clampCurrent(n: number, target: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.floor(n), target);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GoalsWidget(): React.JSX.Element {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // New-goal form state.
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState(30);

  // Inline-edit state.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCurrent, setEditCurrent] = useState(0);
  const [editTarget, setEditTarget] = useState(1);

  useEffect(() => {
    setGoals(loadGoals());
    setHydrated(true);
  }, []);

  // Single place that mutates + persists the list.
  const commit = useCallback((updater: (prev: Goal[]) => Goal[]): void => {
    setGoals((prev) => {
      const next = updater(prev);
      saveGoals(next);
      return next;
    });
  }, []);

  const handleAdd = useCallback(
    (e: React.FormEvent): void => {
      e.preventDefault();
      const trimmed = title.trim();
      if (!trimmed) return;
      const goal: Goal = { id: newId(), title: trimmed, current: 0, target: clampTarget(target) };
      commit((prev) => [...prev, goal]);
      setTitle("");
      setTarget(30);
    },
    [title, target, commit],
  );

  const adjust = useCallback(
    (id: string, delta: number): void => {
      commit((prev) =>
        prev.map((g) =>
          g.id === id ? { ...g, current: clampCurrent(g.current + delta, g.target) } : g,
        ),
      );
    },
    [commit],
  );

  const handleDelete = useCallback(
    (id: string): void => {
      commit((prev) => prev.filter((g) => g.id !== id));
      setEditingId((curr) => (curr === id ? null : curr));
    },
    [commit],
  );

  const beginEdit = useCallback((goal: Goal): void => {
    setEditingId(goal.id);
    setEditTitle(goal.title);
    setEditCurrent(goal.current);
    setEditTarget(goal.target);
  }, []);

  const cancelEdit = useCallback((): void => setEditingId(null), []);

  const saveEdit = useCallback(
    (id: string): void => {
      const trimmed = editTitle.trim();
      if (!trimmed) return;
      const target = clampTarget(editTarget);
      commit((prev) =>
        prev.map((g) =>
          g.id === id
            ? { ...g, title: trimmed, target, current: clampCurrent(editCurrent, target) }
            : g,
        ),
      );
      setEditingId(null);
    },
    [editTitle, editTarget, editCurrent, commit],
  );

  const completedCount = useMemo(
    () => goals.filter((g) => g.current >= g.target).length,
    [goals],
  );

  return (
    <section className="rounded border border-border bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">🎯 Goals</h2>
        {goals.length > 0 && (
          <span className="text-xs text-muted">
            {completedCount} / {goals.length} reached
          </span>
        )}
      </div>

      {/* Add-goal form */}
      <form onSubmit={handleAdd} className="mb-5 flex flex-wrap items-end gap-2">
        <label className="flex flex-1 flex-col gap-1 text-xs text-muted">
          Goal
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Read every day"
            className="rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
        </label>
        <label className="flex w-24 flex-col gap-1 text-xs text-muted">
          Target days
          <input
            type="number"
            min={1}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
        </label>
        <button
          type="submit"
          disabled={!hydrated || !title.trim()}
          className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add goal
        </button>
      </form>

      {/* Goal list */}
      {goals.length === 0 ? (
        <p className="rounded border-2 border-dashed border-border py-10 text-center text-sm text-muted">
          No goals yet. Add one above to start tracking progress. 🚀
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {goals.map((goal) => {
            const target = Math.max(goal.target, 1);
            const percent = Math.min(100, Math.round((goal.current / target) * 100));
            const done = goal.current >= goal.target;
            const isEditing = editingId === goal.id;

            return (
              <li key={goal.id} className="rounded border border-border bg-bg p-3">
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="rounded border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
                    />
                    <div className="flex flex-wrap items-end gap-2">
                      <label className="flex w-24 flex-col gap-1 text-xs text-muted">
                        Current
                        <input
                          type="number"
                          min={0}
                          value={editCurrent}
                          onChange={(e) => setEditCurrent(Number(e.target.value))}
                          className="rounded border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
                        />
                      </label>
                      <label className="flex w-24 flex-col gap-1 text-xs text-muted">
                        Target
                        <input
                          type="number"
                          min={1}
                          value={editTarget}
                          onChange={(e) => setEditTarget(Number(e.target.value))}
                          className="rounded border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
                        />
                      </label>
                      <div className="ml-auto flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(goal.id)}
                          disabled={!editTitle.trim()}
                          className="rounded bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded border border-border bg-surface px-3 py-2 text-xs font-semibold text-muted hover:text-text"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        {done && <span aria-hidden>✅</span>}
                        {goal.title}
                      </span>
                      <span className="whitespace-nowrap text-xs font-semibold text-muted">
                        {goal.current} / {goal.target} days
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div
                      className="h-2 overflow-hidden rounded-full bg-border"
                      role="progressbar"
                      aria-valuenow={goal.current}
                      aria-valuemin={0}
                      aria-valuemax={goal.target}
                      aria-label={`${goal.title} progress`}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          done ? "bg-success" : "bg-primary"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => adjust(goal.id, -1)}
                          disabled={goal.current <= 0}
                          aria-label={`Decrease ${goal.title} progress`}
                          className="h-7 w-7 rounded border border-border bg-surface text-sm font-semibold text-muted hover:text-text disabled:opacity-40"
                        >
                          −
                        </button>
                        <button
                          type="button"
                          onClick={() => adjust(goal.id, 1)}
                          disabled={goal.current >= goal.target}
                          aria-label={`Increase ${goal.title} progress`}
                          className="h-7 w-7 rounded border border-border bg-surface text-sm font-semibold text-muted hover:text-text disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => beginEdit(goal)}
                          className="rounded px-2 py-1 text-xs font-semibold text-primary hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(goal.id)}
                          className="rounded px-2 py-1 text-xs font-semibold text-danger hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
