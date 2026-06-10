/**
 * APPLICATION LAYER — Use Case
 *
 * CreateHabitUseCase orchestrates the creation of a new Habit and its
 * persistence through the repository interface.
 *
 * Dependencies are injected via constructor so the use case remains
 * completely decoupled from any infrastructure concern.
 */

import { Habit } from "@/domain/entities/Habit";
import { HabitId } from "@/domain/value-objects/HabitId";
import { HabitFrequency } from "@/domain/value-objects/HabitFrequency";
import type { IHabitRepository } from "@/domain/repositories/IHabitRepository";
import type { IIdGenerator } from "../ports/IIdGenerator";
import type { CreateHabitDto, HabitResponseDto } from "../dtos/HabitDto";
import { HabitMapper } from "../mappers/HabitMapper";

export class CreateHabitUseCase {
  constructor(
    private readonly habitRepository: IHabitRepository,
    private readonly idGenerator: IIdGenerator,
  ) {}

  public async execute(dto: CreateHabitDto): Promise<HabitResponseDto> {
    const id = HabitId.from(this.idGenerator.generate());
    const frequency = HabitFrequency.of(dto.frequencyValue);
    const now = new Date();

    const habit = Habit.create({
      id,
      name: dto.name.trim(),
      description: dto.description.trim(),
      frequency,
      period: dto.period,
      completionsThisPeriod: 0,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    await this.habitRepository.save(habit);

    return HabitMapper.toDto(habit);
  }
}
