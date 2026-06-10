/**
 * APPLICATION LAYER — Use Case
 *
 * Retrieves a single Habit by its id, or throws HabitNotFoundException
 * so the interface layer can translate it to a 404 response.
 */

import type { IHabitRepository } from "@/domain/repositories/IHabitRepository";
import { HabitId } from "@/domain/value-objects/HabitId";
import { HabitNotFoundException } from "@/domain/exceptions/HabitNotFoundException";
import type { GetHabitDto, HabitResponseDto } from "../dtos/HabitDto";
import { HabitMapper } from "../mappers/HabitMapper";

export class GetHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  public async execute(dto: GetHabitDto): Promise<HabitResponseDto> {
    const id = HabitId.from(dto.id);
    const habit = await this.habitRepository.findById(id);

    if (!habit) {
      throw new HabitNotFoundException(dto.id);
    }

    return HabitMapper.toDto(habit);
  }
}
