import type { Manifest, RegimeRecord } from "@/lib/grid/schema";
import { formatDecimal, type Family } from "@/lib/family";

/**
 * The plain-language bridge from a ratio or displacement to what it
 * means. The exact number and its threshold are quoted inline so the
 * sentence stays checkable. Exhaustive switch with a `never` default,
 * per CLAUDE.md Conventions — adding a family surfaces here.
 */
export function classificationReason(
  family: Family,
  detail: RegimeRecord["classificationDetail"],
  thresholds: Manifest["thresholds"],
): string {
  switch (family) {
    case "ekuatorial": {
      const ratioText = detail.semiToAnnualRatio === null ? "tak terhingga" : formatDecimal(detail.semiToAnnualRatio, 2);
      return `Gelombang dua-kali-setahun lebih kuat dari yang sekali-setahun (rasio ${ratioText}, ambang ${formatDecimal(thresholds.ekuatorialDominanceRatio, 2)}). Dua musim hujan dalam setahun, bukan satu.`;
    }
    case "monsunal": {
      const displacement = formatDecimal(detail.displacementMonths ?? 0);
      return `Puncak hujannya jatuh ${displacement} bulan dari pusat monsun Asia, dalam ambang Monsunal (≤ ${thresholds.monsunalMaxDisplacementMonths} bulan). Musim hujannya sejalan dengan sebagian besar Indonesia.`;
    }
    case "lokal": {
      const displacement = formatDecimal(detail.displacementMonths ?? 0);
      return `Puncak hujannya jatuh ${displacement} bulan dari pusat monsun Asia, melewati ambang Lokal (> ${thresholds.lokalMinDisplacementMonths} bulan). Musim hujannya jatuh di luar musim hujan Asia.`;
    }
    default: {
      const exhaustive: never = family;
      return exhaustive;
    }
  }
}
