/**
 * DEV/CI: climatology -> harmonic fit -> classify -> emit.
 *
 * Reads data/source/locations.json (see data/source/README.md for its
 * current placeholder status), fits the annual + semi-annual harmonics
 * and classifies each location with lib/harmonic, then writes
 * data/grids/regime.json and data/grids/manifest.json. Those two files
 * are read by the app (lib/grid/lookup.ts) — nothing in a component
 * computes a fit or a classification itself (CLAUDE.md invariant 15).
 *
 * Coverage and agreement are computed here, not hand-written into the
 * manifest, so they cannot drift from the actual classification
 * (CLAUDE.md invariant 12). Agreement is reported, never asserted —
 * there is no pass/fail threshold on it (PRD.md §8).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  classifyRegime,
  EKUATORIAL_4_RATIO,
  EKUATORIAL_DOMINANCE_RATIO,
  fitHarmonics,
  LOKAL_MIN_DISPLACEMENT_MONTHS,
  MONSOON_PEAK_CENTER_MONTH,
  MONSUNAL_MAX_DISPLACEMENT_MONTHS,
  SECONDARY_HARMONIC_SUBTYPE_RATIO,
} from "../lib/harmonic";
import { locationSourceFileSchema, type RegimeRecord } from "../lib/grid/schema";

const sourcePath = path.join(process.cwd(), "data", "source", "locations.json");
const gridsDir = path.join(process.cwd(), "data", "grids");

const rawSource = JSON.parse(readFileSync(sourcePath, "utf-8"));
const source = locationSourceFileSchema.parse(rawSource);

const records: RegimeRecord[] = source.locations.map((location) => {
  const fit = fitHarmonics(location.monthlyMm);
  const classification = classifyRegime(fit);
  const agrees = location.bmkgFamily ? location.bmkgFamily === classification.family : undefined;

  return {
    id: location.id,
    name: location.name,
    province: location.province,
    lat: location.lat,
    lon: location.lon,
    monthlyMm: location.monthlyMm,
    fit: {
      meanMm: fit.meanMm,
      annualAmpMm: fit.annualAmpMm,
      annualPeakMonth: fit.annualPeakMonth,
      semiAnnualAmpMm: fit.semiAnnualAmpMm,
      semiAnnualPeakMonth: fit.semiAnnualPeakMonth,
    },
    family: classification.family,
    subtype: classification.subtype,
    peakMonth: classification.peakMonth,
    bmkgFamily: location.bmkgFamily,
    agrees,
  };
});

const byFamily: Record<string, number> = {};
for (const record of records) {
  byFamily[record.family] = (byFamily[record.family] ?? 0) + 1;
}

const compared = records.filter((r) => r.agrees !== undefined);
const agreeing = compared.filter((r) => r.agrees === true);

const manifest = {
  datasetName: "Pola Hujan placeholder climatology",
  datasetStatus: source._status,
  climatologyPeriod: "N/A — placeholder, not a measured climatological period",
  generatedFromLocations: records.length,
  thresholds: {
    monsoonPeakCenterMonth: MONSOON_PEAK_CENTER_MONTH,
    monsunalMaxDisplacementMonths: MONSUNAL_MAX_DISPLACEMENT_MONTHS,
    lokalMinDisplacementMonths: LOKAL_MIN_DISPLACEMENT_MONTHS,
    ekuatorialDominanceRatio: EKUATORIAL_DOMINANCE_RATIO,
    ekuatorial4Ratio: EKUATORIAL_4_RATIO,
    secondaryHarmonicSubtypeRatio: SECONDARY_HARMONIC_SUBTYPE_RATIO,
  },
  coverage: {
    totalLocations: records.length,
    byFamily,
  },
  agreement: {
    comparedLocations: compared.length,
    agreeingLocations: agreeing.length,
    agreementRate: compared.length > 0 ? agreeing.length / compared.length : 0,
  },
};

mkdirSync(gridsDir, { recursive: true });
writeFileSync(path.join(gridsDir, "regime.json"), JSON.stringify(records, null, 2));
writeFileSync(path.join(gridsDir, "manifest.json"), JSON.stringify(manifest, null, 2));

console.log(
  `data:build — wrote ${records.length} location records. ` +
    `Agreement with BMKG family (reported, not asserted): ` +
    `${agreeing.length}/${compared.length} (${(manifest.agreement.agreementRate * 100).toFixed(0)}%).`,
);
