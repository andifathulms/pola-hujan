"use client";

import { useEffect, useState } from "react";
import { FAMILY_FILL_CLASS, MONTH_LABELS_ID, type Family } from "@/lib/family";
import {
  CURVE_HEIGHT as HEIGHT,
  CURVE_PAD_BOTTOM as PAD_BOTTOM,
  CURVE_PAD_LEFT as PAD_LEFT,
  CURVE_PAD_TOP as PAD_TOP,
  CURVE_PLOT_HEIGHT as PLOT_HEIGHT,
  CURVE_PLOT_WIDTH as PLOT_WIDTH,
  CURVE_WIDTH as WIDTH,
} from "@/lib/curveLayout";

export interface CycleCurveProps {
  monthlyMm: number[];
  annualCurveMm: number[];
  semiAnnualCurveMm: number[];
  meanMm: number;
  family: Family;
  /**
   * Comparison mode draws one shared month axis beneath both panels
   * (DESIGN-REWORK.md §1.1) instead of each curve labelling its own —
   * defaults to true for every other caller.
   */
  showMonthLabels?: boolean;
  /**
   * "plate" is the field plate's one ceremonial rendering (VISUAL_AMBITION
   * direction A) — heavier harmonic strokes and letterspaced, uppercase
   * month labels, so it reads as a mounted instrument reading rather than
   * the same compact chart used everywhere else. Every other caller keeps
   * "default"; no geometry changes, so CompareView's shared-axis maths
   * (lib/curveLayout.ts) is untouched.
   */
  size?: "default" | "plate";
}

/**
 * Twelve monthly bars plus the two fitted harmonics drawn as separate
 * thin lines — never summed, DESIGN.md §4. Month order is fixed Jan-Dec
 * (CLAUDE.md invariant 8): this component never rotates or reorders.
 *
 * The legend below the chart exists because the two harmonic lines are
 * otherwise indistinguishable from decoration — this chart is PRD.md
 * §6.2's stated evidence for the classification, so what each line is
 * has to be readable without already knowing the method.
 */
export function CycleCurve({
  monthlyMm,
  annualCurveMm,
  semiAnnualCurveMm,
  meanMm,
  family,
  showMonthLabels = true,
  size = "default",
}: CycleCurveProps) {
  const isPlate = size === "plate";
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const maxMm = Math.max(...monthlyMm, ...annualCurveMm, 1);
  const barWidth = PLOT_WIDTH / 12 - 4;

  const yFor = (mm: number) => PAD_TOP + PLOT_HEIGHT * (1 - mm / maxMm);
  const xFor = (monthIndex: number) => PAD_LEFT + (PLOT_WIDTH / 12) * monthIndex + (PLOT_WIDTH / 12) / 2;

  const annualPath = annualCurveMm.map((mm, t) => `${t === 0 ? "M" : "L"} ${xFor(t)} ${yFor(mm)}`).join(" ");
  // Semi-annual harmonic is fit as zero-mean (fit.ts); shift by the
  // location's own mean only to plot it on the same mm axis as the
  // bars — a display offset, not a recomputation of the fit.
  const semiAnnualPath = semiAnnualCurveMm
    .map((mm, t) => `${t === 0 ? "M" : "L"} ${xFor(t)} ${yFor(meanMm + mm)}`)
    .join(" ");

  const yTicks = [0, maxMm / 2, maxMm];

  return (
    <figure className="flex flex-col gap-1">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Grafik siklus curah hujan bulanan, dengan harmonik tahunan dan semi-tahunan"
        className="w-full"
      >
        <line x1={PAD_LEFT} y1={PAD_TOP} x2={PAD_LEFT} y2={HEIGHT - PAD_BOTTOM} className="stroke-rule" strokeWidth={0.5} />
        <line
          x1={PAD_LEFT}
          y1={HEIGHT - PAD_BOTTOM}
          x2={WIDTH}
          y2={HEIGHT - PAD_BOTTOM}
          className="stroke-ink"
          strokeWidth={0.5}
        />

        {yTicks.map((tick) => (
          <g key={tick}>
            <text
              x={PAD_LEFT - 6}
              y={yFor(tick) + 4}
              textAnchor="end"
              className={`fill-ink font-mono tabular-nums ${isPlate ? "text-xs" : "text-tick"}`}
            >
              {Math.round(tick)}
            </text>
          </g>
        ))}

        {monthlyMm.map((mm, t) => {
          const fullHeight = PLOT_HEIGHT * (mm / maxMm);
          const height = drawn ? fullHeight : 0;
          return (
            <rect
              key={t}
              x={xFor(t) - barWidth / 2}
              y={HEIGHT - PAD_BOTTOM - height}
              width={barWidth}
              height={height}
              className={FAMILY_FILL_CLASS[family]}
              // Tailwind's transition-[height,y] arbitrary value is invalid
              // (it doesn't support a comma-separated property list there)
              // and was silently dropped, so the bars never actually
              // animated — transitionProperty via inline style is the
              // reliable way to transition SVG presentation attributes.
              style={{
                transitionProperty: "height, y",
                transitionDuration: "600ms",
                transitionTimingFunction: "cubic-bezier(0.2,0,0,1)",
                transitionDelay: `${t * 40}ms`,
              }}
            />
          );
        })}

        <path
          d={annualPath}
          fill="none"
          className="stroke-ink"
          strokeWidth={isPlate ? 2.5 : 1.5}
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: drawn ? 0 : 1,
            transition: "stroke-dashoffset 600ms cubic-bezier(0.2,0,0,1)",
          }}
        />
        <path
          d={semiAnnualPath}
          fill="none"
          className="stroke-ink/50"
          strokeWidth={isPlate ? 1.75 : 1}
          strokeDasharray="3 2"
          pathLength={1}
          style={{
            strokeDashoffset: drawn ? 0 : 1,
            transition: "stroke-dashoffset 600ms cubic-bezier(0.2,0,0,1) 100ms",
          }}
        />

        {showMonthLabels &&
          MONTH_LABELS_ID.map((label, t) => (
            <text
              key={label}
              x={xFor(t)}
              y={HEIGHT - PAD_BOTTOM + 16}
              textAnchor="middle"
              className={`fill-ink font-mono ${isPlate ? "text-xs tracking-widest" : "text-tick"}`}
            >
              {isPlate ? label.toUpperCase() : label}
            </text>
          ))}
      </svg>

      <figcaption className={`flex flex-wrap gap-x-4 gap-y-1 text-ink/70 ${isPlate ? "text-sm" : "text-xs"}`}>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className={`inline-block h-2 w-3 shrink-0 ${FAMILY_FILL_CLASS[family]}`} />
          Batang — curah hujan bulanan aktual
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-0 w-3 shrink-0 border-t-[1.5px] border-ink" />
          Garis penuh — harmonik tahunan (satu gelombang per tahun)
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-0 w-3 shrink-0 border-t border-dashed border-ink/50" />
          Garis putus-putus — harmonik semi-tahunan (dua gelombang per tahun)
        </span>
      </figcaption>
    </figure>
  );
}
