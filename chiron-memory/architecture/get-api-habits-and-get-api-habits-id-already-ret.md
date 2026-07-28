---
id: ed82fa36-e4b3-4699-ba4c-44dc74d21e0c-2
type: architecture
title: GET /api/habits and GET /api/habits/:id already return currentStreak and longestStreak…
tags: [architecture]
created: 2026-07-28
resource: src/application/dtos/HabitDto.ts, src/application/use-cases/*.ts
---
GET /api/habits and GET /api/habits/:id already return currentStreak and longestStreak with no code changes needed, because Tarea 2 made those fields required on HabitResponseDto and had every use case (Get, List, Create, Complete, Update, Archive) compute them via HabitStreakService

## Why
the response DTO and use-case layer were already streak-aware before this task started

## Learned
verify against a live server before assuming a listed deliverable requires new code — this one didn't.

## Where
src/application/dtos/HabitDto.ts, src/application/use-cases/*.ts
