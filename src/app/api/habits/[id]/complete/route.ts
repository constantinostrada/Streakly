/**
 * INTERFACES LAYER — Route Handler
 * Route: /api/habits/[id]/complete
 *
 * POST /api/habits/:id/complete  → record one completion for the habit
 */

import { type NextRequest } from "next/server";

import { makeCompleteHabitUseCase } from "@/interfaces/http/helpers/useCaseFactory";
import { ok, handleError } from "@/interfaces/http/helpers/responseHelpers";

interface RouteParams {
  params: { id: string };
}

export async function POST(_request: NextRequest, { params }: RouteParams): Promise<Response> {
  try {
    const habit = await makeCompleteHabitUseCase().execute({ id: params.id });
    return ok(habit);
  } catch (error) {
    return handleError(error);
  }
}
