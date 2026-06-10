/**
 * INTERFACES LAYER — presentational Server Component
 *
 * QuoteWidget shows a motivational quote that changes once per day. The quote
 * is picked deterministically from a local array using the day of the year as
 * an index, so it stays stable throughout the day and rotates the next day.
 *
 * Pure presentation: no interactivity, no backend, no libraries, no domain or
 * use-case involvement — it lives entirely in this layer.
 */

const QUOTES: readonly string[] = [
  "El secreto para avanzar es empezar.",
  "Pequeños hábitos, grandes resultados.",
  "No cuentes los días, haz que los días cuenten.",
  "La disciplina es el puente entre las metas y los logros.",
  "Hazlo hoy, tu yo del futuro te lo agradecerá.",
  "El progreso, no la perfección.",
  "Un día a la vez, un hábito a la vez.",
  "La constancia vence al talento.",
  "Cada paso cuenta, por pequeño que sea.",
  "Lo que haces cada día importa más que lo que haces de vez en cuando.",
];

/** Day of the year (1–366) for a given date, using the local calendar. */
function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

export function QuoteWidget(): React.JSX.Element {
  const quote = QUOTES[dayOfYear(new Date()) % QUOTES.length];

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 text-center shadow-sm">
      <span aria-hidden className="block text-4xl leading-none text-primary">
        &ldquo;
      </span>
      <p className="mx-auto mt-2 max-w-prose text-base font-medium text-text">{quote}</p>
      <p className="mt-3 text-xs uppercase tracking-wide text-muted">Frase del día</p>
    </section>
  );
}
