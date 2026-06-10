/**
 * APPLICATION LAYER — Use Case
 *
 * Soft-deletes a habit by archiving it.
 * Archived habits are hidden from the default list but not permanently deleted.
 */

import type { IHabitRepository } from "@/domain/repositories/IHabitRepository";
import { HabitId } from "@/domain/value-objects/HabitId";
import { HabitNotFoundException } from "@/domain/exceptions/HabitNotFoundException";
import type { ArchiveHabitDto, HabitResponseDto } from "../dtos/HabitDto";
import { HabitMapper } from "../mappers/HabitMapper";

export class ArchiveHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  public async execute(dto: ArchiveHabitDto): Promise<HabitResponseDto> {
    const id = HabitId.from(dto.id);
    const habit = await this.habitRepository.findById(id);

    if (!habit) {
      throw new HabitNotFoundException(dto.id);
    }

    // Domain entity enforces "cannot archive twice" invariant
    habit.archive();

    await this.habitRepository.save(habit);

    return HabitMapper.toDto(habit);
  }
}
