import type { Manifest, RegimeRecord } from "./schema";
import regimeData from "@/data/grids/regime.json";
import manifestData from "@/data/grids/manifest.json";

// The pipeline (scripts/build-data.ts) emits these as plain JSON; this
// module is the one place components read them from, per CLAUDE.md
// invariant 15 ("nothing is computed in a component").
export const regimeRecords = regimeData as RegimeRecord[];
export const manifest = manifestData as Manifest;

export function findRegimeRecord(id: string): RegimeRecord | undefined {
  return regimeRecords.find((r) => r.id === id);
}
