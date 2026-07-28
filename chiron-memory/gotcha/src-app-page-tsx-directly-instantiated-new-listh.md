---
id: ed82fa36-e4b3-4699-ba4c-44dc74d21e0c-0
type: gotcha
title: src/app/page.tsx directly instantiated `new ListHabitsUseCase(habitRepository)` instead…
tags: [gotcha]
created: 2026-07-28
resource: src/app/page.tsx
---
src/app/page.tsx directly instantiated `new ListHabitsUseCase(habitRepository)` instead of going through the composition-root factory, so it silently broke compilation when Tarea 2 added a `HabitStreakService` constructor arg to that use case

## Why
not every call site had been migrated to the factory pattern when the use case's dependencies changed

## Learned
before touching a use case's constructor, grep for direct `new <UseCase>(` instantiations outside src/interfaces/http/helpers/useCaseFactory.ts — they bypass the composition root and won't be caught until `tsc` runs.

## Where
src/app/page.tsx
