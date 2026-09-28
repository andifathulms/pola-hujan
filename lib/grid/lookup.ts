import type { ArchetypeRecord, Manifest, Mosaic, RegimeRecord } from "./schema";
import regimeData from "@/data/grids/regime.json";
import manifestData from "@/data/grids/manifest.json";
import archetypeData from "@/data/grids/archetypes.json";
import mosaicData from "@/data/grids/mosaic.json";

// The pipeline (scripts/build-data.ts) emits these as plain JSON; this
// module is the one place components read them from, per CLAUDE.md
// invariant 15 ("nothing is computed in a component").
export const regimeRecords = regimeData as RegimeRecord[];
export const manifest = manifestData as Manifest;
export const archetypeRecords = archetypeData as ArchetypeRecord[];
export const mosaic = mosaicData as Mosaic;

export function findRegimeRecord(id: string): RegimeRecord | undefined {
  return regimeRecords.find((r) => r.id === id);
}

/**
 * The climatology period as a short label, "2006–2015", derived once
 * from the manifest's own string ("2006-01 to 2015-12 (...)") so no
 * component slices it. Falls back to the full string if the format ever
 * changes.
 */
export const PERIOD_LABEL: string = (() => {
  const years = manifest.climatologyPeriod.match(/(\d{4})-\d{2}\s+to\s+(\d{4})-\d{2}/);
  return years ? `${years[1]}–${years[2]}` : manifest.climatologyPeriod;
})();
