---
id: ed82fa36-e4b3-4699-ba4c-44dc74d21e0c-5
type: gotcha
title: `npm run type-check` (tsc --noEmit) has 3 pre-existing errors in src/domain/exceptions/…
tags: [gotcha]
created: 2026-07-28
resource: src/domain/exceptions/DomainException.ts and related exception subclasses
---
`npm run type-check` (tsc --noEmit) has 3 pre-existing errors in src/domain/exceptions/ (missing `override` modifiers, and a `.name` narrowing incompatibility in HabitNotFoundException) that predate the streak work and are unrelated to it

## Why
confirmed via `git log`/`git show` that these errors existed before Tarea 2/3 touched the codebase

## Learned
don't assume a dirty `tsc --noEmit` run means your own change broke something — check git history for the offending lines first.

## Where
src/domain/exceptions/DomainException.ts and related exception subclasses
