/**
 * DOMAIN LAYER — Domain Service
 *
 * HabitCompletionService encapsulates logic that operates across multiple
 * Habit entities or that doesn't belong naturally to a single entity.
 *
 * Current responsibilities:
 *  - Bulk-reset all habits at the start of a new period (daily/weekly rollover).
 *  - Calculate an overall completion rate across a set of habits.
 */

import type { Habit } from "../entities/Habit";
import type { FrequencyPeriod } from "../entities/Habit";

export class HabitCompletionService {
  /**
   * Reset the completion counter of every habit whose period matches
   * the given period type.  Called by application-layer scheduled tasks.
   */
  public resetHabitsForNewPeriod(habits: Habit[], period: FrequencyPeriod): Habit[] {
    return habits
      .filter((h) => h.period === period && !h.isArchived)
      .map((h) => {
        h.resetPeriod();
        return h;
      });
  }

  /**
   * Returns the percentage (0–100) of active habits that are fully completed
   * for the current period.
   */
  public overallCompletionPercentage(habits: Habit[]): number {
    const active = habits.filter((h) => !h.isArchived);
    if (active.length === 0) return 0;
    const completed = active.filter((h) => h.isCompleted).length;
    return Math.round((completed / active.length) * 100);
  }
}
