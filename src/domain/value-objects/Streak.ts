/**
 * DOMAIN LAYER — Value Object
 *
 * Streak is the result of a streak calculation: the run that is still alive
 * right now, plus the best run the habit has ever achieved.
 *
 * Invariants:
 *  - Both counts are non-negative integers.
 *  - The current streak can never exceed the longest one (the current run is,
 *    by definition, one of the runs the longest is the maximum of).
 */

import { DomainException } from "../exceptions/DomainException";

export class Streak {
  private readonly _current: number;
  private readonly _longest: number;

  private constructor(current: number, longest: number) {
    this._current = current;
    this._longest = longest;
  }

  // ─── Factories ────────────────────────────────────────────────────────────

  /** No completions yet — or nothing that counts. */
  public static none(): Streak {
    return new Streak(0, 0);
  }

  public static of(current: number, longest: number): Streak {
    Streak.validateCount(current, "Current streak");
    Streak.validateCount(longest, "Longest streak");
    if (current > longest) {
      throw new DomainException("Current streak cannot exceed the longest streak.");
    }
    return new Streak(current, longest);
  }

  // ─── Invariant guards ─────────────────────────────────────────────────────

  private static validateCount(value: number, label: string): void {
    if (!Number.isInteger(value) || value < 0) {
      throw new DomainException(`${label} must be a non-negative integer.`);
    }
  }

  // ─── Read-only accessors ──────────────────────────────────────────────────

  /** Consecutive satisfied periods ending in the current (or previous) period. */
  public get current(): number {
    return this._current;
  }

  /** The longest run of consecutive satisfied periods ever recorded. */
  public get longest(): number {
    return this._longest;
  }

  /** True while the habit still has a live streak going. */
  public get isActive(): boolean {
    return this._current > 0;
  }

  public equals(other: Streak): boolean {
    return this._current === other._current && this._longest === other._longest;
  }

  public toString(): string {
    return `${this._current}/${this._longest}`;
  }
}
