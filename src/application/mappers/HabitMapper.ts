/**
 * APPLICATION LAYER — Mapper
 *
 * Converts between domain Habit entities and HabitResponseDto objects.
 * This is the ONLY place where domain types are translated to plain data.
 *
 * The mapper stays a pure translator: streaks are *calculated* by the domain
 * (HabitStreakService) and handed in already computed, so no business rule
 * lives here.
 */

import type { Habit } from "@/domain/entities/Habit";
import type { Streak } from "@/domain/value-objects/Streak";
import type { HabitResponseDto } from "../dtos/HabitDto";

export class HabitMapper {
  public static toDto(habit: Habit, streak: Streak): HabitResponseDto {
    return {
      id: habit.id.value,
      name: habit.name,
      description: habit.description,
      frequencyValue: habit.frequency.value,
      period: habit.period,
      completionsThisPeriod: habit.completionsThisPeriod,
      isCompleted: habit.isCompleted,
      completionRate: habit.completionRate,
      currentStreak: streak.current,
      longestStreak: streak.longest,
      isArchived: habit.isArchived,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
    };
  }

  /**
   * Maps a list of habits, resolving each habit's streak through `streakFor`.
   * A resolver (rather than a parallel array) keeps habit and streak paired.
   */
  public static toDtoList(
    habits: Habit[],
    streakFor: (habit: Habit) => Streak,
  ): HabitResponseDto[] {
    return habits.map((habit) => HabitMapper.toDto(habit, streakFor(habit)));
  }
}
