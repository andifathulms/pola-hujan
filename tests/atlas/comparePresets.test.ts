import { describe, expect, it } from "vitest";
import { comparePresets } from "@/lib/comparePresets";
import { manifest, regimeRecords } from "@/lib/grid/lookup";

// Run against the real build: presets must only ever name cities that
// exist, and must follow the data rather than a hardcoded list.
describe("comparePresets", () => {
  const presets = comparePresets(regimeRecords, manifest);
  const ids = new Set(regimeRecords.map((r) => r.id));

  it("only names cities in the build, and never the same city twice", () => {
    for (const p of presets) {
      expect(ids.has(p.leftId)).toBe(true);
      expect(ids.has(p.rightId)).toBe(true);
      expect(p.leftId).not.toBe(p.rightId);
    }
  });

  it("uses the manifest's nearest opposite pair", () => {
    const pair = manifest.nearestOppositePair;
    if (!pair) return;
    const tetangga = presets.find((p) => p.id === "tetangga");
    expect(tetangga?.leftId).toBe(pair.aId);
    expect(tetangga?.rightId).toBe(pair.bId);
  });

  it("puts the driest and wettest annual totals in the extremes preset", () => {
    const ekstrem = presets.find((p) => p.id === "ekstrem");
    const totals = regimeRecords.map((r) => r.annualTotalMm);
    const left = regimeRecords.find((r) => r.id === ekstrem?.leftId);
    const right = regimeRecords.find((r) => r.id === ekstrem?.rightId);
    expect(left?.annualTotalMm).toBe(Math.min(...totals));
    expect(right?.annualTotalMm).toBe(Math.max(...totals));
  });

  it("drops presets whose cities are missing instead of inventing them", () => {
    expect(comparePresets([], manifest)).toEqual([]);
  });
});
