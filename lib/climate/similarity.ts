/**
 * "Pola serupa" — which other places share a city's annual shape.
 *
 * Similarity is the Pearson correlation of the two twelve-month normals,
 * which compares shape and timing and ignores magnitude: a dry place and
 * a wet place with the same rise and fall score as similar. That is the
 * question the atlas asks (DESIGN.md §5.1 compares shape, not totals).
 * It never implies two places share a Zona Musim.
 */
export function shapeCorrelation(a: readonly number[], b: readonly number[]): number {
  if (a.length !== b.length || a.length === 0) throw new Error("shapeCorrelation needs two equal, non-empty series");
  const n = a.length;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let cov = 0;
  let varA = 0;
  let varB = 0;
  for (let i = 0; i < n; i += 1) {
    const da = (a[i] as number) - meanA;
    const db = (b[i] as number) - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }
  // A perfectly flat series has no shape to compare; call it unrelated.
  if (varA === 0 || varB === 0) return 0;
  return cov / Math.sqrt(varA * varB);
}

export interface ShapeSeries {
  id: string;
  monthlyMm: readonly number[];
}

/** The `count` most similar other series by shape, highest correlation first; ties break on id so output is deterministic. */
export function mostSimilar(target: ShapeSeries, pool: readonly ShapeSeries[], count = 3): string[] {
  return pool
    .filter((other) => other.id !== target.id)
    .map((other) => ({ id: other.id, r: shapeCorrelation(target.monthlyMm, other.monthlyMm) }))
    .sort((x, y) => y.r - x.r || x.id.localeCompare(y.id))
    .slice(0, count)
    .map((x) => x.id);
}
