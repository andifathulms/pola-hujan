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
  annualHarmonicMm,
  classifyRegime,
  EKUATORIAL_4_RATIO,
  EKUATORIAL_DOMINANCE_RATIO,
  fitHarmonics,
  LOKAL_MIN_DISPLACEMENT_MONTHS,
  MONSOON_PEAK_CENTER_MONTH,
  MONSUNAL_MAX_DISPLACEMENT_MONTHS,
  MONTHS_PER_YEAR,
  SECONDARY_HARMONIC_SUBTYPE_RATIO,
  semiAnnualHarmonicMm,
  type HarmonicFit,
} from "../lib/harmonic";
import { locationSourceFileSchema, type ArchetypeRecord, type RegimeRecord } from "../lib/grid/schema";

const sourcePath = path.join(process.cwd(), "data", "source", "locations.json");
const gridsDir = path.join(process.cwd(), "data", "grids");

const rawSource = JSON.parse(readFileSync(sourcePath, "utf-8"));
const source = locationSourceFileSchema.parse(rawSource);

function evaluateCurves(fit: HarmonicFit) {
  const annualCurveMm: number[] = [];
  const semiAnnualCurveMm: number[] = [];
  for (let t = 0; t < MONTHS_PER_YEAR; t += 1) {
    annualCurveMm.push(annualHarmonicMm(fit, t));
    semiAnnualCurveMm.push(semiAnnualHarmonicMm(fit, t));
  }
  return { annualCurveMm, semiAnnualCurveMm };
}

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
    ...evaluateCurves(fit),
    family: classification.family,
    subtype: classification.subtype,
    peakMonth: classification.peakMonth,
    bmkgFamily: location.bmkgFamily,
    bmkgFamilySource: location.bmkgFamilySource,
    agrees,
  };
});

// The always-visible archetype strip (PRD.md §6.3): one clean reference
// cycle per family, built from the same cosine construction the
// synthetic test suite uses, then fit and classified through the real
// pipeline so a reader can pattern-match a selected place against a
// shape this project's own method actually produces.
function buildReferenceCycle(annualAmpMm: number, annualPeakMonth: number, semiAnnualAmpMm: number, semiAnnualPeakMonth: number, meanMm = 200): number[] {
  const months: number[] = [];
  for (let t = 0; t < MONTHS_PER_YEAR; t += 1) {
    const annual = annualAmpMm * Math.cos((2 * Math.PI * (t - annualPeakMonth)) / 12);
    const semi = semiAnnualAmpMm * Math.cos((2 * Math.PI * (t - semiAnnualPeakMonth)) / 6);
    months.push(Math.max(0, Math.round(meanMm + annual + semi)));
  }
  return months;
}

const REFERENCE_PARAMS: Record<"monsunal" | "ekuatorial" | "lokal", Parameters<typeof buildReferenceCycle>> = {
  monsunal: [150, MONSOON_PEAK_CENTER_MONTH, 10, 2],
  ekuatorial: [20, 3, 90, 2.5],
  lokal: [140, MONSOON_PEAK_CENTER_MONTH + 6, 10, 1],
};

const archetypes: ArchetypeRecord[] = (Object.keys(REFERENCE_PARAMS) as Array<keyof typeof REFERENCE_PARAMS>).map(
  (family) => {
    const monthlyMm = buildReferenceCycle(...REFERENCE_PARAMS[family]);
    const fit = fitHarmonics(monthlyMm);
    const classification = classifyRegime(fit);
    if (classification.family !== family) {
      throw new Error(
        `archetype for ${family} classified as ${classification.family} — its reference parameters no longer match the current thresholds`,
      );
    }
    return {
      monthlyMm,
      fit: {
        meanMm: fit.meanMm,
        annualAmpMm: fit.annualAmpMm,
        annualPeakMonth: fit.annualPeakMonth,
        semiAnnualAmpMm: fit.semiAnnualAmpMm,
        semiAnnualPeakMonth: fit.semiAnnualPeakMonth,
      },
      ...evaluateCurves(fit),
      family: classification.family,
      subtype: classification.subtype,
      peakMonth: classification.peakMonth,
    };
  },
);

const byFamily: Record<string, number> = {};
for (const record of records) {
  byFamily[record.family] = (byFamily[record.family] ?? 0) + 1;
}

const compared = records.filter((r) => r.agrees !== undefined);
const agreeing = compared.filter((r) => r.agrees === true);
const verifiedComparisons = compared.filter((r) => r.bmkgFamilySource === "bmkg-zom9120");

const manifest = {
  datasetName: source._datasetName,
  datasetStatus: source._status,
  climatologyPeriod: source._climatologyPeriod,
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
    verifiedComparisons: verifiedComparisons.length,
  },
};

mkdirSync(gridsDir, { recursive: true });
writeFileSync(path.join(gridsDir, "regime.json"), JSON.stringify(records, null, 2));
writeFileSync(path.join(gridsDir, "manifest.json"), JSON.stringify(manifest, null, 2));
writeFileSync(path.join(gridsDir, "archetypes.json"), JSON.stringify(archetypes, null, 2));

console.log(
  `data:build — wrote ${records.length} location records. ` +
    `Agreement with BMKG family (reported, not asserted): ` +
    `${agreeing.length}/${compared.length} (${(manifest.agreement.agreementRate * 100).toFixed(0)}%).`,
);
