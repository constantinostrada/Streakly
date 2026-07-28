---
id: b0251811-3ac5-4e41-81b6-aa33ca94a2ae-6
type: convention
title: CompleteHabitUseCase recalculates the streak after saving the new completion, not before
tags: [convention]
created: 2026-07-28
resource: src/application/use-cases/CompleteHabitUseCase.ts.
---
CompleteHabitUseCase recalculates the streak after saving the new completion, not before

## Why
so the returned DTO reflects the just-recorded completion

## Where
src/application/use-cases/CompleteHabitUseCase.ts.
