import { describe, expect, it } from "vitest";
import { monthStats } from "@/lib/climate/monthStats";
import { DRY_MONTH_MAX_MM, WET_MONTH_MIN_MM } from "@/lib/harmonic/thresholds";

describe("monthStats", () => {
  it("finds the wettest and driest month, total, and wet/dry counts", () => {
    const mm = [432, 338, 207, 168, 133, 92, 58, 51, 41, 80, 130, 270];
    expect(monthStats(mm)).toEqual({ annualTotalMm: 2000, wettestMonth: 0, driestMonth: 8, wetMonths: 7, dryMonths: 3 });
  });

  it("applies both Mohr criteria strictly, on both sides", () => {
    // Exactly at a cut-off is neither wet nor dry: > WET, < DRY.
    const edge = [WET_MONTH_MIN_MM, WET_MONTH_MIN_MM + 1, DRY_MONTH_MAX_MM, DRY_MONTH_MAX_MM - 1, 80, 80, 80, 80, 80, 80, 80, 80];
    const stats = monthStats(edge);
    expect(stats.wetMonths).toBe(1);
    expect(stats.dryMonths).toBe(1);
  });

  it("breaks ties toward the earlier month", () => {
    const flat = Array.from({ length: 12 }, () => 100);
    expect(monthStats(flat).wettestMonth).toBe(0);
    expect(monthStats(flat).driestMonth).toBe(0);
  });

  it("rejects anything but twelve months", () => {
    expect(() => monthStats([1, 2, 3])).toThrow();
  });
});
