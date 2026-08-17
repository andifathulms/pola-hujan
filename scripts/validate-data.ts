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
} from "../lib/harmonic";
import { archetypeRecordSchema, manifestSchema, regimeRecordSchema } from "../lib/grid/schema";
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

if (manifest.coverage.totalLocations !== records.length) {
  console.error("data:validate — manifest coverage.totalLocations does not match data/grids/regime.json length.");
  process.exit(1);
}

console.log(
  `data:validate — OK. ${records.length} locations, thresholds current, ` +
    `agreement ${manifest.agreement.agreeingLocations}/${manifest.agreement.comparedLocations}.`,
);
