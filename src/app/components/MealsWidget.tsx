/**
 * INTERFACES LAYER — presentational placeholder
 *
 * MealsWidget is the "Comidas" dashboard slot. For now it only renders its
 * title; meal-tracking functionality lands in a later task. Styling matches the
 * other dashboard cards (rounded surface, border, subtle shadow).
 */

export function MealsWidget(): React.JSX.Element {
  return (
    <section className="rounded border border-border bg-surface p-6 shadow-sm">
      <h2 className="text-lg font-semibold">🍽️ Meals</h2>
    </section>
  );
}
