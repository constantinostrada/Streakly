/**
 * APPLICATION LAYER — Use Case
 *
 * Soft-deletes a habit by archiving it.
 * Archived habits are hidden from the default list but not permanently deleted.
 */

import type { IHabitRepository } from "@/domain/repositories/IHabitRepository";
import type { HabitStreakService } from "@/domain/services/HabitStreakService";
import { HabitId } from "@/domain/value-objects/HabitId";
import { HabitNotFoundException } from "@/domain/exceptions/HabitNotFoundException";
import type { ArchiveHabitDto, HabitResponseDto } from "../dtos/HabitDto";
import { HabitMapper } from "../mappers/HabitMapper";

export class ArchiveHabitUseCase {
  constructor(
    private readonly habitRepository: IHabitRepository,
    private readonly streakService: HabitStreakService,
  ) {}

  public async execute(dto: ArchiveHabitDto): Promise<HabitResponseDto> {
    const id = HabitId.from(dto.id);
    const habit = await this.habitRepository.findById(id);

    if (!habit) {
      throw new HabitNotFoundException(dto.id);
    }

    // Domain entity enforces "cannot archive twice" invariant
    habit.archive();

    await this.habitRepository.save(habit);

    // Archiving does not erase history — the streaks earned so far still show.
    const streak = this.streakService.calculate(habit, new Date());

    return HabitMapper.toDto(habit, streak);
  }
}
