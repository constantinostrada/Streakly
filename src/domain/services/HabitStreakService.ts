/**
 * DOMAIN LAYER — Domain Service
 *
 * HabitStreakService derives streaks from a Habit's completion history.
 * It is a pure function of (habit, reference instant): no clock, no I/O, no
 * mutation of the habit it inspects.
 *
 * Rules applied here:
 *  - History dates are grouped into the habit's own periods (daily/weekly) via
 *    PeriodBucket, so a habit's streak is counted in *its* unit — days for a
 *    daily habit, weeks for a weekly one.
 *  - A period only counts toward a streak once it is *satisfied*, i.e. it holds
 *    at least `frequency` completions.  For the common "1 per day" habit this is
 *    simply "was it done that day?"; for "3 per week" a week with 2 completions
 *    does not extend the streak.
 *  - Longest streak = the longest run of consecutive satisfied periods ever.
 *  - Current streak = the run of consecutive satisfied periods ending in the
 *    current period, or in the one just before it.  The period in progress is
 *    given grace: it can still be satisfied before it ends, so it does not
 *    break the streak while it is running.
 *  - Any older gap breaks the current streak (it drops to 0), but the longest
 *    streak is never lost.
 *  - Completions dated in the future (after the reference instant) never prop up
 *    the current streak, though they still count toward the longest.
 */

import type { Habit } from "../entities/Habit";
import { PeriodBucket } from "../value-objects/PeriodBucket";
import { Streak } from "../value-objects/Streak";

export class HabitStreakService {
  /**
   * Current and longest streak for a habit, as of the given instant.
   * `asOf` is an explicit parameter (not `new Date()`) to keep this service
   * deterministic — the caller owns the notion of "now".
   */
  public calculate(habit: Habit, asOf: Date): Streak {
    const satisfied = this.satisfiedPeriods(habit);
    if (satisfied.length === 0) return Streak.none();

    const currentPeriod = PeriodBucket.for(asOf, habit.period);
    return Streak.of(this.runEndingAt(satisfied, currentPeriod.index), this.longestRun(satisfied));
  }

  /** Consecutive satisfied periods still alive as of `asOf`; 0 once broken. */
  public currentStreak(habit: Habit, asOf: Date): number {
    return this.calculate(habit, asOf).current;
  }

  /** Best run of consecutive satisfied periods ever recorded — never decreases. */
  public longestStreak(habit: Habit): number {
    return this.longestRun(this.satisfiedPeriods(habit));
  }

  /** The habit with the longest live streak, or null when none has one. */
  public bestActiveStreak(habits: Habit[], asOf: Date): Habit | null {
    let best: Habit | null = null;
    let bestStreak = 0;

    for (const habit of habits) {
      const streak = this.currentStreak(habit, asOf);
      if (streak > bestStreak) {
        best = habit;
        bestStreak = streak;
      }
    }
    return best;
  }

  // ─── Internal calculation ─────────────────────────────────────────────────

  /**
   * Indexes of the periods that reached the habit's required frequency,
   * ascending and de-duplicated.
   */
  private satisfiedPeriods(habit: Habit): number[] {
    const required = habit.frequency.value;
    const completionsPerPeriod = new Map<number, number>();

    for (const date of habit.completionHistory.dates) {
      const index = PeriodBucket.for(date, habit.period).index;
      completionsPerPeriod.set(index, (completionsPerPeriod.get(index) ?? 0) + 1);
    }

    return Array.from(completionsPerPeriod.entries())
      .filter(([, completions]) => completions >= required)
      .map(([index]) => index)
      .sort((a, b) => a - b);
  }

  /** Longest run of consecutive integers in an ascending, de-duplicated list. */
  private longestRun(periods: number[]): number {
    let longest = 0;
    let run = 0;
    let previous: number | null = null;

    for (const index of periods) {
      run = previous !== null && index === previous + 1 ? run + 1 : 1;
      previous = index;
      longest = Math.max(longest, run);
    }
    return longest;
  }

  /**
   * Length of the run ending at `currentIndex` — or at `currentIndex - 1`, since
   * the period in progress may still be satisfied.  Returns 0 if the most recent
   * satisfied period is older than that (the streak is broken).
   */
  private runEndingAt(periods: number[], currentIndex: number): number {
    const past = periods.filter((index) => index <= currentIndex);
    const latest = past[past.length - 1];
    if (latest === undefined || currentIndex - latest > 1) return 0;

    let run = 1;
    let expected = latest - 1;
    for (let i = past.length - 2; i >= 0; i -= 1) {
      if (past[i] !== expected) break;
      run += 1;
      expected -= 1;
    }
    return run;
  }
}
