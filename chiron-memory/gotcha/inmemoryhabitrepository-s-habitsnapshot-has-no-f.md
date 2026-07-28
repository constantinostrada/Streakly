---
id: b0251811-3ac5-4e41-81b6-aa33ca94a2ae-0
type: gotcha
title: InMemoryHabitRepository's HabitSnapshot has no field for completionHistory, so toEntity()…
tags: [gotcha]
created: 2026-07-28
resource: src/infrastructure/persistence/InMemoryHabitRepository.ts
---
InMemoryHabitRepository's HabitSnapshot has no field for completionHistory, so toEntity() always rebuilds habits with empty history

## Why
pre-existing gap from a prior task (Tarea 1), not covered by the streak-exposure task

## Learned
streak math is correct given a full history, but live HTTP responses will show 0/0 or 1/1 right after completion until the snapshot is extended to carry completion history.

## Where
src/infrastructure/persistence/InMemoryHabitRepository.ts
