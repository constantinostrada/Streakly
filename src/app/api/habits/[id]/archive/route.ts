/**
 * INTERFACES LAYER — Route Handler
 * Route: /api/habits/[id]/archive
 *
 * POST /api/habits/:id/archive  → soft-delete (archive) the habit
 */

import { type NextRequest } from "next/server";

import { makeArchiveHabitUseCase } from "@/interfaces/http/helpers/useCaseFactory";
import { ok, handleError } from "@/interfaces/http/helpers/responseHelpers";

interface RouteParams {
  params: { id: string };
}

export async function POST(_request: NextRequest, { params }: RouteParams): Promise<Response> {
  try {
    const habit = await makeArchiveHabitUseCase().execute({ id: params.id });
    return ok(habit);
  } catch (error) {
    return handleError(error);
  }
}
