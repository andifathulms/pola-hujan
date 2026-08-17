"use client";

import { useMemo, useState } from "react";
import { classifyRegime, fitHarmonics, MONTHS_PER_YEAR } from "@/lib/harmonic";
import { FAMILY_FILL_CLASS, FAMILY_LABEL, FAMILY_TEXT_CLASS, MONTH_LABELS_ID, type Family } from "@/lib/family";

const MEAN_MM = 200;

function buildCycle(annualAmpMm: number, annualPeakMonth: number, semiAnnualAmpMm: number, semiAnnualPeakMonth: number) {
  const months: number[] = [];
  for (let t = 0; t < MONTHS_PER_YEAR; t += 1) {
    const annual = annualAmpMm * Math.cos((2 * Math.PI * (t - annualPeakMonth)) / 12);
    const semi = semiAnnualAmpMm * Math.cos((2 * Math.PI * (t - semiAnnualPeakMonth)) / 6);
    months.push(Math.max(0, MEAN_MM + annual + semi));
  }
  return months;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="font-mono tabular-nums text-ink/70">
          {value.toFixed(1)} {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-ink"
      />
    </label>
  );
}

/**
 * The method made playable (PRD.md §6.7): drag the annual and
 * semi-annual amplitude/phase and watch a synthetic cycle become
 * monsunal, ekuatorial, or lokal in real time. Unlike every other page,
 * this component genuinely does compute a fit and a classification on
 * every change — that is the entire point of a live decomposition, and
 * lib/harmonic is pure enough to run safely in the browser. It is the
 * one deliberate, documented exception to "nothing is computed in a
 * component" (CLAUDE.md invariant 15), which otherwise governs every
 * data-driven page.
 */
export function HarmonicExplainer() {
  const [annualAmpMm, setAnnualAmpMm] = useState(120);
  const [annualPeakMonth, setAnnualPeakMonth] = useState(0);
  const [semiAnnualAmpMm, setSemiAnnualAmpMm] = useState(20);
  const [semiAnnualPeakMonth, setSemiAnnualPeakMonth] = useState(2);

  const monthlyMm = useMemo(
    () => buildCycle(annualAmpMm, annualPeakMonth, semiAnnualAmpMm, semiAnnualPeakMonth),
    [annualAmpMm, annualPeakMonth, semiAnnualAmpMm, semiAnnualPeakMonth],
  );
  const classification = useMemo(() => classifyRegime(fitHarmonics(monthlyMm)), [monthlyMm]);
  const family = classification.family as Family;

  const maxMm = Math.max(...monthlyMm, 1);

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <Slider label="Amplitudo tahunan" value={annualAmpMm} min={0} max={200} step={1} unit="mm" onChange={setAnnualAmpMm} />
        <Slider
          label="Bulan puncak tahunan"
          value={annualPeakMonth}
          min={0}
          max={11.9}
          step={0.1}
          unit={MONTH_LABELS_ID[Math.round(annualPeakMonth) % 12] ?? ""}
          onChange={setAnnualPeakMonth}
        />
        <Slider label="Amplitudo semi-tahunan" value={semiAnnualAmpMm} min={0} max={200} step={1} unit="mm" onChange={setSemiAnnualAmpMm} />
        <Slider
          label="Bulan puncak semi-tahunan"
          value={semiAnnualPeakMonth}
          min={0}
          max={5.9}
          step={0.1}
          unit={MONTH_LABELS_ID[Math.round(semiAnnualPeakMonth) % 12] ?? ""}
          onChange={setSemiAnnualPeakMonth}
        />

        <div className="border-t border-rule pt-3">
          <p className={`text-lg font-semibold ${FAMILY_TEXT_CLASS[family]}`}>
            {FAMILY_LABEL[family]} · {classification.subtype}
          </p>
          <p className="text-xs text-ink/70">
            Diklasifikasikan langsung oleh <code className="font-mono">lib/harmonic</code> yang sama dengan yang
            memproses data nyata — ambang yang sama, kode yang sama.
          </p>
        </div>
      </div>

      <svg viewBox="0 0 480 240" role="img" aria-label="Kurva sintetis dari parameter yang dipilih" className="w-full">
        <line x1={40} y1={216} x2={480} y2={216} className="stroke-ink" strokeWidth={0.5} />
        {monthlyMm.map((mm, t) => {
          const barWidth = (480 - 48) / 12 - 4;
          const x = 40 + ((480 - 48) / 12) * t + 2;
          const height = 190 * (mm / maxMm);
          return (
            <rect
              key={t}
              x={x}
              y={216 - height}
              width={barWidth}
              className={FAMILY_FILL_CLASS[family]}
              height={height}
            />
          );
        })}
        {MONTH_LABELS_ID.map((label, t) => (
          <text key={label} x={40 + ((480 - 48) / 12) * t + ((480 - 48) / 12) / 2} y={232} textAnchor="middle" className="fill-ink font-mono text-[10px]">
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}
