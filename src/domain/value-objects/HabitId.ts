/**
 * DOMAIN LAYER — Value Object
 *
 * HabitId wraps a plain string UUID to make the concept explicit in the type
 * system.  Two HabitId instances are equal when their underlying values match.
 *
 * No third-party ID generation is used here; callers (infrastructure or
 * application factory helpers) are responsible for providing a valid UUID
 * string, keeping this value object free of side-effects.
 */

import { DomainException } from "../exceptions/DomainException";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class HabitId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static from(value: string): HabitId {
    if (!value || !UUID_REGEX.test(value)) {
      throw new DomainException(`"${value}" is not a valid HabitId (UUID v4 expected).`);
    }
    return new HabitId(value);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: HabitId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
