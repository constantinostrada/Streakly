/**
 * INTERFACES LAYER — Route Handler
 * Route: /api/habits/[id]/streak
 *
 * GET /api/habits/:id/streak  → just the habit's streak counters
 *
 * A thin projection of the habit response: the streaks are already computed by
 * GetHabitUseCase (via the domain's HabitStreakService), so this handler only
 * narrows the payload for clients that don't need the whole habit.
 */

import { type NextRequest } from "next/server";

import { makeGetHabitUseCase } from "@/interfaces/http/helpers/useCaseFactory";
import { ok, handleError } from "@/interfaces/http/helpers/responseHelpers";

interface RouteParams {
  params: { id: string };
}

/** Serialisation shape for this endpoint — presentation only, no domain types. */
interface StreakResponse {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
}

export async function GET(_request: NextRequest, { params }: RouteParams): Promise<Response> {
  try {
    const habit = await makeGetHabitUseCase().execute({ id: params.id });

    const streak: StreakResponse = {
      habitId: habit.id,
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
    };

    return ok(streak);
  } catch (error) {
    return handleError(error);
  }
}
