---
id: 31991d8b-5082-4457-a296-d83fd518850c-1
type: gotcha
title: HabitGrid (the 30-day contribution grid inside each habit card) computes and displays its…
tags: [gotcha]
created: 2026-07-28
resource: src/app/HabitGrid.tsx vs src/app/HabitsClient.tsx (HabitCard)
---
HabitGrid (the 30-day contribution grid inside each habit card) computes and displays its own streak from browser localStorage, independent of the API's currentStreak/longestStreak fields now shown on the card header

## Why
HabitGrid predates the API-side streak calculation added in Tarea 3, so the two streak sources were never unified

## Learned
a habit card can end up showing two different, possibly conflicting streak numbers; consolidating onto the API-derived streak is future cleanup work, not yet done.

## Where
src/app/HabitGrid.tsx vs src/app/HabitsClient.tsx (HabitCard)
