import { FAMILY_BG_CLASS, type Family } from "@/lib/family";

export interface ThresholdGaugeProps {
  /** e.g. "Rasio semi-tahunan/tahunan" or "Jarak puncak dari pusat monsun" — same label already used in the disclosure's <dl>. */
  label: string;
  /** Already-formatted exact figure, e.g. "1.20" or "4.60 bulan" — this component never reformats a number, only positions it. */
  valueText: string;
  /** Already-formatted threshold figure, e.g. "ambang Ekuatorial 1.00". */
  thresholdText: string;
  value: number;
  threshold: number;
  domainMin: number;
  domainMax: number;
  family: Family;
}

/**
 * A value's position on a line relative to the threshold that decided
 * it — DESIGN-REWORK.md §2.1. Family hue for the value marker, `ink`
 * hairline for the line, mono for the threshold label: existing tokens,
 * no new ones. Both `value` and `threshold` are pipeline/manifest
 * output; this only places them on an axis, it never derives either
 * (CLAUDE.md invariant 15) — `domainMin`/`domainMax` size the axis, the
 * same kind of display-range choice CycleCurve already makes for its
 * own y-scale.
 *
 * Purely a visual supplement to the `<dl>` this sits beside, which
 * already states the same label/value/threshold as text — `aria-hidden`
 * so a screen reader doesn't hear it twice (DESIGN.md §10: the text
 * reading stays the authoritative, always-present one).
 */
export function ThresholdGauge({
  label,
  valueText,
  thresholdText,
  value,
  threshold,
  domainMin,
  domainMax,
  family,
}: ThresholdGaugeProps) {
  const toPercent = (n: number) => (Math.min(domainMax, Math.max(domainMin, n)) - domainMin) / (domainMax - domainMin) * 100;
  const valuePercent = toPercent(value);
  const thresholdPercent = toPercent(threshold);

  return (
    <div aria-hidden className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2 font-mono text-xs text-ink/70">
        <span>{label}</span>
        <span className="tabular-nums">{valueText}</span>
      </div>
      <div className="relative h-4">
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-ink/30" />
        <div className="absolute top-0 h-full w-px bg-ink" style={{ left: `${thresholdPercent}%` }} />
        <div
          className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink ${FAMILY_BG_CLASS[family]}`}
          style={{ left: `${valuePercent}%` }}
        />
      </div>
      <p className="font-mono text-xs text-ink/70">{thresholdText}</p>
    </div>
  );
}
