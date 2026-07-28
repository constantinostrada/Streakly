---
id: 31991d8b-5082-4457-a296-d83fd518850c-3
type: gotcha
title: `npx tsc --noEmit` fails with pre-existing 'override modifier' errors (TS4114/TS2416) in…
tags: [gotcha]
created: 2026-07-28
---
`npx tsc --noEmit` fails with pre-existing 'override modifier' errors (TS4114/TS2416) in src/domain/exceptions/DomainException.ts and HabitNotFoundException.ts, unrelated to any specific feature work

## Why
confirmed identical via `git stash` before/after change — not introduced by any single task

## Learned
don't treat these specific tsc errors as a regression signal when verifying a change; compare against a stash baseline instead.
