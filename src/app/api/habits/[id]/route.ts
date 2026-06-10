/**
 * INTERFACES LAYER — Route Handler
 * Route: /api/habits/[id]
 *
 * GET    /api/habits/:id  → get a single habit
 * PATCH  /api/habits/:id  → update name / description
 */

import { type NextRequest } from "next/server";

import type { UpdateHabitDto } from "@/application/dtos/HabitDto";
import {
  makeGetHabitUseCase,
  makeUpdateHabitUseCase,
} from "@/interfaces/http/helpers/useCaseFactory";
import { ok, handleError } from "@/interfaces/http/helpers/responseHelpers";

interface RouteParams {
  params: { id: string };
}

// ─── GET /api/habits/:id ──────────────────────────────────────────────────────

export async function GET(_request: NextRequest, { params }: RouteParams): Promise<Response> {
  try {
    const habit = await makeGetHabitUseCase().execute({ id: params.id });
    return ok(habit);
  } catch (error) {
    return handleError(error);
  }
}

// ─── PATCH /api/habits/:id ────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<Response> {
  try {
    const body = (await request.json()) as Partial<UpdateHabitDto>;

    const dto: UpdateHabitDto = {
      id: params.id,
      ...(typeof body.name === "string" && { name: body.name }),
      ...(typeof body.description === "string" && { description: body.description }),
    };

    const habit = await makeUpdateHabitUseCase().execute(dto);
    return ok(habit);
  } catch (error) {
    return handleError(error);
  }
}
