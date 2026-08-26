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
 * not only on a method page (CLAUDE.md invariant 6) — which is why this
 * sits directly under the map rather than at the head of the page.
 *
 * It used to be a bordered card stacked above the map, so a reader met
 * four paragraphs before meeting the atlas. Nothing in the contract is
 * dropped here; it is set as a caption to the map it qualifies instead
 * of as a gate in front of it. Only the long provenance note — a
 * limitation, not part of the four required statements — is behind a
 * disclosure.
 */
export function Legend({ manifest }: LegendProps) {
  const agreementPercent = Math.round(manifest.agreement.agreementRate * 100);

  return (
    <section aria-label="Keterangan" className="flex flex-col gap-3 border-t border-rule pt-3 text-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="font-display text-base font-semibold">Tentang peta ini</h2>
        {/* The citation stamp: short, monospace, always present where a
            claim is made (DESIGN.md §1). Sentences about the data live in
            the disclosure below, in the body face where they can be read. */}
        <p className="font-mono text-xs tabular-nums text-ink/70">
          {manifest.datasetName} · {manifest.climatologyPeriod}
        </p>
      </div>

      <p className="max-w-prose">
        Klasifikasi ini <strong>diturunkan dari data presipitasi grid terbuka</strong>, bukan Zona Musim resmi BMKG.
        Peta ini menunjukkan <strong>rezim, bukan batas zona</strong>.
      </p>

      <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
        {FAMILIES.map((family) => (
          <li key={family} className="flex items-baseline gap-2">
            <span
              aria-hidden
              className={`relative top-[0.35em] inline-block h-2 w-2 shrink-0 rounded-full ${FAMILY_BG_CLASS[family]}`}
            />
            <span>
              <strong>{FAMILY_LABEL[family]}</strong> — {FAMILY_DESCRIPTION[family]}
            </span>
          </li>
        ))}
        <li className="flex items-baseline gap-2">
          <span
            aria-hidden
            className="relative top-[0.35em] inline-block h-2 w-2 shrink-0 rounded-full bg-ink"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 1px, var(--color-stock) 1px, var(--color-stock) 2px)",
            }}
          />
          <span>
            <strong>Arsir</strong> — klasifikasi turunan berbeda dari keluarga BMKG untuk lokasi itu.
          </span>
        </li>
      </ul>

      <p className="max-w-prose text-ink/70">
        Kecocokan dengan BMKG, dilaporkan dan bukan diuji:{" "}
        <span className="font-mono tabular-nums text-ink">
          {manifest.agreement.agreeingLocations}/{manifest.agreement.comparedLocations} ({agreementPercent}%)
        </span>
        . <span className="font-mono tabular-nums text-ink">{manifest.agreement.verifiedComparisons}</span> di antaranya
        terverifikasi terhadap dokumen ZOM9120 BMKG, sisanya masih perkiraan — lihat Metode.
      </p>

      <details className="max-w-prose text-ink/70">
        <summary className="cursor-pointer select-none font-medium text-ink">Batas data ini</summary>
        <p className="mt-2">{manifest.datasetStatus}</p>
      </details>
    </section>
  );
}
