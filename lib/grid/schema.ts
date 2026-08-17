import { z } from "zod";

/**
 * Source climatology for one location: 12 monthly precipitation normals
 * in millimetres, Jan first. This is the pipeline's input shape —
 * whatever the source (IMERG, CHIRPS, or the current placeholder set;
 * see data/source/README.md) it must be reduced to this before
 * `lib/harmonic` sees it.
 */
export const locationSourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  province: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  monthlyMm: z.array(z.number().min(0)).length(12),
  /** BMKG's published Zona Musim family for this location, for the agreement report only — never used as classification input. */
  bmkgFamily: z.enum(["monsunal", "ekuatorial", "lokal"]).optional(),
  /**
   * Whether bmkgFamily is cited against BMKG's actual "Pemutakhiran Zona
   * Musim Indonesia Periode 1991-2020" document (province/region named
   * explicitly, or a province-wide single-sub-type statement) or is
   * still an unverified best-effort guess. See data/source/README.md.
   */
  bmkgFamilySource: z.enum(["bmkg-zom9120", "estimate"]).optional(),
});
export type LocationSource = z.infer<typeof locationSourceSchema>;

export const locationSourceFileSchema = z.object({
  _status: z.string(),
  _datasetName: z.string(),
  _climatologyPeriod: z.string(),
  locations: z.array(locationSourceSchema).min(1),
});
export type LocationSourceFile = z.infer<typeof locationSourceFileSchema>;

const regimeFamilySchema = z.enum(["monsunal", "ekuatorial", "lokal"]);

/** One location's derived regime record, as emitted by scripts/build-data.ts into data/grids/regime.json. */
export const regimeRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  province: z.string(),
  lat: z.number(),
  lon: z.number(),
  monthlyMm: z.array(z.number()).length(12),
  fit: z.object({
    meanMm: z.number(),
    annualAmpMm: z.number(),
    annualPeakMonth: z.number(),
    semiAnnualAmpMm: z.number(),
    semiAnnualPeakMonth: z.number(),
  }),
  /** The two fitted harmonics evaluated at each month, drawn separately per CLAUDE.md invariant 9 — components plot these, they never evaluate the fit themselves (invariant 15). */
  annualCurveMm: z.array(z.number()).length(12),
  semiAnnualCurveMm: z.array(z.number()).length(12),
  family: regimeFamilySchema,
  subtype: z.string(),
  peakMonth: z.number(),
  bmkgFamily: regimeFamilySchema.optional(),
  bmkgFamilySource: z.enum(["bmkg-zom9120", "estimate"]).optional(),
  agrees: z.boolean().optional(),
});
export type RegimeRecord = z.infer<typeof regimeRecordSchema>;

/** One family's reference cycle for the always-visible archetype strip (PRD.md §6.3). Same shape as a location record, minus location fields. */
export const archetypeRecordSchema = regimeRecordSchema.omit({
  id: true,
  name: true,
  province: true,
  lat: true,
  lon: true,
  bmkgFamily: true,
  agrees: true,
});
export type ArchetypeRecord = z.infer<typeof archetypeRecordSchema>;

export const manifestSchema = z.object({
  datasetName: z.string(),
  datasetStatus: z.string(),
  climatologyPeriod: z.string(),
  generatedFromLocations: z.number().int().positive(),
  thresholds: z.object({
    monsoonPeakCenterMonth: z.number(),
    monsunalMaxDisplacementMonths: z.number(),
    lokalMinDisplacementMonths: z.number(),
    ekuatorialDominanceRatio: z.number(),
    ekuatorial4Ratio: z.number(),
    secondaryHarmonicSubtypeRatio: z.number(),
  }),
  coverage: z.object({
    totalLocations: z.number().int(),
    byFamily: z.record(regimeFamilySchema, z.number().int()),
  }),
  agreement: z.object({
    comparedLocations: z.number().int(),
    agreeingLocations: z.number().int(),
    agreementRate: z.number().min(0).max(1),
    /** How many of comparedLocations have bmkgFamilySource === "bmkg-zom9120" (cited against the real document) rather than an unverified estimate. */
    verifiedComparisons: z.number().int(),
  }),
});
export type Manifest = z.infer<typeof manifestSchema>;
