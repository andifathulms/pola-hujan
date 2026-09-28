import { describe, expect, it } from "vitest";
import { parseOutlineRings, pointInRings, projectToOutline } from "@/lib/geo/outline";
import { INDONESIA_OUTLINE_PATH } from "@/lib/geo/indonesiaOutline";

describe("parseOutlineRings / pointInRings", () => {
  const square = parseOutlineRings("M0 0 10 0 10 10 0 10Z M20 20 30 20 30 30 20 30Z");

  it("parses implicit-lineto subpaths into rings", () => {
    expect(square).toHaveLength(2);
    expect(square[0]).toEqual([
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ]);
  });

  it("tests inside and outside, across several rings", () => {
    expect(pointInRings(square, 5, 5)).toBe(true);
    expect(pointInRings(square, 25, 25)).toBe(true);
    expect(pointInRings(square, 15, 15)).toBe(false);
  });

  it("uses the even-odd rule for a ring inside a ring", () => {
    const withHole = parseOutlineRings("M0 0 10 0 10 10 0 10Z M4 4 6 4 6 6 4 6Z");
    expect(pointInRings(withHole, 5, 5)).toBe(false);
    expect(pointInRings(withHole, 2, 2)).toBe(true);
  });

  it("refuses commands it does not understand", () => {
    expect(() => parseOutlineRings("M0 0 C1 1 2 2 3 3Z")).toThrow();
  });
});

describe("the real outline", () => {
  const rings = parseOutlineRings(INDONESIA_OUTLINE_PATH);
  const inside = (lat: number, lon: number) => {
    const { x, y } = projectToOutline(lat, lon);
    return pointInRings(rings, x, y);
  };

  it("contains inland Indonesian points", () => {
    expect(inside(-7.55, 110.2)).toBe(true); // central Java
    expect(inside(0.5, 114.0)).toBe(true); // central Kalimantan
    expect(inside(-4.0, 138.9)).toBe(true); // Papua highlands
  });

  it("excludes neighbouring countries and open sea", () => {
    expect(inside(3.14, 101.69)).toBe(false); // Kuala Lumpur
    expect(inside(-9.5, 139.0)).toBe(false); // Arafura Sea
    expect(inside(-8.8, 125.7)).toBe(false); // Timor-Leste
    expect(inside(-4.5, 125.0)).toBe(false); // Banda Sea
    expect(inside(2.0, 112.5)).toBe(false); // Sarawak
  });
});
