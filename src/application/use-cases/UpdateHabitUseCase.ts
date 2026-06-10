/**
 * APPLICATION LAYER — Use Case
 *
 * Updates mutable fields (name, description) of an existing habit.
 * Field-level invariants (e.g. name length) are delegated to the entity.
 */

import type { IHabitRepository } from "@/domain/repositories/IHabitRepository";
import { HabitId } from "@/domain/value-objects/HabitId";
import { HabitNotFoundException } from "@/domain/exceptions/HabitNotFoundException";
import type { UpdateHabitDto, HabitResponseDto } from "../dtos/HabitDto";
import { HabitMapper } from "../mappers/HabitMapper";

export class UpdateHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  public async execute(dto: UpdateHabitDto): Promise<HabitResponseDto> {
    const id = HabitId.from(dto.id);
    const habit = await this.habitRepository.findById(id);

    if (!habit) {
      throw new HabitNotFoundException(dto.id);
    }

    if (dto.name !== undefined) {
      habit.rename(dto.name);
    }

    if (dto.description !== undefined) {
      habit.updateDescription(dto.description);
    }

    await this.habitRepository.save(habit);

    return HabitMapper.toDto(habit);
  }
}
