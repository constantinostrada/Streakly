/**
 * INTERFACES LAYER — Response Helpers
 *
 * Thin utilities for producing consistent JSON responses and mapping
 * domain/application exceptions to HTTP status codes.
 * No business logic lives here.
 */

import { NextResponse } from "next/server";

import { DomainException } from "@/domain/exceptions/DomainException";
import { HabitNotFoundException } from "@/domain/exceptions/HabitNotFoundException";

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T): NextResponse {
  return ok(data, 201);
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function handleError(error: unknown): NextResponse {
  if (error instanceof HabitNotFoundException) {
    return NextResponse.json({ success: false, error: error.message }, { status: 404 });
  }

  if (error instanceof DomainException) {
    return NextResponse.json({ success: false, error: error.message }, { status: 422 });
  }

  // Unexpected errors — mask details in production
  const message =
    process.env.NODE_ENV === "development" && error instanceof Error
      ? error.message
      : "An unexpected error occurred.";

  return NextResponse.json({ success: false, error: message }, { status: 500 });
}
