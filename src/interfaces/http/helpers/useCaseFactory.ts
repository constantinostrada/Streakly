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

import { CreateHabitUseCase } from "@/application/use-cases/CreateHabitUseCase";
import { GetHabitUseCase } from "@/application/use-cases/GetHabitUseCase";
import { ListHabitsUseCase } from "@/application/use-cases/ListHabitsUseCase";
import { CompleteHabitUseCase } from "@/application/use-cases/CompleteHabitUseCase";
import { UpdateHabitUseCase } from "@/application/use-cases/UpdateHabitUseCase";
import { ArchiveHabitUseCase } from "@/application/use-cases/ArchiveHabitUseCase";

const idGenerator = new UuidGenerator();

export const makeCreateHabitUseCase = (): CreateHabitUseCase =>
  new CreateHabitUseCase(habitRepository, idGenerator);

export const makeGetHabitUseCase = (): GetHabitUseCase =>
  new GetHabitUseCase(habitRepository);

export const makeListHabitsUseCase = (): ListHabitsUseCase =>
  new ListHabitsUseCase(habitRepository);

export const makeCompleteHabitUseCase = (): CompleteHabitUseCase =>
  new CompleteHabitUseCase(habitRepository);

export const makeUpdateHabitUseCase = (): UpdateHabitUseCase =>
  new UpdateHabitUseCase(habitRepository);

export const makeArchiveHabitUseCase = (): ArchiveHabitUseCase =>
  new ArchiveHabitUseCase(habitRepository);
