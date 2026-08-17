import type { ArchetypeRecord } from "@/lib/grid/schema";
import { FAMILY_LABEL, FAMILY_TEXT_CLASS, MONTH_LABELS_ID, type Family } from "@/lib/family";

export interface ArchetypeStripProps {
  archetypes: ArchetypeRecord[];
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
 */
export function ArchetypeStrip({ archetypes }: ArchetypeStripProps) {
  return (
    <div className="flex gap-4 overflow-x-auto border-t border-rule pt-3">
      {archetypes.map((archetype) => (
        <div key={archetype.family} className="flex min-w-[140px] flex-col gap-1">
          <span className={`text-xs font-medium ${FAMILY_TEXT_CLASS[archetype.family as Family]}`}>
            {FAMILY_LABEL[archetype.family as Family]}
          </span>
          <svg viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`} role="img" aria-label={`Kurva acuan rezim ${FAMILY_LABEL[archetype.family as Family]}`}>
            <path d={sparkline(archetype.monthlyMm)} fill="none" className={FAMILY_TEXT_CLASS[archetype.family as Family]} stroke="currentColor" strokeWidth={1.5} />
          </svg>
          <span className="font-mono text-[10px] text-ink/60">{MONTH_LABELS_ID[0]}–{MONTH_LABELS_ID[11]}</span>
        </div>
      ))}
    </div>
  );
}
