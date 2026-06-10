"use client";

/**
 * INTERFACES LAYER — Client Component
 *
 * HabitsClient owns all interactive UI state for the habits dashboard:
 *  - Displays the habit list
 *  - Provides a form to create new habits
 *  - Handles "complete" and "archive" actions via the REST API
 *
 * Validation: only input-presence checks live here.
 * All business rules are enforced server-side in the domain layer.
 */

import { useState, useCallback } from "react";

import type { HabitResponseDto } from "@/application/dtos/HabitDto";

import { HABIT_COMPLETED_EVENT } from "./components/StreakWidget";
import { GoalsWidget } from "./GoalsWidget";
import { HabitGrid } from "./HabitGrid";

interface HabitsClientProps {
  initialHabits: HabitResponseDto[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function HabitsClient({ initialHabits }: HabitsClientProps): React.JSX.Element {
  const [habits, setHabits] = useState<HabitResponseDto[]>(initialHabits);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ─── Form state ────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequencyValue, setFrequencyValue] = useState(1);
  const [period, setPeriod] = useState<"daily" | "weekly">("daily");

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const clearError = (): void => setError(null);

  const refreshHabits = useCallback(async (): Promise<void> => {
    const res = await fetch("/api/habits");
    const json = (await res.json()) as ApiResponse<HabitResponseDto[]>;
    if (json.success && json.data) {
      setHabits(json.data);
    }
  }, []);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    clearError();

    if (!name.trim()) {
      setError("Habit name is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, frequencyValue, period }),
      });
      const json = (await res.json()) as ApiResponse<HabitResponseDto>;
      if (!json.success) {
        setError(json.error ?? "Failed to create habit.");
      } else {
        setName("");
        setDescription("");
        setFrequencyValue(1);
        setPeriod("daily");
        await refreshHabits();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: string): Promise<void> => {
    clearError();
    const res = await fetch(`/api/habits/${id}/complete`, { method: "POST" });
    const json = (await res.json()) as ApiResponse<HabitResponseDto>;
    if (!json.success) {
      setError(json.error ?? "Failed to complete habit.");
    } else {
      // Signal interested widgets (e.g. StreakWidget) that a habit was completed.
      window.dispatchEvent(new Event(HABIT_COMPLETED_EVENT));
      await refreshHabits();
    }
  };

  const handleArchive = async (id: string): Promise<void> => {
    clearError();
    const res = await fetch(`/api/habits/${id}/archive`, { method: "POST" });
    const json = (await res.json()) as ApiResponse<HabitResponseDto>;
    if (!json.success) {
      setError(json.error ?? "Failed to archive habit.");
    } else {
      await refreshHabits();
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          style={{
            background: "#fee2e2",
            border: "1px solid var(--color-danger)",
            borderRadius: "var(--radius)",
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            color: "#991b1b",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{error}</span>
          <button
            onClick={clearError}
            style={{ background: "none", border: "none", fontWeight: 700, cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Create Habit Form */}
      <section
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius)",
          padding: "1.5rem",
          marginBottom: "2rem",
          boxShadow: "var(--shadow)",
        }}
      >
        <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 }}>
          ➕ Add a new habit
        </h2>
        <form onSubmit={(e) => void handleCreate(e)}>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <input
              type="text"
              placeholder="Habit name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
                  Times per period:
                </span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={frequencyValue}
                  onChange={(e) => setFrequencyValue(Number(e.target.value))}
                  style={{ ...inputStyle, width: "5rem" }}
                />
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as "daily" | "weekly")}
                style={inputStyle}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "var(--color-muted)" : "var(--color-primary)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius)",
                padding: "0.6rem 1.25rem",
                fontWeight: 600,
                fontSize: "0.95rem",
                alignSelf: "flex-start",
              }}
            >
              {loading ? "Creating…" : "Create Habit"}
            </button>
          </div>
        </form>
      </section>

      {/* Goals */}
      <div style={{ marginBottom: "2rem" }}>
        <GoalsWidget />
      </div>

      {/* Habit List */}
      <section>
        <h2
          style={{
            marginBottom: "1rem",
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "var(--color-muted)",
          }}
        >
          Active Habits ({habits.length})
        </h2>

        {habits.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "var(--color-muted)",
              padding: "3rem 0",
              border: "2px dashed var(--color-border)",
              borderRadius: "var(--radius)",
            }}
          >
            No habits yet. Add one above to get started! 🚀
          </p>
        ) : (
          <ul style={{ listStyle: "none", display: "grid", gap: "0.75rem" }}>
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onComplete={() => void handleComplete(habit.id)}
                onArchive={() => void handleArchive(habit.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ─── HabitCard sub-component ──────────────────────────────────────────────────

interface HabitCardProps {
  habit: HabitResponseDto;
  onComplete: () => void;
  onArchive: () => void;
}

function HabitCard({ habit, onComplete, onArchive }: HabitCardProps): React.JSX.Element {
  const progressPercent = Math.round(habit.completionRate * 100);

  return (
    <li
      style={{
        background: "var(--color-surface)",
        border: `1px solid ${habit.isCompleted ? "var(--color-success)" : "var(--color-border)"}`,
        borderRadius: "var(--radius)",
        padding: "1rem 1.25rem",
        boxShadow: "var(--shadow)",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span
            style={{
              fontWeight: 600,
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            {habit.isCompleted ? "✅" : "⭕"} {habit.name}
          </span>
          {habit.description && (
            <p style={{ fontSize: "0.85rem", color: "var(--color-muted)", marginTop: "0.15rem" }}>
              {habit.description}
            </p>
          )}
        </div>
        <span
          style={{
            fontSize: "0.75rem",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "999px",
            padding: "0.15rem 0.6rem",
            color: "var(--color-muted)",
            whiteSpace: "nowrap",
          }}
        >
          {habit.period}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: "6px",
          background: "var(--color-border)",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: habit.isCompleted ? "var(--color-success)" : "var(--color-primary)",
            borderRadius: "999px",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Streak grid (last ~30 days, persisted in localStorage) */}
      <HabitGrid habitId={habit.id} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
          {habit.completionsThisPeriod} / {habit.frequencyValue} completions
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={onComplete}
            disabled={habit.isCompleted}
            title={habit.isCompleted ? "Already completed!" : "Mark complete"}
            style={{
              ...btnStyle,
              background: habit.isCompleted ? "var(--color-border)" : "var(--color-primary)",
              color: habit.isCompleted ? "var(--color-muted)" : "#fff",
              cursor: habit.isCompleted ? "not-allowed" : "pointer",
            }}
          >
            ✓ Complete
          </button>
          <button
            onClick={onArchive}
            title="Archive habit"
            style={{ ...btnStyle, background: "#fef2f2", color: "var(--color-danger)", border: "1px solid #fecaca" }}
          >
            Archive
          </button>
        </div>
      </div>
    </li>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius)",
  fontSize: "0.95rem",
  width: "100%",
  background: "var(--color-bg)",
  color: "var(--color-text)",
};

const btnStyle: React.CSSProperties = {
  padding: "0.35rem 0.85rem",
  border: "none",
  borderRadius: "var(--radius)",
  fontSize: "0.82rem",
  fontWeight: 600,
};
