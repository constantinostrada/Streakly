/**
 * APPLICATION LAYER — Use Case
 *
 * Returns the full list of habits, optionally including archived ones.
 * Every entry carries its streaks, derived by the domain service.
 */

import type { IHabitRepository } from "@/domain/repositories/IHabitRepository";
import type { HabitStreakService } from "@/domain/services/HabitStreakService";
import type { ListHabitsDto, HabitResponseDto } from "../dtos/HabitDto";
import { HabitMapper } from "../mappers/HabitMapper";

export class ListHabitsUseCase {
  constructor(
    private readonly habitRepository: IHabitRepository,
    private readonly streakService: HabitStreakService,
  ) {}

  public async execute(dto: ListHabitsDto): Promise<HabitResponseDto[]> {
    const habits = await this.habitRepository.findAll({
      includeArchived: dto.includeArchived ?? false,
    });

    // A single instant for the whole list, so all streaks agree on "now".
    const asOf = new Date();

    return HabitMapper.toDtoList(habits, (habit) => this.streakService.calculate(habit, asOf));
  }
}
