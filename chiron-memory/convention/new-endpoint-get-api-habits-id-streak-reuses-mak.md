---
id: ed82fa36-e4b3-4699-ba4c-44dc74d21e0c-3
type: convention
title: New endpoint GET /api/habits/:id/streak reuses makeGetHabitUseCase() and the existing…
tags: [convention]
created: 2026-07-28
resource: src/app/api/habits/[id]/streak/route.ts
---
New endpoint GET /api/habits/:id/streak reuses makeGetHabitUseCase() and the existing ok()/handleError() response helpers, and just narrows the already-computed DTO down to { habitId, currentStreak, longestStreak } — no new use case was created

## Why
keeps the HTTP layer thin per project convention; the streak computation already lives in HabitStreakService and GetHabitUseCase

## Where
src/app/api/habits/[id]/streak/route.ts
