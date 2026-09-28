/**
 * Gate for `pnpm build`: validate the manifest and generated grids
 * against their schemas, and check the manifest's recorded thresholds
 * still match the named constants in lib/harmonic/thresholds.ts. If a
 * threshold constant changes without regenerating data/grids, this
 * fails loudly instead of shipping a map built on stale cut points.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  EKUATORIAL_4_RATIO,
  EKUATORIAL_DOMINANCE_RATIO,
  LOKAL_MIN_DISPLACEMENT_MONTHS,
  MONSOON_PEAK_CENTER_MONTH,
  MONSUNAL_MAX_DISPLACEMENT_MONTHS,
  SECONDARY_HARMONIC_SUBTYPE_RATIO,
  WET_MONTH_MIN_MM,
  DRY_MONTH_MAX_MM,
} from "../lib/harmonic";
import { archetypeRecordSchema, manifestSchema, mosaicSchema, regimeRecordSchema } from "../lib/grid/schema";
import { mosaicFamilyCounts } from "../lib/grid/mosaic";
import { z } from "zod";

const gridsDir = path.join(process.cwd(), "data", "grids");

function readJson(fileName: string): unknown {
  try {
    return JSON.parse(readFileSync(path.join(gridsDir, fileName), "utf-8"));
  } catch (error) {
    console.error(
      `data:validate — could not read ${fileName} in data/grids. Run \`pnpm data:build\` first.\n${error}`,
    );
    process.exit(1);
  }
}

const manifest = manifestSchema.parse(readJson("manifest.json"));
const records = z.array(regimeRecordSchema).parse(readJson("regime.json"));
const archetypes = z.array(archetypeRecordSchema).parse(readJson("archetypes.json"));
const mosaic = mosaicSchema.parse(readJson("mosaic.json"));

const archetypeFamilies = new Set(archetypes.map((a) => a.family));
for (const family of ["monsunal", "ekuatorial", "lokal"] as const) {
  if (!archetypeFamilies.has(family)) {
    console.error(`data:validate — missing archetype for family "${family}" in archetypes.json.`);
    process.exit(1);
  }
}

const currentThresholds = {
  monsoonPeakCenterMonth: MONSOON_PEAK_CENTER_MONTH,
  monsunalMaxDisplacementMonths: MONSUNAL_MAX_DISPLACEMENT_MONTHS,
  lokalMinDisplacementMonths: LOKAL_MIN_DISPLACEMENT_MONTHS,
  ekuatorialDominanceRatio: EKUATORIAL_DOMINANCE_RATIO,
  ekuatorial4Ratio: EKUATORIAL_4_RATIO,
  secondaryHarmonicSubtypeRatio: SECONDARY_HARMONIC_SUBTYPE_RATIO,
};

const staleKeys = (Object.keys(currentThresholds) as Array<keyof typeof currentThresholds>).filter(
  (key) => manifest.thresholds[key] !== currentThresholds[key],
);

if (staleKeys.length > 0) {
  console.error(
    `data:validate — manifest thresholds are stale vs lib/harmonic/thresholds.ts: ${staleKeys.join(", ")}. ` +
      "Run `pnpm data:build` to regenerate.",
  );
  process.exit(1);
}

if (manifest.monthCriteria.wetMonthMinMm !== WET_MONTH_MIN_MM || manifest.monthCriteria.dryMonthMaxMm !== DRY_MONTH_MAX_MM) {
  console.error(
    "data:validate — manifest monthCriteria are stale vs lib/harmonic/thresholds.ts. Run `pnpm data:build` to regenerate.",
  );
  process.exit(1);
}

// Every "pola serupa" id must name a real location in this build, and
// never the location itself — a dangling id would render a dead link.
const ids = new Set(records.map((r) => r.id));
for (const r of records) {
  const bad = r.similarIds.filter((id) => id === r.id || !ids.has(id));
  if (bad.length > 0) {
    console.error(`data:validate — ${r.id}.similarIds has invalid ids: ${bad.join(", ")}. Run \`pnpm data:build\`.`);
    process.exit(1);
  }
}
for (const m of manifest.months) {
  if (!ids.has(m.wettestId) || !ids.has(m.driestId)) {
    console.error("data:validate — manifest.months names a location missing from regime.json. Run `pnpm data:build`.");
    process.exit(1);
  }
}

// The mosaic's reported coverage must be the mosaic's actual coverage
// (invariant 12: reports are generated, never hand-written).
const counted = mosaicFamilyCounts(mosaic);
const countedTotal = counted.monsunal + counted.ekuatorial + counted.lokal;
if ((manifest.mosaic?.cells ?? 0) !== countedTotal || (manifest.mosaic && JSON.stringify(manifest.mosaic.byFamily) !== JSON.stringify(counted))) {
  console.error("data:validate — manifest.mosaic does not match data/grids/mosaic.json. Run `pnpm data:build`.");
  process.exit(1);
}

if (manifest.coverage.totalLocations !== records.length) {
  console.error("data:validate — manifest coverage.totalLocations does not match data/grids/regime.json length.");
  process.exit(1);
}

console.log(
  `data:validate — OK. ${records.length} locations, thresholds current, ` +
    `agreement ${manifest.agreement.agreeingLocations}/${manifest.agreement.comparedLocations}, mosaic ${countedTotal} cells.`,
);
