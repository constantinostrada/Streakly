/**
 * INFRASTRUCTURE LAYER — Repository Factory
 *
 * Returns the singleton repository instance used across the application.
 *
 * In Next.js the module cache is cleared between hot-reload cycles in
 * development mode, which would reset the in-memory store on every file save.
 * We attach the instance to the Node.js `global` object to survive HMR.
 *
 * In production this module is evaluated once, so the singleton is straightforward.
 *
 * To switch to a real database:
 *  1. Create e.g. `PostgresHabitRepository implements IHabitRepository`
 *  2. Instantiate it below instead of InMemoryHabitRepository
 *  3. No other file needs changing.
 */

import type { IHabitRepository } from "@/domain/repositories/IHabitRepository";

import { InMemoryHabitRepository } from "./InMemoryHabitRepository";

// Extend the global type to hold our singleton in development mode
declare global {
  // eslint-disable-next-line no-var
  var __habitRepository: IHabitRepository | undefined;
}

function createRepository(): IHabitRepository {
  return new InMemoryHabitRepository();
}

export function getHabitRepository(): IHabitRepository {
  if (process.env.NODE_ENV === "production") {
    // In production the module is cached normally — no global tricks needed
    return createRepository();
  }

  // Development: reuse the global singleton across HMR reloads
  if (!global.__habitRepository) {
    global.__habitRepository = createRepository();
  }
  return global.__habitRepository;
}
