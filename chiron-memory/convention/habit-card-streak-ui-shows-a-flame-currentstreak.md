---
id: 31991d8b-5082-4457-a296-d83fd518850c-2
type: convention
title: Habit card streak UI shows a 🔥 flame + currentStreak as a bold headline, with…
tags: [convention]
created: 2026-07-28
resource: src/app/HabitsClient.tsx (HabitCard component).
---
Habit card streak UI shows a 🔥 flame + currentStreak as a bold headline, with longestStreak as a subtle subtitle below (e.g. 'Longest: 1 day'), pluralized by the habit's frequencyPeriod (day vs week)

## Why
matches the task spec (headline = current, subtitle = longest) and reuses the existing Tailwind semantic classes (text-text, text-muted) from tailwind.config.ts rather than introducing new colors

## Where
src/app/HabitsClient.tsx (HabitCard component).
