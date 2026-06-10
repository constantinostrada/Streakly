/**
 * DOMAIN LAYER — Custom Exception
 *
 * Thrown when a requested Habit cannot be found in any repository.
 * Interface layer maps this to an HTTP 404.
 */

import { DomainException } from "./DomainException";

export class HabitNotFoundException extends DomainException {
  public readonly name = "HabitNotFoundException";

  constructor(habitId: string) {
    super(`Habit with id "${habitId}" was not found.`);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
