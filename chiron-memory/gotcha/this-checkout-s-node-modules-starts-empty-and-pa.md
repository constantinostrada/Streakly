---
id: ed82fa36-e4b3-4699-ba4c-44dc74d21e0c-6
type: gotcha
title: This checkout's `node_modules` starts empty and `package-lock.json` is out of sync with…
tags: [gotcha]
created: 2026-07-28
resource: package.json / package-lock.json (repo root)
---
This checkout's `node_modules` starts empty and `package-lock.json` is out of sync with `package.json`, so a plain `npm install` (needed before `tsc`/`next lint` will run at all) rewrites the lockfile even though no dependency was intentionally changed

## Why
the lockfile drift is pre-existing in the repo, unrelated to any feature work

## Learned
after running `npm install` purely to unlock the toolchain, `git checkout -- package-lock.json` before finishing, so the diff stays scoped to the actual task.

## Where
package.json / package-lock.json (repo root)
