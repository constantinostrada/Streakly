/**
 * DOMAIN LAYER — Custom Exception
 *
 * Base class for all domain-level errors.  Using a distinct type lets
 * infrastructure and interface layers catch domain violations separately from
 * unexpected system errors.
 */

export class DomainException extends Error {
  public readonly name = "DomainException";

  constructor(message: string) {
    super(message);
    // Restore prototype chain in transpiled environments
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
