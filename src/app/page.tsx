/**
 * Home page — Server Component
 *
 * Fetches habits directly through the use case (server-side) and renders the
 * HabitsClient component which handles interactive UI actions.
 *
 * This is a Server Component: data-fetching happens here, interaction in the
 * Client Component below.
 */

import { ListHabitsUseCase } from "@/application/use-cases/ListHabitsUseCase";
import { habitRepository } from "@/infrastructure/persistence/singletonRepository";

import { TipWidget } from "./components/TipWidget";
import GreetingWidget from "./components/GreetingWidget";

import { AppFooter } from "./components/AppFooter";

async function getHabits() {
  const useCase = new ListHabitsUseCase(habitRepository);
  return useCase.execute({ includeArchived: false });
}

export default async function HomePage(): Promise<React.JSX.Element> {
  const habits = await getHabits();

  return (
    <main style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--color-primary)",
            marginBottom: "0.25rem",
          }}
        >
          🎯 Habit Tracker
        </h1>
        <p style={{ color: "var(--color-muted)" }}>Build better habits, one day at a time.</p>
      </header>

      <div style={{ marginBottom: "2rem" }}>
        <GreetingWidget />
      </div>
      <div style={{ marginBottom: "2rem" }}>
        {/* TipWidget inserted here */}
        {/* @ts-expect-error Async Server Component */}
        <TipWidget />
      </div>
    </main>
    <AppFooter />
  );
}
