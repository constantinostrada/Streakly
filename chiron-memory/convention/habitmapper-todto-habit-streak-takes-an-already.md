---
id: b0251811-3ac5-4e41-81b6-aa33ca94a2ae-3
type: convention
title: HabitMapper.toDto(habit, streak) takes an already-computed domain Streak VO and reads…
tags: [convention]
created: 2026-07-28
resource: src/application/mappers/HabitMapper.ts
---
HabitMapper.toDto(habit, streak) takes an already-computed domain Streak VO and reads .current/.longest; toDtoList(habits, streakFor) takes a per-habit resolver function rather than mapping habits.map(HabitMapper.toDto)

## Why
the naive array .map would pass the array index as the second arg instead of a per-habit streak, and moving streak math into the mapper would break the mapper's role as a pure translator

## Learned
mappers must stay pure translators; any derived computation (like streak) is computed upstream in the use case and passed in already-resolved.

## Where
src/application/mappers/HabitMapper.ts
