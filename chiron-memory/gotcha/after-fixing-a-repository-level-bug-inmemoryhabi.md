---
id: ed82fa36-e4b3-4699-ba4c-44dc74d21e0c-4
type: gotcha
title: After fixing a repository-level bug (InMemoryHabitRepository persistence), the running…
tags: [gotcha]
created: 2026-07-28
resource: src/infrastructure/persistence/InMemoryHabitRepository.ts
---
After fixing a repository-level bug (InMemoryHabitRepository persistence), the running Next.js dev server kept returning stale (zeroed) data until `.next` was removed and the server fully restarted, even though the source file was saved

## Why
Next's dev-server HMR singleton held onto the old in-memory repository instance across the edit

## Learned
when verifying a fix to stateful in-memory infrastructure, always `rm -rf .next` and restart the dev server rather than trusting hot-reload — this reinforces the existing HMR singleton gotcha but shows it also bites plain bugfixes, not just refactors.

## Where
src/infrastructure/persistence/InMemoryHabitRepository.ts
