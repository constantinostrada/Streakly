/**
 * INFRASTRUCTURE LAYER — Singleton Repository Export
 *
 * Provides a single, stable export for the habit repository instance so that
 * all Next.js Route Handlers share the same in-memory store.
 *
 * This file is the sole consumer of repositoryFactory so the singleton
 * logic is not duplicated across route files.
 */

import { getHabitRepository } from "./repositoryFactory";

export const habitRepository = getHabitRepository();
