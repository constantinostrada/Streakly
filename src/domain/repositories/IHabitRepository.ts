/**
 * DOMAIN LAYER — Repository Interface
 *
 * Defines WHAT persistence operations exist for Habits.
 * Contains NO implementation details — those live in infrastructure/.
 *
 * Using this interface keeps the domain and application layers completely
 * decoupled from any specific database technology.
 */

import type { Habit } from "../entities/Habit";
import type { HabitId } from "../value-objects/HabitId";

export interface IHabitRepository {
  /** Persist a new habit or update an existing one (upsert semantics). */
  save(habit: Habit): Promise<void>;

  /** Retrieve a habit by its unique identifier. Returns null if not found. */
  findById(id: HabitId): Promise<Habit | null>;

  /** Retrieve all habits, optionally excluding archived ones. */
  findAll(options?: { includeArchived?: boolean }): Promise<Habit[]>;

  /** Permanently delete a habit record. */
  delete(id: HabitId): Promise<void>;
}
