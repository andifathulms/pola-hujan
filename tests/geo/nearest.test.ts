import { describe, expect, it } from "vitest";
import { findNearest, haversineDistanceKm } from "@/lib/geo/nearest";

describe("haversineDistanceKm", () => {
  it("is zero for identical points", () => {
    expect(haversineDistanceKm(-6.2, 106.8, -6.2, 106.8)).toBeCloseTo(0, 6);
  });

  it("matches a known distance within tolerance (Jakarta to Ambon, ~2300km great-circle)", () => {
    const distance = haversineDistanceKm(-6.2088, 106.8456, -3.6954, 128.1814);
    expect(distance).toBeGreaterThan(2100);
    expect(distance).toBeLessThan(2500);
  });
});

describe("findNearest", () => {
  const candidates = [
    { id: "a", lat: 0, lon: 0 },
    { id: "b", lat: 10, lon: 10 },
    { id: "c", lat: -5, lon: -5 },
  ];

  it("returns the closest candidate", () => {
    expect(findNearest({ lat: 0.1, lon: 0.1 }, candidates)?.id).toBe("a");
    expect(findNearest({ lat: 9, lon: 9 }, candidates)?.id).toBe("b");
  });

  it("returns undefined for an empty candidate list", () => {
    expect(findNearest({ lat: 0, lon: 0 }, [])).toBeUndefined();
  });
});
