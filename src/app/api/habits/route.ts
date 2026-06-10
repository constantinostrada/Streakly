/**
 * INTERFACES LAYER — Route Handler
 * Route: /api/habits
 *
 * GET  /api/habits          → list all habits
 * POST /api/habits          → create a new habit
 *
 * Controllers are intentionally thin:
 *   1. Parse & validate the raw request
 *   2. Call the appropriate use case
 *   3. Serialise and return the response
 */

import { type NextRequest } from "next/server";

import type { CreateHabitDto, ListHabitsDto } from "@/application/dtos/HabitDto";
import {
  makeCreateHabitUseCase,
  makeListHabitsUseCase,
} from "@/interfaces/http/helpers/useCaseFactory";
import { ok, created, handleError } from "@/interfaces/http/helpers/responseHelpers";

// ─── GET /api/habits ──────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = request.nextUrl;
    const includeArchived = searchParams.get("includeArchived") === "true";

    const dto: ListHabitsDto = { includeArchived };
    const habits = await makeListHabitsUseCase().execute(dto);

    return ok(habits);
  } catch (error) {
    return handleError(error);
  }
}

// ─── POST /api/habits ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = (await request.json()) as Partial<CreateHabitDto>;

    // Schema-level validation only — business rules are enforced in the domain
    if (!body.name || typeof body.name !== "string") {
      return handleError(new Error("Field 'name' is required and must be a string."));
    }
    if (!body.frequencyValue || typeof body.frequencyValue !== "number") {
      return handleError(
        new Error("Field 'frequencyValue' is required and must be a number."),
      );
    }
    if (!body.period || !["daily", "weekly"].includes(body.period)) {
      return handleError(
        new Error("Field 'period' is required and must be 'daily' or 'weekly'."),
      );
    }

    const dto: CreateHabitDto = {
      name: body.name,
      description: body.description ?? "",
      frequencyValue: body.frequencyValue,
      period: body.period,
    };

    const habit = await makeCreateHabitUseCase().execute(dto);

    return created(habit);
  } catch (error) {
    return handleError(error);
  }
}
