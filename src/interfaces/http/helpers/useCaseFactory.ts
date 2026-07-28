/**
 * INTERFACES LAYER — Use Case Factory
 *
 * Wires together infrastructure implementations and application use cases.
 * This is the composition root for the HTTP interface — the ONLY place where
 * concrete infrastructure classes are referenced alongside use cases.
 *
 * Controllers/route handlers call these factory functions to get pre-wired
 * use case instances.
 */

import { habitRepository } from "@/infrastructure/persistence/singletonRepository";
import { UuidGenerator } from "@/infrastructure/id/UuidGenerator";

import { HabitStreakService } from "@/domain/services/HabitStreakService";

import { CreateHabitUseCase } from "@/application/use-cases/CreateHabitUseCase";
import { GetHabitUseCase } from "@/application/use-cases/GetHabitUseCase";
import { ListHabitsUseCase } from "@/application/use-cases/ListHabitsUseCase";
import { CompleteHabitUseCase } from "@/application/use-cases/CompleteHabitUseCase";
import { UpdateHabitUseCase } from "@/application/use-cases/UpdateHabitUseCase";
import { ArchiveHabitUseCase } from "@/application/use-cases/ArchiveHabitUseCase";

const idGenerator = new UuidGenerator();
/** Stateless domain service — one shared instance is enough. */
const streakService = new HabitStreakService();

export const makeCreateHabitUseCase = (): CreateHabitUseCase =>
  new CreateHabitUseCase(habitRepository, idGenerator, streakService);

export const makeGetHabitUseCase = (): GetHabitUseCase =>
  new GetHabitUseCase(habitRepository, streakService);

export const makeListHabitsUseCase = (): ListHabitsUseCase =>
  new ListHabitsUseCase(habitRepository, streakService);

export const makeCompleteHabitUseCase = (): CompleteHabitUseCase =>
  new CompleteHabitUseCase(habitRepository, streakService);

export const makeUpdateHabitUseCase = (): UpdateHabitUseCase =>
  new UpdateHabitUseCase(habitRepository, streakService);

export const makeArchiveHabitUseCase = (): ArchiveHabitUseCase =>
  new ArchiveHabitUseCase(habitRepository, streakService);
