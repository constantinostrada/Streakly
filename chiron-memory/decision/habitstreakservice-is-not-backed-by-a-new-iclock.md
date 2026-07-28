---
id: b0251811-3ac5-4e41-81b6-aa33ca94a2ae-2
type: decision
title: HabitStreakService is not backed by a new IClock port
tags: [decision]
created: 2026-07-28
resource: src/application/use-cases/*, src/domain/services/HabitStreakService.ts
---
HabitStreakService is not backed by a new IClock port; use cases pass `asOf` explicitly, computed via `new Date()` in the use case itself

## Why
matches how Habit.complete() already defaults its timestamp, and CLAUDE.md prefers extending existing abstractions over introducing new ones

## Learned
when a service needs "now", pass it in from the use case rather than adding a clock abstraction unless multiple call sites need to share a mocked clock.

## Where
src/application/use-cases/*, src/domain/services/HabitStreakService.ts
