---
id: b0251811-3ac5-4e41-81b6-aa33ca94a2ae-5
type: convention
title: ListHabitsUseCase computes a single `asOf` instant once and reuses it for every habit's…
tags: [convention]
created: 2026-07-28
resource: src/application/use-cases/ListHabitsUseCase.ts.
---
ListHabitsUseCase computes a single `asOf` instant once and reuses it for every habit's streak calculation in the list

## Why
ensures all rows in a list response agree on the same "now" reference point

## Where
src/application/use-cases/ListHabitsUseCase.ts.
