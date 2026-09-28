import { describe, expect, it } from "vitest";
import { mostSimilar, shapeCorrelation } from "@/lib/climate/similarity";

const cycle = (peak: number, amp = 100, mean = 200) =>
  Array.from({ length: 12 }, (_, t) => mean + amp * Math.cos((2 * Math.PI * (t - peak)) / 12));

describe("shapeCorrelation", () => {
  it("scores the same shape 1 regardless of magnitude", () => {
    expect(shapeCorrelation(cycle(0, 100, 200), cycle(0, 20, 60))).toBeCloseTo(1, 10);
  });

  it("scores a six-month displacement -1 — opposite halves of the year", () => {
    expect(shapeCorrelation(cycle(0), cycle(6))).toBeCloseTo(-1, 10);
  });

  it("treats a flat series as unrelated rather than dividing by zero", () => {
    expect(shapeCorrelation(Array(12).fill(100), cycle(0))).toBe(0);
  });
});

describe("mostSimilar", () => {
  const pool = [
    { id: "self", monthlyMm: cycle(0) },
    { id: "near", monthlyMm: cycle(0.5) },
    { id: "mid", monthlyMm: cycle(2) },
    { id: "opposite", monthlyMm: cycle(6) },
  ];

  it("excludes the target and ranks by correlation", () => {
    expect(mostSimilar(pool[0]!, pool, 3)).toEqual(["near", "mid", "opposite"]);
  });

  it("is deterministic on ties", () => {
    const tied = [
      { id: "t", monthlyMm: cycle(0) },
      { id: "b", monthlyMm: cycle(1) },
      { id: "a", monthlyMm: cycle(-1) },
    ];
    expect(mostSimilar(tied[0]!, tied, 2)).toEqual(["a", "b"]);
  });
});
