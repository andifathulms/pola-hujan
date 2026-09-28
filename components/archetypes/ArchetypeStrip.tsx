import type { ArchetypeRecord } from "@/lib/grid/schema";
import { FAMILY_LABEL, FAMILY_TEXT_CLASS, MONTH_LABELS_ID, type Family } from "@/lib/family";

export interface ArchetypeStripProps {
  archetypes: ArchetypeRecord[];
  /** The currently selected location's family, so the matching archetype can be marked — the bridge between an abstract ratio and a shape the reader can actually see. */
  activeFamily?: Family;
}

const SPARK_WIDTH = 140;
const SPARK_HEIGHT = 40;

function sparkline(monthlyMm: number[]): string {
  const maxMm = Math.max(...monthlyMm, 1);
  return monthlyMm
    .map((mm, t) => {
      const x = (SPARK_WIDTH / 11) * t;
      const y = SPARK_HEIGHT - (SPARK_HEIGHT * mm) / maxMm;
      return `${t === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

/**
 * Three reference curves, always visible, so a selected place can be
 * pattern-matched against them without remembering what each family
 * looks like (DESIGN.md §5). Small, quiet, permanent — not an expanding
 * legend.
 *
 * These are constructed reference shapes (scripts/build-data.ts's
 * REFERENCE_PARAMS), not any real station's data — labelled as such so
 * they're never mistaken for an actual place.
 */
export function ArchetypeStrip({ archetypes, activeFamily }: ArchetypeStripProps) {
  return (
    <div className="flex flex-col gap-2 border-t border-rule pt-4">
      <p className="text-xs text-ink-muted">
        <strong className="font-semibold text-ink">Tiga bentuk acuan</strong> — contoh sintetis, bukan data lokasi nyata
      </p>
      <div className="grid grid-cols-3 gap-2">
        {archetypes.map((archetype) => {
          const family = archetype.family as Family;
          const isActive = family === activeFamily;
          return (
            <div
              key={family}
              className={`flex flex-col gap-1 rounded-card border px-2.5 py-2 ${isActive ? "border-ink bg-stock" : "border-rule"}`}
            >
              <span className={`text-xs font-bold ${FAMILY_TEXT_CLASS[family]}`}>{FAMILY_LABEL[family]}</span>
              <svg viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`} role="img" aria-label={`Kurva acuan rezim ${FAMILY_LABEL[family]} (contoh sintetis, bukan data lokasi nyata)`}>
                <path d={sparkline(archetype.monthlyMm)} fill="none" className={FAMILY_TEXT_CLASS[family]} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-mono text-tick text-ink-muted">
                {MONTH_LABELS_ID[0]}–{MONTH_LABELS_ID[11]}{isActive ? " · kota ini" : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
