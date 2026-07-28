---
id: b0251811-3ac5-4e41-81b6-aa33ca94a2ae-1
type: gotcha
title: package-lock.json is out of sync with package.json and node_modules ships empty, so `npm…
tags: [gotcha]
created: 2026-07-28
---
package-lock.json is out of sync with package.json and node_modules ships empty, so `npm ci` fails and `npm run type-check`/`lint` can't run as-is

## Why
pre-existing repo state, unrelated to the streak task

## Learned
verify TypeScript changes via a scratch/global tsc install instead of `npm install`, to avoid rewriting the lockfile.
