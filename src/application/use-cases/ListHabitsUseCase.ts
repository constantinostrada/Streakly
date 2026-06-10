/**
 * APPLICATION LAYER — Use Case
 *
 * Returns the full list of habits, optionally including archived ones.
 */

import type { IHabitRepository } from "@/domain/repositories/IHabitRepository";
import type { ListHabitsDto, HabitResponseDto } from "../dtos/HabitDto";
import { HabitMapper } from "../mappers/HabitMapper";

export class ListHabitsUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  public async execute(dto: ListHabitsDto): Promise<HabitResponseDto[]> {
    const habits = await this.habitRepository.findAll({
      includeArchived: dto.includeArchived ?? false,
    });

    return HabitMapper.toDtoList(habits);
  }
}
