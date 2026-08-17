import type { Manifest } from "@/lib/grid/schema";
import { FAMILIES, FAMILY_BG_CLASS, FAMILY_DESCRIPTION, FAMILY_LABEL } from "@/lib/family";

export interface LegendProps {
  manifest: Manifest;
}

/**
 * Never optional (DESIGN.md §9). States: this is a derived
 * classification, not BMKG's official Zona Musim; the dataset and
 * period; the three families in one line apiece; that the map shows
 * regime, not zone boundaries. Point 1 appears here, on the map itself,
 * not only on a method page (CLAUDE.md invariant 6).
 */
export function Legend({ manifest }: LegendProps) {
  return (
    <section aria-label="Keterangan" className="flex flex-col gap-2 border border-rule bg-stock p-3 text-xs">
      <p>
        Klasifikasi ini <strong>diturunkan dari data presipitasi grid terbuka</strong>, bukan Zona Musim resmi
        BMKG. Peta ini menunjukkan <strong>rezim, bukan batas zona</strong>.
      </p>
      <p className="font-mono text-ink/70">
        {manifest.datasetName} · {manifest.climatologyPeriod}
      </p>
      <ul className="flex flex-col gap-1">
        {FAMILIES.map((family) => (
          <li key={family} className="flex items-center gap-2">
            <span aria-hidden className={`inline-block h-2 w-2 rounded-full ${FAMILY_BG_CLASS[family]}`} />
            <span>
              <strong>{FAMILY_LABEL[family]}</strong> — {FAMILY_DESCRIPTION[family]}
            </span>
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-ink" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 1px, currentColor 1px, currentColor 2px)" }} />
          <span>Arsir — klasifikasi turunan berbeda dari perkiraan keluarga BMKG (lihat Metode).</span>
        </li>
      </ul>
      <p className="font-mono text-ink/70">
        Kecocokan dengan BMKG (dilaporkan, bukan diuji): {manifest.agreement.agreeingLocations}/
        {manifest.agreement.comparedLocations} ({Math.round(manifest.agreement.agreementRate * 100)}%) —{" "}
        {manifest.agreement.verifiedComparisons} di antaranya terverifikasi terhadap dokumen ZOM9120 BMKG, sisanya
        perkiraan (lihat Metode).
      </p>
      <p className="border-t border-rule pt-2 text-ink/70">{manifest.datasetStatus}</p>
    </section>
  );
}
