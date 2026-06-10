/**
 * APPLICATION LAYER — Mapper
 *
 * Converts between domain Habit entities and HabitResponseDto objects.
 * This is the ONLY place where domain types are translated to plain data.
 */

import type { Habit } from "@/domain/entities/Habit";
import type { HabitResponseDto } from "../dtos/HabitDto";

export class HabitMapper {
  public static toDto(habit: Habit): HabitResponseDto {
    return {
      id: habit.id.value,
      name: habit.name,
      description: habit.description,
      frequencyValue: habit.frequency.value,
      period: habit.period,
      completionsThisPeriod: habit.completionsThisPeriod,
      isCompleted: habit.isCompleted,
      completionRate: habit.completionRate,
      isArchived: habit.isArchived,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
    };
  }

  public static toDtoList(habits: Habit[]): HabitResponseDto[] {
    return habits.map(HabitMapper.toDto);
  }
}
