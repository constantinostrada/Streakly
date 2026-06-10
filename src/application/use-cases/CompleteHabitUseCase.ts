/**
 * APPLICATION LAYER — Use Case
 *
 * Records one completion for a habit in the current period.
 * The completion limit invariant is enforced by the Habit entity itself.
 */

import type { IHabitRepository } from "@/domain/repositories/IHabitRepository";
import { HabitId } from "@/domain/value-objects/HabitId";
import { HabitNotFoundException } from "@/domain/exceptions/HabitNotFoundException";
import type { CompleteHabitDto, HabitResponseDto } from "../dtos/HabitDto";
import { HabitMapper } from "../mappers/HabitMapper";

export class CompleteHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  public async execute(dto: CompleteHabitDto): Promise<HabitResponseDto> {
    const id = HabitId.from(dto.id);
    const habit = await this.habitRepository.findById(id);

    if (!habit) {
      throw new HabitNotFoundException(dto.id);
    }

    // Domain entity enforces the completion-cap invariant
    habit.complete();

    await this.habitRepository.save(habit);

    return HabitMapper.toDto(habit);
  }
}
