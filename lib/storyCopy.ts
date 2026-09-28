import type { RegimeRecord } from "@/lib/grid/schema";
import { MONTH_NAMES_ID, formatMm } from "@/lib/family";

/**
 * The home page's lead sentence, assembled from pipeline fields rather
 * than typed out, so it cannot drift from the data it describes. Each
 * clause names a month from `wettestMonth` / `driestMonth`; none of it
 * reads forward (CLAUDE.md invariant 4) — these are normals.
 */
export function storyLead(records: readonly RegimeRecord[]): string {
  const find = (id: string) => records.find((r) => r.id === id);
  const jakarta = find("jakarta");
  const ambon = find("ambon");
  const kupang = find("kupang");
  const clauses: string[] = [];
  if (jakarta) clauses.push(`Jakarta paling basah di ${MONTH_NAMES_ID[jakarta.wettestMonth]}.`);
  if (ambon) clauses.push(`Ambon paling basah di ${MONTH_NAMES_ID[ambon.wettestMonth]}.`);
  if (kupang) {
    const mm = kupang.monthlyMm[kupang.driestMonth] ?? 0;
    clauses.push(`Kupang hanya menerima ${formatMm(mm)} mm di bulan ${MONTH_NAMES_ID[kupang.driestMonth]}.`);
  }
  clauses.push("Indonesia punya tiga pola hujan, bukan satu.");
  return clauses.join(" ");
}

/** The comparison band's caption: both peaks, and the other city's rain in the same month. */
export function compareCaption(a: RegimeRecord, b: RegimeRecord): string {
  const bPeak = b.wettestMonth;
  return `${a.name} mencatat ${formatMm(a.monthlyMm[a.wettestMonth] ?? 0)} mm di ${MONTH_NAMES_ID[a.wettestMonth]}. ${b.name} mencatat ${formatMm(
    b.monthlyMm[bPeak] ?? 0,
  )} mm di ${MONTH_NAMES_ID[bPeak]}, ketika ${a.name} hanya menerima ${formatMm(a.monthlyMm[bPeak] ?? 0)} mm.`;
}

/**
 * A city page's lead: its wettest and driest months of the normal year,
 * then the reference city's rain in that same wettest month (Jakarta,
 * or Ambon for Jakarta itself). Normals only; nothing reads forward.
 */
export function cityLead(record: RegimeRecord, reference: RegimeRecord | undefined): string {
  const wet = record.wettestMonth;
  const dry = record.driestMonth;
  const own = `${record.name} paling basah di ${MONTH_NAMES_ID[wet]} (${formatMm(record.monthlyMm[wet] ?? 0)} mm) dan paling kering di ${
    MONTH_NAMES_ID[dry]
  } (${formatMm(record.monthlyMm[dry] ?? 0)} mm).`;
  if (!reference || reference.id === record.id) return own;
  return `${own} Pada bulan yang sama, ${reference.name} menerima ${formatMm(reference.monthlyMm[wet] ?? 0)} mm.`;
}

/** The reference a city page compares against: Jakarta, or Ambon when the page is Jakarta. */
export function referenceCityId(id: string): string {
  return id === "jakarta" ? "ambon" : "jakarta";
}
