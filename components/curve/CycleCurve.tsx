"use client";

import { useEffect, useState } from "react";
import { FAMILY_FILL_CLASS, MONTH_LABELS_ID, type Family } from "@/lib/family";

export interface CycleCurveProps {
  monthlyMm: number[];
  annualCurveMm: number[];
  semiAnnualCurveMm: number[];
  meanMm: number;
  family: Family;
}

const WIDTH = 480;
const HEIGHT = 240;
const PAD_LEFT = 40;
const PAD_BOTTOM = 24;
const PAD_TOP = 12;
const PLOT_WIDTH = WIDTH - PAD_LEFT - 8;
const PLOT_HEIGHT = HEIGHT - PAD_TOP - PAD_BOTTOM;

/**
 * Twelve monthly bars plus the two fitted harmonics drawn as separate
 * thin lines — never summed, DESIGN.md §4. Month order is fixed Jan-Dec
 * (CLAUDE.md invariant 8): this component never rotates or reorders.
 */
export function CycleCurve({ monthlyMm, annualCurveMm, semiAnnualCurveMm, meanMm, family }: CycleCurveProps) {
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
          <text x={PAD_LEFT - 6} y={yFor(tick) + 4} textAnchor="end" className="fill-ink font-mono text-[10px] tabular-nums">
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
            className={`${FAMILY_FILL_CLASS[family]} transition-[height,y] duration-curve ease`}
            style={{ transitionDelay: `${t * 40}ms` }}
          />
        );
      })}

      <path
        d={annualPath}
        fill="none"
        className="stroke-ink"
        strokeWidth={1.5}
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
        strokeWidth={1}
        strokeDasharray="3 2"
        pathLength={1}
        style={{
          strokeDashoffset: drawn ? 0 : 1,
          transition: "stroke-dashoffset 600ms cubic-bezier(0.2,0,0,1) 100ms",
        }}
      />

      {MONTH_LABELS_ID.map((label, t) => (
        <text
          key={label}
          x={xFor(t)}
          y={HEIGHT - PAD_BOTTOM + 16}
          textAnchor="middle"
          className="fill-ink font-mono text-[10px]"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}
