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
    <section aria-label="Keterangan peta" className="flex flex-col gap-3 text-xs">
      <p className="max-w-[70ch] text-ink">
        <strong className="font-bold">Klasifikasi turunan dari data presipitasi grid terbuka, bukan Zona Musim resmi BMKG.</strong>{" "}
        <span className="text-ink-muted">
          Titik menunjukkan rezim di lokasi kota, bukan batas zona. Normal jangka panjang, bukan prakiraan.
        </span>
      </p>

      <ul className="grid gap-x-5 gap-y-1.5 sm:grid-cols-2">
        {FAMILIES.map((family) => (
          <li key={family} className="flex items-baseline gap-2">
            <span aria-hidden className={`relative top-[0.2em] inline-block h-2.5 w-2.5 shrink-0 rounded-full ${FAMILY_BG_CLASS[family]}`} />
            <span className="text-ink-muted">
              <strong className="font-semibold text-ink">{FAMILY_LABEL[family]}</strong> — {FAMILY_DESCRIPTION[family]}
            </span>
          </li>
        ))}
        <li className="flex items-baseline gap-2">
          <span
            aria-hidden
            className="relative top-[0.2em] inline-block h-2.5 w-2.5 shrink-0 rounded-full outline outline-1 outline-ink"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, var(--color-ink) 0 1.2px, var(--color-stock) 1.2px 3px)" }}
          />
          <span className="text-ink-muted">
            <strong className="font-semibold text-ink">Lingkar arsir</strong> — berbeda dengan keluarga BMKG. Warna muda: sub-tipe kedua.
          </span>
        </li>
      </ul>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-muted">
        <span className="rounded-[4px] border border-rule bg-stock px-1.5 py-0.5 font-mono tabular-nums">
          {manifest.datasetName.split(",")[0]} · {manifest.climatologyPeriod.split(" (")[0]}
        </span>
        <span>
          Kecocokan dengan BMKG, dilaporkan bukan diuji:{" "}
          <span className="font-mono tabular-nums text-ink">
            {manifest.agreement.agreeingLocations}/{manifest.agreement.comparedLocations} ({agreementPercent}%)
          </span>
          , {manifest.agreement.verifiedComparisons} terverifikasi ZOM9120.
        </span>
        <details>
          <summary className="cursor-pointer select-none font-semibold text-ink">Batas data</summary>
          <p className="mt-2 max-w-[70ch]">{manifest.datasetStatus}</p>
        </details>
      </div>
    </section>
  );
}
