---
id: 31991d8b-5082-4457-a296-d83fd518850c-0
type: gotcha
title: The home page (src/app/page.tsx) had `<HabitsClient>` accidentally removed by an earlier…
tags: [gotcha]
created: 2026-07-28
resource: src/app/page.tsx
---
The home page (src/app/page.tsx) had `<HabitsClient>` accidentally removed by an earlier commit (ec95d2f, the TipWidget task), so habits were fetched server-side but never rendered as a list

## Why
introduced silently by an unrelated feature commit, not caught until Tarea 4 needed the cards to exist

## Learned
verify the home page actually renders the habit list before building on top of it — check git blame/log on page.tsx if the list seems missing.

## Where
src/app/page.tsx
