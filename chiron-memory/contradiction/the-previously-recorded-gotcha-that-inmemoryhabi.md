---
id: ed82fa36-e4b3-4699-ba4c-44dc74d21e0c-1
type: contradiction
title: The previously-recorded gotcha that InMemoryHabitRepository's HabitSnapshot has no…
tags: [contradiction]
created: 2026-07-28
resource: src/infrastructure/persistence/InMemoryHabitRepository.ts
---
The previously-recorded gotcha that InMemoryHabitRepository's HabitSnapshot has no completionHistory field (causing toEntity() to always rebuild habits with empty history) has been fixed — HabitSnapshot now carries completionHistory and rebuilds it via CompletionHistory.of(...)

## Why
without persisting completion history, GET /api/habits, GET /api/habits/:id, and GET /api/habits/:id/streak all returned currentStreak/longestStreak as 0 regardless of actual completions, making the streak feature dead on arrival

## Learned
update or remove the old memory entry describing this as an open gap — it is now resolved.

## Where
src/infrastructure/persistence/InMemoryHabitRepository.ts
