/**
 * DOMAIN LAYER — Entity
 *
 * Habit is the core aggregate root of the Habit Tracker.
 * It owns all invariants related to a single trackable habit.
 *
 * Rules enforced here:
 *  - A habit must always have a non-empty name.
 *  - Frequency must be a positive integer (times per period).
 *  - A habit cannot be completed more times than its frequency within a period.
 *  - Archived habits cannot be completed.
 *  - Every completion is appended to an immutable history that outlives period
 *    resets (see CompletionHistory) — the raw material for streak calculations.
 */

import type { HabitId } from "../value-objects/HabitId";
import type { HabitFrequency } from "../value-objects/HabitFrequency";
import { CompletionHistory } from "../value-objects/CompletionHistory";
import { DomainException } from "../exceptions/DomainException";

export type FrequencyPeriod = "daily" | "weekly";

export interface HabitProps {
  id: HabitId;
  name: string;
  description: string;
  frequency: HabitFrequency;
  period: FrequencyPeriod;
  completionsThisPeriod: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  /** Every completion ever recorded. Omit for a habit with no history yet. */
  completionHistory?: CompletionHistory;
}

export class Habit {
  private readonly _id: HabitId;
  private _name: string;
  private _description: string;
  private _frequency: HabitFrequency;
  private _period: FrequencyPeriod;
  private _completionsThisPeriod: number;
  private _isArchived: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _completionHistory: CompletionHistory;

  private constructor(props: HabitProps) {
    this._id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._frequency = props.frequency;
    this._period = props.period;
    this._completionsThisPeriod = props.completionsThisPeriod;
    this._isArchived = props.isArchived;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._completionHistory = props.completionHistory ?? CompletionHistory.empty();
  }

  // ─── Factory ──────────────────────────────────────────────────────────────

  public static create(props: HabitProps): Habit {
    Habit.validateName(props.name);
    if (props.completionsThisPeriod < 0) {
      throw new DomainException("Completions cannot be negative.");
    }
    return new Habit(props);
  }

  // ─── Invariant guards ─────────────────────────────────────────────────────

  private static validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new DomainException("Habit name must not be empty.");
    }
    if (name.trim().length > 100) {
      throw new DomainException("Habit name must not exceed 100 characters.");
    }
  }

  // ─── Business behaviour ───────────────────────────────────────────────────

  /**
   * Record one completion for the current period, timestamped at `completedAt`
   * (defaults to now).  The timestamp is appended to the completion history so
   * streaks remain computable after period resets.
   * Throws if the habit is archived or already fully completed.
   */
  public complete(completedAt: Date = new Date()): void {
    if (this._isArchived) {
      throw new DomainException("Cannot complete an archived habit.");
    }
    if (this._completionsThisPeriod >= this._frequency.value) {
      throw new DomainException(
        `Habit "${this._name}" has already been completed ${this._frequency.value} time(s) this ${this._period}.`,
      );
    }
    this._completionsThisPeriod += 1;
    this._completionHistory = this._completionHistory.record(completedAt);
    this._updatedAt = new Date();
  }

  /**
   * Reset completions — called at the start of every new period by a domain service.
   * The completion history is deliberately preserved: it is a permanent log, not
   * a per-period counter.
   */
  public resetPeriod(): void {
    this._completionsThisPeriod = 0;
    this._updatedAt = new Date();
  }

  /** Soft-delete: archive the habit so it no longer appears in active lists. */
  public archive(): void {
    if (this._isArchived) {
      throw new DomainException("Habit is already archived.");
    }
    this._isArchived = true;
    this._updatedAt = new Date();
  }

  /** Restore an archived habit. */
  public restore(): void {
    if (!this._isArchived) {
      throw new DomainException("Habit is not archived.");
    }
    this._isArchived = false;
    this._updatedAt = new Date();
  }

  /** Rename the habit, re-validating the name invariant. */
  public rename(newName: string): void {
    Habit.validateName(newName);
    this._name = newName.trim();
    this._updatedAt = new Date();
  }

  /** Update description. */
  public updateDescription(description: string): void {
    this._description = description;
    this._updatedAt = new Date();
  }

  // ─── Computed properties ──────────────────────────────────────────────────

  public get isCompleted(): boolean {
    return this._completionsThisPeriod >= this._frequency.value;
  }

  public get completionRate(): number {
    if (this._frequency.value === 0) return 0;
    return Math.min(this._completionsThisPeriod / this._frequency.value, 1);
  }

  // ─── Read-only accessors ──────────────────────────────────────────────────

  public get id(): HabitId {
    return this._id;
  }
  public get name(): string {
    return this._name;
  }
  public get description(): string {
    return this._description;
  }
  public get frequency(): HabitFrequency {
    return this._frequency;
  }
  public get period(): FrequencyPeriod {
    return this._period;
  }
  public get completionsThisPeriod(): number {
    return this._completionsThisPeriod;
  }
  public get completionHistory(): CompletionHistory {
    return this._completionHistory;
  }
  public get lastCompletedAt(): Date | null {
    return this._completionHistory.lastCompletedAt;
  }
  public get isArchived(): boolean {
    return this._isArchived;
  }
  public get createdAt(): Date {
    return this._createdAt;
  }
  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
