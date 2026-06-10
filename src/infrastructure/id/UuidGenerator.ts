/**
 * INFRASTRUCTURE LAYER — IIdGenerator implementation
 *
 * Wraps the `uuid` library to satisfy the IIdGenerator port defined in the
 * application layer.  Infrastructure is the only layer that imports third-party
 * packages for ID generation.
 */

import { v4 as uuidv4 } from "uuid";

import type { IIdGenerator } from "@/application/ports/IIdGenerator";

export class UuidGenerator implements IIdGenerator {
  public generate(): string {
    return uuidv4();
  }
}
