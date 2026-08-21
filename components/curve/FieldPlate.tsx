import { FAMILY_LABEL, type Family } from "@/lib/family";
import { CycleCurve } from "@/components/curve/CycleCurve";
import { CycleTable } from "@/components/table/CycleTable";

export interface FieldPlateProps {
  name: string;
  province: string;
  family: Family;
  subtype: string;
  monthlyMm: number[];
  annualCurveMm: number[];
  semiAnnualCurveMm: number[];
  meanMm: number;
}

/**
 * The one signature element of "Almanac, Intensified" (VISUAL_AMBITION
 * direction A): the selected location's cycle curve restated once, full
 * width, as a mounted field plate rather than squeezed into the meta
 * column. Composes the same CycleCurve/CycleTable every other view uses
 * — this is presentation, not a new chart or a new computation
 * (CLAUDE.md invariant 15 — every value here already exists on the
 * selected record).
 *
 * The heading's accessible name is "Bacaan lapangan {name}" — built from
 * the small kicker line plus the visible name via aria-labelledby — not
 * just the plain "{name}" already used as a heading in the meta column
 * above. A visual restyle alone would leave two headings with the exact
 * same accessible name back to back in a screen reader's heading list;
 * this makes them genuinely distinct entries, matching what a sighted
 * reader already sees as two different lines of text.
 */
export function FieldPlate({ name, province, family, subtype, monthlyMm, annualCurveMm, semiAnnualCurveMm, meanMm }: FieldPlateProps) {
  return (
    <section aria-labelledby="field-plate-heading" className="flex flex-col gap-4 border border-rule bg-plate p-6 lg:p-8">
      <div className="flex flex-col gap-1 border-b border-stitch pb-4">
        <p id="field-plate-kicker" className="font-mono text-xs uppercase tracking-[0.2em] text-ink/60">
          Bacaan lapangan
        </p>
        <h2
          id="field-plate-heading"
          aria-labelledby="field-plate-kicker field-plate-heading"
          className="font-display text-3xl font-semibold leading-none lg:text-4xl"
        >
          {name}
        </h2>
        <p className="font-mono text-sm uppercase tracking-wide text-ink/70">
          {province} · {FAMILY_LABEL[family]} · {subtype}
        </p>
      </div>

      <CycleCurve
        monthlyMm={monthlyMm}
        annualCurveMm={annualCurveMm}
        semiAnnualCurveMm={semiAnnualCurveMm}
        meanMm={meanMm}
        family={family}
        size="plate"
      />

      <CycleTable monthlyMm={monthlyMm} caption={`Curah hujan bulanan di ${name}, mm`} />
    </section>
  );
}
