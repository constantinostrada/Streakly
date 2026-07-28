/**
 * DOMAIN LAYER — Value Object
 *
 * PeriodBucket answers "which daily/weekly slot does this instant belong to?".
 * Slots are identified by a monotonically increasing integer index, so two
 * completions land in the same bucket when their indexes match, and consecutive
 * buckets differ by exactly 1 — which is what streak math needs.
 *
 * Conventions:
 *  - Buckets are computed from the *local* calendar (the user's own day/week),
 *    never from UTC clock time.
 *  - Weekly buckets start on Monday (ISO-8601).
 *
 * Invariants:
 *  - Buckets of different periods (daily vs weekly) are never comparable.
 */

import type { FrequencyPeriod } from "../entities/Habit";
import { DomainException } from "../exceptions/DomainException";

const MS_PER_DAY = 86_400_000;
const DAYS_PER_WEEK = 7;
/** Day 0 (1970-01-01) was a Thursday; +3 moves the week boundary to Monday. */
const MONDAY_ALIGNMENT = 3;

export class PeriodBucket {
  private readonly _period: FrequencyPeriod;
  private readonly _index: number;

  private constructor(period: FrequencyPeriod, index: number) {
    this._period = period;
    this._index = index;
  }

  // ─── Factory ──────────────────────────────────────────────────────────────

  /** The daily/weekly slot the given instant falls into. */
  public static for(date: Date, period: FrequencyPeriod): PeriodBucket {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new DomainException("Cannot determine the period of an invalid date.");
    }
    const day = PeriodBucket.dayIndex(date);
    const index = period === "weekly" ? Math.floor((day + MONDAY_ALIGNMENT) / DAYS_PER_WEEK) : day;
    return new PeriodBucket(period, index);
  }

  /**
   * Whole days since 1970-01-01 for the date's *local* calendar day.
   * Local components are re-expressed as UTC before the division so the
   * arithmetic is immune to DST shifts (a local day is not always 24h long).
   */
  private static dayIndex(date: Date): number {
    const localMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.floor(localMidnight / MS_PER_DAY);
  }

  // ─── Business behaviour ───────────────────────────────────────────────────

  /** The slot immediately before this one. */
  public previous(): PeriodBucket {
    return new PeriodBucket(this._period, this._index - 1);
  }

  /** The slot immediately after this one. */
  public next(): PeriodBucket {
    return new PeriodBucket(this._period, this._index + 1);
  }

  /**
   * How many slots separate this bucket from `other` (negative if `other` is
   * earlier).  Adjacent buckets are exactly 1 apart.
   */
  public distanceTo(other: PeriodBucket): number {
    if (this._period !== other._period) {
      throw new DomainException(
        `Cannot compare a ${this._period} period with a ${other._period} one.`,
      );
    }
    return other._index - this._index;
  }

  // ─── Read-only accessors ──────────────────────────────────────────────────

  public get period(): FrequencyPeriod {
    return this._period;
  }

  public get index(): number {
    return this._index;
  }

  public equals(other: PeriodBucket): boolean {
    return this._period === other._period && this._index === other._index;
  }

  public toString(): string {
    return `${this._period}:${this._index}`;
  }
}
