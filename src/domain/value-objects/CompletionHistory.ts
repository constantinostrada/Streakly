/**
 * DOMAIN LAYER — Value Object
 *
 * CompletionHistory is the immutable log of every moment a habit was completed.
 * Unlike `Habit.completionsThisPeriod` (a counter that is wiped on every period
 * rollover), this history is never reset — it is the raw material streaks are
 * computed from.
 *
 * Invariants:
 *  - Every entry must be a valid Date.
 *  - Entries are always kept in ascending chronological order.
 *  - The instance is immutable: `record()` returns a new history.
 */

import { DomainException } from "../exceptions/DomainException";

export class CompletionHistory {
  private readonly _dates: readonly Date[];

  private constructor(dates: readonly Date[]) {
    this._dates = dates;
  }

  // ─── Factories ────────────────────────────────────────────────────────────

  /** A habit that has never been completed. */
  public static empty(): CompletionHistory {
    return new CompletionHistory([]);
  }

  /** Build a history from previously recorded completion dates (any order). */
  public static of(dates: readonly Date[]): CompletionHistory {
    const entries = dates.map((date) => CompletionHistory.copyValid(date));
    entries.sort((a, b) => a.getTime() - b.getTime());
    return new CompletionHistory(entries);
  }

  // ─── Invariant guards ─────────────────────────────────────────────────────

  /** Defensive copy — callers must never be able to mutate a stored entry. */
  private static copyValid(date: Date): Date {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new DomainException("A completion must be recorded with a valid date.");
    }
    return new Date(date.getTime());
  }

  // ─── Business behaviour ───────────────────────────────────────────────────

  /** Append one completion, returning a new history (this one is untouched). */
  public record(date: Date): CompletionHistory {
    const entry = CompletionHistory.copyValid(date);
    const last = this._dates[this._dates.length - 1];

    // Fast path: chronological appends (the normal case) skip re-sorting.
    if (last === undefined || last.getTime() <= entry.getTime()) {
      return new CompletionHistory([...this._dates, entry]);
    }
    return CompletionHistory.of([...this._dates, entry]);
  }

  // ─── Read-only accessors ──────────────────────────────────────────────────

  /** Completion dates, oldest first. Returns copies to preserve immutability. */
  public get dates(): Date[] {
    return this._dates.map((date) => new Date(date.getTime()));
  }

  public get count(): number {
    return this._dates.length;
  }

  public get isEmpty(): boolean {
    return this._dates.length === 0;
  }

  public get lastCompletedAt(): Date | null {
    const last = this._dates[this._dates.length - 1];
    return last === undefined ? null : new Date(last.getTime());
  }

  public equals(other: CompletionHistory): boolean {
    if (this._dates.length !== other._dates.length) return false;
    return this._dates.every((date, i) => date.getTime() === other._dates[i]?.getTime());
  }
}
