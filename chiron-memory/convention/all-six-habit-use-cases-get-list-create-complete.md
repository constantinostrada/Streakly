---
id: b0251811-3ac5-4e41-81b6-aa33ca94a2ae-4
type: convention
title: All six Habit use cases (Get, List, Create, Complete, Update, Archive) receive…
tags: [convention]
created: 2026-07-28
resource: src/application/use-cases/*.ts, src/interfaces/http/helpers/useCaseFactory.ts (wires one shared stateless HabitStreakService instance, same pattern as idGenerator).
---
All six Habit use cases (Get, List, Create, Complete, Update, Archive) receive HabitStreakService via constructor DI and compute the streak before mapping to DTO

## Why
HabitResponseDto's currentStreak/longestStreak fields are required, so extending only Get/List would force fake zero values in the other use cases' responses

## Where
src/application/use-cases/*.ts, src/interfaces/http/helpers/useCaseFactory.ts (wires one shared stateless HabitStreakService instance, same pattern as idGenerator).
