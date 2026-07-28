/**
 * APPLICATION LAYER — Use Case
 *
 * Records one completion for a habit in the current period.
 * The completion limit invariant is enforced by the Habit entity itself.
 */

import type { IHabitRepository } from "@/domain/repositories/IHabitRepository";
import type { HabitStreakService } from "@/domain/services/HabitStreakService";
import { HabitId } from "@/domain/value-objects/HabitId";
import { HabitNotFoundException } from "@/domain/exceptions/HabitNotFoundException";
import type { CompleteHabitDto, HabitResponseDto } from "../dtos/HabitDto";
import { HabitMapper } from "../mappers/HabitMapper";

export class CompleteHabitUseCase {
  constructor(
    private readonly habitRepository: IHabitRepository,
    private readonly streakService: HabitStreakService,
  ) {}

  public async execute(dto: CompleteHabitDto): Promise<HabitResponseDto> {
    const id = HabitId.from(dto.id);
    const habit = await this.habitRepository.findById(id);

    if (!habit) {
      throw new HabitNotFoundException(dto.id);
    }

    // Domain entity enforces the completion-cap invariant
    habit.complete();

    await this.habitRepository.save(habit);

    // Recalculated after saving, so the response reflects the completion just made.
    const streak = this.streakService.calculate(habit, new Date());

    return HabitMapper.toDto(habit, streak);
  }
}
