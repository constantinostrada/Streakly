# 🎯 Habit-Tracker

A production-ready **Habit Tracker** application built with **Next.js 14 (App Router)**, **React**, and **TypeScript** — structured using **Clean Architecture** to ensure every concern has a single, well-defined home.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Project Structure](#project-structure)
5. [Clean Architecture Layers](#clean-architecture-layers)
6. [API Reference](#api-reference)
7. [Extending the Project](#extending-the-project)
8. [Scripts](#scripts)

---

## Features

- ✅ Create habits with a name, optional description, frequency, and period (daily / weekly)
- ✅ Mark a habit as complete (up to its configured frequency per period)
- ✅ Archive habits (soft-delete)
- ✅ Progress bar showing completion rate per habit
- ✅ REST JSON API under `/api/habits`
- ✅ Server-side rendered home page (Next.js Server Components)
- ✅ In-memory persistence out of the box — swap to any real DB with zero layer changes

---

## Tech Stack

| Concern            | Technology                             |
|--------------------|----------------------------------------|
| Framework          | Next.js 14 — App Router                |
| Language           | TypeScript (strict mode)               |
| UI                 | React 18 (Server + Client Components)  |
| Persistence        | In-memory (swap via repository pattern)|
| Linting            | ESLint + eslint-plugin-import          |
| Formatting         | Prettier                               |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18.17
- npm ≥ 9 (or pnpm / yarn)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy the example env file
cp .env.local.example .env.local

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
habit-tracker/
├── src/
│   ├── domain/               # ← Core business logic (zero dependencies)
│   │   ├── entities/
│   │   │   └── Habit.ts
│   │   ├── value-objects/
│   │   │   ├── HabitId.ts
│   │   │   └── HabitFrequency.ts
│   │   ├── repositories/
│   │   │   └── IHabitRepository.ts
│   │   ├── services/
│   │   │   └── HabitCompletionService.ts
│   │   └── exceptions/
│   │       ├── DomainException.ts
│   │       └── HabitNotFoundException.ts
│   │
│   ├── application/          # ← Use cases & orchestration
│   │   ├── dtos/
│   │   │   └── HabitDto.ts
│   │   ├── mappers/
│   │   │   └── HabitMapper.ts
│   │   ├── ports/
│   │   │   └── IIdGenerator.ts
│   │   └── use-cases/
│   │       ├── CreateHabitUseCase.ts
│   │       ├── GetHabitUseCase.ts
│   │       ├── ListHabitsUseCase.ts
│   │       ├── CompleteHabitUseCase.ts
│   │       ├── UpdateHabitUseCase.ts
│   │       └── ArchiveHabitUseCase.ts
│   │
│   ├── infrastructure/       # ← DB / I/O implementations
│   │   ├── id/
│   │   │   └── UuidGenerator.ts
│   │   └── persistence/
│   │       ├── InMemoryHabitRepository.ts
│   │       ├── repositoryFactory.ts
│   │       └── singletonRepository.ts
│   │
│   ├── interfaces/           # ← HTTP layer (controllers, helpers)
│   │   └── http/
│   │       └── helpers/
│   │           ├── responseHelpers.ts
│   │           └── useCaseFactory.ts
│   │
│   └── app/                  # ← Next.js App Router (pages + API routes)
│       ├── layout.tsx
│       ├── page.tsx
│       ├── HabitsClient.tsx
│       ├── globals.css
│       ├── not-found.tsx
│       └── api/
│           └── habits/
│               ├── route.ts              # GET /api/habits, POST /api/habits
│               └── [id]/
│                   ├── route.ts          # GET /api/habits/:id, PATCH /api/habits/:id
│                   ├── complete/
│                   │   └── route.ts      # POST /api/habits/:id/complete
│                   └── archive/
│                       └── route.ts      # POST /api/habits/:id/archive
│
├── CLAUDE.md
├── architecture.json
├── package.json
├── tsconfig.json
├── next.config.ts
├── .eslintrc.json
├── .prettierrc
└── .gitignore
```

---

## Clean Architecture Layers

This project follows **Clean Architecture**. The golden rule:

> **Dependencies point inward only.**
> `interfaces → application → domain`
> `infrastructure → application → domain`

### 📦 `src/domain/` — The Heart

Contains **pure business logic** with **zero external dependencies**.

| Artefact | Example | Purpose |
|---|---|---|
| Entity | `Habit` | Has identity, lifecycle, enforces invariants |
| Value Object | `HabitId`, `HabitFrequency` | Immutable, equality by value |
| Repository Interface | `IHabitRepository` | Describes *what* persistence can do, not *how* |
| Domain Service | `HabitCompletionService` | Logic spanning multiple entities |
| Exception | `DomainException`, `HabitNotFoundException` | Typed error signals |

**Forbidden in domain:** imports from any other layer, ORM decorators, HTTP types, `process.env`, `console.log`.

---

### ⚙️ `src/application/` — Orchestration

Contains **use cases** that coordinate domain objects. Each use case has a single `execute(dto)` method. Receives dependencies (repositories, services) via constructor injection.

| Artefact | Example | Purpose |
|---|---|---|
| Use Case | `CreateHabitUseCase` | One class per user action |
| DTO | `CreateHabitDto`, `HabitResponseDto` | Input/output contracts |
| Mapper | `HabitMapper` | Domain entity ↔ DTO translation |
| Port Interface | `IIdGenerator` | Abstracts infrastructure needs |

**Forbidden in application:** imports from `infrastructure/` or `interfaces/`, SQL/HTTP/ORM code, business rule logic (that belongs in domain).

---

### 🔌 `src/infrastructure/` — I/O Implementations

Implements interfaces defined in domain/application. All I/O lives here.

| Artefact | Example | Purpose |
|---|---|---|
| Repository Impl | `InMemoryHabitRepository` | Fulfils `IHabitRepository` |
| ID Generator | `UuidGenerator` | Fulfils `IIdGenerator` using `uuid` |
| Factory | `repositoryFactory.ts` | Provides singleton instances |

**Forbidden in infrastructure:** business logic, direct imports from `interfaces/`, leaking ORM types into other layers.

---

### 🌐 `src/interfaces/` — Entry Points

Translates HTTP requests into use case calls and use case outputs into HTTP responses.

| Artefact | Example | Purpose |
|---|---|---|
| Response Helpers | `responseHelpers.ts` | Consistent JSON responses + error mapping |
| Use Case Factory | `useCaseFactory.ts` | Composition root — wires DI |

The Next.js route handlers in `src/app/api/` act as the actual controllers.

**Forbidden in interfaces:** business logic, direct repository calls, direct domain entity manipulation, importing from `infrastructure/` or `domain/` directly.

---

## API Reference

All responses follow the shape `{ success: boolean, data?: T, error?: string }`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/habits` | List active habits (`?includeArchived=true` for all) |
| `POST` | `/api/habits` | Create a habit |
| `GET` | `/api/habits/:id` | Get a single habit |
| `PATCH` | `/api/habits/:id` | Update name / description |
| `POST` | `/api/habits/:id/complete` | Record one completion |
| `POST` | `/api/habits/:id/archive` | Archive (soft-delete) a habit |

### Example: Create a habit

```bash
curl -X POST http://localhost:3000/api/habits \
  -H "Content-Type: application/json" \
  -d '{"name":"Meditate","description":"10 minutes of mindfulness","frequencyValue":1,"period":"daily"}'
```

---

## Extending the Project

### Swap to a real database

1. Create `src/infrastructure/persistence/PostgresHabitRepository.ts` implementing `IHabitRepository`.
2. Update `src/infrastructure/persistence/repositoryFactory.ts` to return your new implementation.
3. **No other file changes required.** The domain and application layers are completely unaware of the storage mechanism.

### Add a new use case

1. Define any new input/output shapes in `src/application/dtos/HabitDto.ts`.
2. Create `src/application/use-cases/YourNewUseCase.ts` with an `execute(dto)` method.
3. Add a factory helper in `src/interfaces/http/helpers/useCaseFactory.ts`.
4. Create a route handler in `src/app/api/`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format source files with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run type-check` | Run TypeScript compiler check (no emit) |
