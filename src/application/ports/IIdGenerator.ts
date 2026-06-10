/**
 * APPLICATION LAYER — Port Interface
 *
 * Abstracts UUID generation so the application layer never depends directly
 * on a concrete library (uuid, nanoid, crypto, etc.).
 * The concrete implementation lives in infrastructure/.
 */

export interface IIdGenerator {
  generate(): string;
}
