/**
 * APPLICATION LAYER — DTOs
 *
 * Plain data shapes that cross the boundary between the application layer
 * and the interfaces layer.  No domain types leak outward.
 */

import type { FrequencyPeriod } from "@/domain/entities/Habit";

// ─── Input DTOs ──────────────────────────────────────────────────────────────

export interface CreateHabitDto {
  name: string;
  description: string;
  /** How many times per period the habit should be performed. */
  frequencyValue: number;
  period: FrequencyPeriod;
}

export interface UpdateHabitDto {
  id: string;
  name?: string;
  description?: string;
}

export interface CompleteHabitDto {
  id: string;
}

export interface ArchiveHabitDto {
  id: string;
}

export interface GetHabitDto {
  id: string;
}

export interface ListHabitsDto {
  includeArchived?: boolean;
}

// ─── Output DTOs ─────────────────────────────────────────────────────────────

export interface HabitResponseDto {
  id: string;
  name: string;
  description: string;
  frequencyValue: number;
  period: FrequencyPeriod;
  completionsThisPeriod: number;
  isCompleted: boolean;
  completionRate: number;
  isArchived: boolean;
  createdAt: string; // ISO-8601 string — safe to serialise across boundaries
  updatedAt: string;
}
