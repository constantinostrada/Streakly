"use client";

/**
 * INTERFACES LAYER — Client Component
 *
 * HabitModal is a reusable dialog for creating or editing a habit. It collects
 * a name (required), a frequency (times per period) and an accent color, then
 * hands the values to the parent via onSubmit. All persistence (API call for
 * name/frequency, localStorage for color) is the parent's responsibility — this
 * component only owns form state and validation.
 *
 * Note: the backend cannot change an existing habit's frequency, so in edit
 * mode the frequency field is shown read-only for context.
 */

import { useEffect, useId, useRef, useState } from "react";

import { DEFAULT_HABIT_COLOR, HABIT_COLORS } from "./habitColor";

export interface HabitFormValues {
  name: string;
  frequencyValue: number;
  period: "daily" | "weekly";
  color: string;
}

interface HabitModalProps {
  mode: "create" | "edit";
  initial?: Partial<HabitFormValues>;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (values: HabitFormValues) => void;
  onClose: () => void;
}

export function HabitModal({
  mode,
  initial,
  submitting = false,
  error = null,
  onSubmit,
  onClose,
}: HabitModalProps): React.JSX.Element {
  const [name, setName] = useState(initial?.name ?? "");
  const [frequencyValue, setFrequencyValue] = useState(initial?.frequencyValue ?? 1);
  const [period, setPeriod] = useState<"daily" | "weekly">(initial?.period ?? "daily");
  const [color, setColor] = useState(initial?.color ?? DEFAULT_HABIT_COLOR);
  const [touched, setTouched] = useState(false);

  const titleId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const nameValid = name.trim().length > 0;
  const isEdit = mode === "edit";

  // Focus the name field on open and close on Escape.
  useEffect(() => {
    nameInputRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return (): void => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setTouched(true);
    if (!nameValid || submitting) return;
    onSubmit({ name: name.trim(), frequencyValue, period, color });
  };

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 id={titleId} className="text-lg font-semibold">
            {isEdit ? "✏️ Editar hábito" : "➕ Nuevo hábito"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded px-2 text-xl leading-none text-muted hover:text-text"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* Name */}
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            Nombre
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="Ej. Leer 20 minutos"
              aria-invalid={touched && !nameValid}
              className="rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            {touched && !nameValid && (
              <span className="text-xs font-normal text-danger">El nombre es obligatorio.</span>
            )}
          </label>

          {/* Frequency */}
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex w-28 flex-col gap-1 text-xs font-medium text-muted">
              Frecuencia
              <input
                type="number"
                min={1}
                max={99}
                value={frequencyValue}
                disabled={isEdit}
                onChange={(e) => setFrequencyValue(Math.max(1, Number(e.target.value) || 1))}
                className="rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-50"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-muted">
              Período
              <select
                value={period}
                disabled={isEdit}
                onChange={(e) => setPeriod(e.target.value as "daily" | "weekly")}
                className="rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-50"
              >
                <option value="daily">por día</option>
                <option value="weekly">por semana</option>
              </select>
            </label>
          </div>
          {isEdit && (
            <span className="-mt-2 text-xs text-muted">La frecuencia no puede modificarse.</span>
          )}

          {/* Color */}
          <div className="flex flex-col gap-1 text-xs font-medium text-muted">
            Color
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((c) => {
                const selected = c.value === color;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    aria-label={c.name}
                    aria-pressed={selected}
                    title={c.name}
                    style={{ backgroundColor: c.value }}
                    className={`h-7 w-7 rounded-full transition-transform ${
                      selected
                        ? "scale-110 ring-2 ring-text ring-offset-2 ring-offset-surface"
                        : "hover:scale-105"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          {/* Actions */}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted hover:text-text"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!nameValid || submitting}
              className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear hábito"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
