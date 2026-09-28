import type { Manifest, RegimeRecord } from "@/lib/grid/schema";
import { formatMm } from "@/lib/family";

/**
 * The comparison page's one-tap presets. Each pick is derived from the
 * build's own records and manifest — never a hardcoded pair that could
 * go stale when coverage grows. A preset whose cities are missing is
 * dropped, not faked.
 */
export interface ComparePreset {
  id: string;
  title: string;
  description: string;
  leftId: string;
  rightId: string;
}

export function comparePresets(records: readonly RegimeRecord[], manifest: Manifest): ComparePreset[] {
  const byId = new Map(records.map((r) => [r.id, r]));
  const presets: ComparePreset[] = [];

  if (byId.has("jakarta") && byId.has("ambon")) {
    presets.push({
      id: "terbalik",
      title: "Musim yang bergeser",
      description: "Jakarta dan Ambon: puncak hujan di dua bagian tahun yang berbeda.",
      leftId: "jakarta",
      rightId: "ambon",
    });
  }

  const pair = manifest.nearestOppositePair;
  if (pair && byId.has(pair.aId) && byId.has(pair.bId)) {
    presets.push({
      id: "tetangga",
      title: `${Math.round(pair.distanceKm)} km, beda pola`,
      description: `${pair.aName} dan ${pair.bName}: pasangan terdekat dengan keluarga berbeda.`,
      leftId: pair.aId,
      rightId: pair.bId,
    });
  }

  // The first verified disagreement in source order, beside a verified
  // city whose derived family matches BMKG's family for it — the shape
  // BMKG expects, next to the shape this method found.
  const disagreement = records.find((r) => r.agrees === false && r.bmkgFamilySource === "bmkg-zom9120");
  if (disagreement?.bmkgFamily) {
    const reference = records.find(
      (r) => r.id !== disagreement.id && r.family === disagreement.bmkgFamily && r.agrees === true && r.bmkgFamilySource === "bmkg-zom9120",
    );
    if (reference) {
      presets.push({
        id: "bmkg",
        title: "Tidak sepakat dengan BMKG",
        description: `${disagreement.name}: turunan berbeda dari ZOM9120. Dibandingkan dengan ${reference.name}, yang cocok.`,
        leftId: disagreement.id,
        rightId: reference.id,
      });
    }
  }

  if (records.length >= 2) {
    const sorted = [...records].sort((a, b) => a.annualTotalMm - b.annualTotalMm || a.id.localeCompare(b.id));
    const driest = sorted[0];
    const wettest = sorted[sorted.length - 1];
    if (driest && wettest && driest.id !== wettest.id) {
      presets.push({
        id: "ekstrem",
        title: "Terkering dan terbasah",
        description: `${driest.name} ${formatMm(driest.annualTotalMm)} mm dan ${wettest.name} ${formatMm(wettest.annualTotalMm)} mm setahun.`,
        leftId: driest.id,
        rightId: wettest.id,
      });
    }
  }

  return presets;
}
