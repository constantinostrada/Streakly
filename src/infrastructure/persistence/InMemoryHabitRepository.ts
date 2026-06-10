/**
 * INFRASTRUCTURE LAYER — Repository Implementation
 *
 * InMemoryHabitRepository fulfils the IHabitRepository contract using a plain
 * in-process Map.  This is ideal for local development and demos; swap it for a
 * real DB implementation (e.g. PostgresHabitRepository) without touching any
 * domain or application code.
 *
 * Important:
 *  - State is process-scoped and resets on every server restart.
 *  - In Next.js development mode (hot-reload) a module-level singleton is used
 *    to survive HMR cycles (see repositoryFactory.ts).
 */

import type { IHabitRepository } from "@/domain/repositories/IHabitRepository";
import { Habit } from "@/domain/entities/Habit";
import { HabitFrequency } from "@/domain/value-objects/HabitFrequency";
import { HabitId } from "@/domain/value-objects/HabitId";
import type { HabitId as HabitIdType } from "@/domain/value-objects/HabitId";

/** Internal plain-object snapshot stored in the Map — avoids mutating stored entities. */
interface HabitSnapshot {
  id: string;
  name: string;
  description: string;
  frequencyValue: number;
  period: "daily" | "weekly";
  completionsThisPeriod: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class InMemoryHabitRepository implements IHabitRepository {
  private readonly store = new Map<string, HabitSnapshot>();

  public async save(habit: Habit): Promise<void> {
    this.store.set(habit.id.value, this.toSnapshot(habit));
  }

  public async findById(id: HabitIdType): Promise<Habit | null> {
    const snapshot = this.store.get(id.value);
    if (!snapshot) return null;
    return this.toEntity(snapshot);
  }

  public async findAll(options?: { includeArchived?: boolean }): Promise<Habit[]> {
    const snapshots = Array.from(this.store.values());
    const filtered = options?.includeArchived
      ? snapshots
      : snapshots.filter((s) => !s.isArchived);

    return filtered.map((s) => this.toEntity(s));
  }

  public async delete(id: HabitIdType): Promise<void> {
    this.store.delete(id.value);
  }

  // ─── Private helpers ────────────────────────────────────────────────────

  private toSnapshot(habit: Habit): HabitSnapshot {
    return {
      id: habit.id.value,
      name: habit.name,
      description: habit.description,
      frequencyValue: habit.frequency.value,
      period: habit.period,
      completionsThisPeriod: habit.completionsThisPeriod,
      isArchived: habit.isArchived,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
    };
  }

  private toEntity(snapshot: HabitSnapshot): Habit {
    return Habit.create({
      id: HabitId.from(snapshot.id),
      name: snapshot.name,
      description: snapshot.description,
      frequency: HabitFrequency.of(snapshot.frequencyValue),
      period: snapshot.period,
      completionsThisPeriod: snapshot.completionsThisPeriod,
      isArchived: snapshot.isArchived,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }
}
