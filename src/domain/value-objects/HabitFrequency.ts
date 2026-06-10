/**
 * DOMAIN LAYER — Value Object
 *
 * HabitFrequency represents how many times a habit must be performed within
 * a given period (e.g. 3 times per week).
 *
 * Invariants:
 *  - Value must be a positive integer (≥ 1).
 *  - Value must not exceed 99 (safety cap against nonsensical input).
 */

import { DomainException } from "../exceptions/DomainException";

export class HabitFrequency {
  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  public static of(value: number): HabitFrequency {
    if (!Number.isInteger(value) || value < 1) {
      throw new DomainException("HabitFrequency must be a positive integer (≥ 1).");
    }
    if (value > 99) {
      throw new DomainException("HabitFrequency must not exceed 99.");
    }
    return new HabitFrequency(value);
  }

  public get value(): number {
    return this._value;
  }

  public equals(other: HabitFrequency): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return String(this._value);
  }
}
