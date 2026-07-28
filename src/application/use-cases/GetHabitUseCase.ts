/**
 * APPLICATION LAYER — Use Case
 *
 * Retrieves a single Habit by its id, or throws HabitNotFoundException
 * so the interface layer can translate it to a 404 response.
 *
 * The response carries the habit's streaks, derived by the domain service.
 */

import type { IHabitRepository } from "@/domain/repositories/IHabitRepository";
import type { HabitStreakService } from "@/domain/services/HabitStreakService";
import { HabitId } from "@/domain/value-objects/HabitId";
import { HabitNotFoundException } from "@/domain/exceptions/HabitNotFoundException";
import type { GetHabitDto, HabitResponseDto } from "../dtos/HabitDto";
import { HabitMapper } from "../mappers/HabitMapper";

export class GetHabitUseCase {
  constructor(
    private readonly habitRepository: IHabitRepository,
    private readonly streakService: HabitStreakService,
  ) {}

  public async execute(dto: GetHabitDto): Promise<HabitResponseDto> {
    const id = HabitId.from(dto.id);
    const habit = await this.habitRepository.findById(id);

    if (!habit) {
      throw new HabitNotFoundException(dto.id);
    }

    // The use case owns the notion of "now"; the domain service stays deterministic.
    const streak = this.streakService.calculate(habit, new Date());

    return HabitMapper.toDto(habit, streak);
  }
}
