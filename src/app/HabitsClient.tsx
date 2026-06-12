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

import { useState, useCallback, useEffect } from "react";

import type { HabitResponseDto } from "@/application/dtos/HabitDto";

import { DEFAULT_HABIT_COLOR, loadHabitColor, saveHabitColor } from "./components/habitColor";
import { HabitModal, type HabitFormValues } from "./components/HabitModal";
import { HABIT_COMPLETED_EVENT } from "./components/StreakWidget";
import { GoalsWidget } from "./GoalsWidget";
import { HabitGrid } from "./HabitGrid";

/** Which habit (if any) the create/edit modal is currently open for. */
type ModalState = { mode: "create" } | { mode: "edit"; habit: HabitResponseDto } | null;

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

  // ─── Modal state ─────────────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalState>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const clearError = (): void => setError(null);

  const refreshHabits = useCallback(async (): Promise<void> => {
    const res = await fetch("/api/habits");
    const json = (await res.json()) as ApiResponse<HabitResponseDto[]>;
    if (json.success && json.data) {
      setHabits(json.data);
    }
  }, []);

  const openCreate = useCallback((): void => {
    setModalError(null);
    setModal({ mode: "create" });
  }, []);

  const openEdit = useCallback((habit: HabitResponseDto): void => {
    setModalError(null);
    setModal({ mode: "edit", habit });
  }, []);

  const closeModal = useCallback((): void => {
    if (!submitting) setModal(null);
  }, [submitting]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  // Create (POST) or edit (PATCH name) a habit. The accent color is browser-local
  // so it's persisted to localStorage rather than sent to the API.
  const handleSubmit = async (values: HabitFormValues): Promise<void> => {
    if (!modal) return;
    setSubmitting(true);
    setModalError(null);
    try {
      if (modal.mode === "create") {
        const res = await fetch("/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            frequencyValue: values.frequencyValue,
            period: values.period,
          }),
        });
        const json = (await res.json()) as ApiResponse<HabitResponseDto>;
        if (!json.success || !json.data) {
          setModalError(json.error ?? "No se pudo crear el hábito.");
          return;
        }
        saveHabitColor(json.data.id, values.color);
      } else {
        const res = await fetch(`/api/habits/${modal.habit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: values.name }),
        });
        const json = (await res.json()) as ApiResponse<HabitResponseDto>;
        if (!json.success) {
          setModalError(json.error ?? "No se pudo guardar el hábito.");
          return;
        }
        saveHabitColor(modal.habit.id, values.color);
      }
      await refreshHabits();
      setModal(null);
    } finally {
      setSubmitting(false);
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

  // Archive every active habit (the API has no bulk endpoint) after confirmation.
  const handleClearAll = async (): Promise<void> => {
    if (habits.length === 0) return;
    if (!window.confirm("Remove all habits from the list?")) return;
    clearError();
    const responses = await Promise.all(
      habits.map(async (habit) => {
        const res = await fetch(`/api/habits/${habit.id}/archive`, { method: "POST" });
        return (await res.json()) as ApiResponse<HabitResponseDto>;
      }),
    );
    if (responses.some((json) => !json.success)) {
      setError("Some habits could not be cleared.");
    }
    await refreshHabits();
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

      {/* Goals */}
      <div style={{ marginBottom: "2rem" }}>
        <GoalsWidget />
      </div>

      {/* Habit List */}
      <section>
        <div
          style={{
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-muted)" }}>
            Active Habits ({habits.length})
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {habits.length > 0 && (
              <button
                type="button"
                onClick={() => void handleClearAll()}
                title="Remove all habits"
                style={{
                  ...btnStyle,
                  background: "#fef2f2",
                  color: "var(--color-danger)",
                  border: "1px solid #fecaca",
                  cursor: "pointer",
                }}
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={openCreate}
              className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              + Hábito
            </button>
          </div>
        </div>

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
            No habits yet. Tap “+ Hábito” to get started! 🚀
          </p>
        ) : (
          <ul style={{ listStyle: "none", display: "grid", gap: "0.75rem" }}>
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onComplete={() => void handleComplete(habit.id)}
                onArchive={() => void handleArchive(habit.id)}
                onEdit={() => openEdit(habit)}
              />
            ))}
          </ul>
        )}
      </section>

      {modal && (
        <HabitModal
          mode={modal.mode}
          submitting={submitting}
          error={modalError}
          initial={
            modal.mode === "edit"
              ? {
                  name: modal.habit.name,
                  frequencyValue: modal.habit.frequencyValue,
                  period: modal.habit.period,
                  color: loadHabitColor(modal.habit.id),
                }
              : undefined
          }
          onSubmit={(values) => void handleSubmit(values)}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

// ─── HabitCard sub-component ──────────────────────────────────────────────────

interface HabitCardProps {
  habit: HabitResponseDto;
  onComplete: () => void;
  onArchive: () => void;
  onEdit: () => void;
}

function HabitCard({ habit, onComplete, onArchive, onEdit }: HabitCardProps): React.JSX.Element {
  const progressPercent = Math.round(habit.completionRate * 100);

  // Accent color is browser-local; load it after mount to avoid hydration drift.
  const [color, setColor] = useState(DEFAULT_HABIT_COLOR);
  useEffect(() => setColor(loadHabitColor(habit.id)), [habit.id]);

  return (
    <li
      style={{
        background: "var(--color-surface)",
        border: `1px solid ${habit.isCompleted ? "var(--color-success)" : "var(--color-border)"}`,
        borderLeft: `4px solid ${color}`,
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
            <span
              aria-hidden
              style={{
                width: 10,
                height: 10,
                borderRadius: "999px",
                background: color,
                flexShrink: 0,
              }}
            />
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
            onClick={onEdit}
            title="Edit habit"
            style={{
              ...btnStyle,
              background: "var(--color-bg)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
            }}
          >
            Edit
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

const btnStyle: React.CSSProperties = {
  padding: "0.35rem 0.85rem",
  border: "none",
  borderRadius: "var(--radius)",
  fontSize: "0.82rem",
  fontWeight: 600,
};
