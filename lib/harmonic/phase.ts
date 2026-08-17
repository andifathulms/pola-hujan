/**
 * Month-phase utilities. All months are Jan = 0 .. Dec = 11, continuous
 * values allowed (e.g. 5.5 = mid-June), always wrapped into [0, 12).
 * This is the one place phase wrap-around is handled — see CLAUDE.md
 * invariant 8 and the working-style note on the December–January boundary.
 */

/** Wrap an arbitrary month value into [0, 12). */
export function wrapMonths(monthValue: number): number {
  const wrapped = monthValue % 12;
  return wrapped < 0 ? wrapped + 12 : wrapped;
}

/**
 * Shortest circular distance between two months on a 12-month wheel,
 * in [0, 6]. Used to measure how far a cycle's peak sits from the
 * Asian-monsoon window — the six-month case (opposite side of the wheel)
 * is the maximum possible value and is the Lokal fixture.
 */
export function circularMonthDistance(monthA: number, monthB: number): number {
  const a = wrapMonths(monthA);
  const b = wrapMonths(monthB);
  const raw = Math.abs(a - b);
  return Math.min(raw, 12 - raw);
}
