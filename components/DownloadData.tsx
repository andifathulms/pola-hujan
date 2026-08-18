"use client";

import type { RegimeRecord } from "@/lib/grid/schema";
import { MONTH_LABELS_ID } from "@/lib/family";

export interface DownloadDataProps {
  records: RegimeRecord[];
}

const COLUMNS = [
  "id",
  "name",
  "province",
  "lat",
  "lon",
  "family",
  "subtype",
  "peakMonth",
  "meanMm",
  "annualAmpMm",
  "annualPeakMonth",
  "semiAnnualAmpMm",
  "semiAnnualPeakMonth",
  "semiToAnnualRatio",
  "displacementMonths",
  "bmkgFamily",
  "bmkgFamilySource",
  "agrees",
  ...MONTH_LABELS_ID.map((m) => `${m}Mm`),
] as const;

function escapeCsvField(value: unknown): string {
  if (value === undefined || value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsvRow(record: RegimeRecord): string {
  const fields = [
    record.id,
    record.name,
    record.province,
    record.lat,
    record.lon,
    record.family,
    record.subtype,
    record.peakMonth,
    record.fit.meanMm,
    record.fit.annualAmpMm,
    record.fit.annualPeakMonth,
    record.fit.semiAnnualAmpMm,
    record.fit.semiAnnualPeakMonth,
    record.classificationDetail.semiToAnnualRatio,
    record.classificationDetail.displacementMonths,
    record.bmkgFamily,
    record.bmkgFamilySource,
    record.agrees,
    ...record.monthlyMm,
  ];
  return fields.map(escapeCsvField).join(",");
}

/**
 * Every field here already exists in `records` — the pipeline's output,
 * not a new computation (CLAUDE.md invariant 15's spirit: this only
 * serialises to CSV text, same as CycleTable rounding a number for
 * display). Built and downloaded as a Blob URL, so it stays a zero
 * network request, static-export-compatible action (invariant 14).
 */
export function DownloadData({ records }: DownloadDataProps) {
  function download() {
    const csv = [COLUMNS.join(","), ...records.map(toCsvRow)].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pola-hujan-rezim.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="self-start rounded border border-ink px-2 py-1 text-sm font-medium transition-colors duration-fast hover:bg-ink hover:text-stock"
    >
      Unduh data lokasi (CSV)
    </button>
  );
}
