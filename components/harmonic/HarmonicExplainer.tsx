"use client";

import { useId, useMemo, useState } from "react";
import { annualHarmonicMm, classifyRegime, fitHarmonics, MONTHS_PER_YEAR, semiAnnualHarmonicMm } from "@/lib/harmonic";
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
  valueText,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit: string;
  valueText: string;
}) {
  const labelId = useId();
  return (
    // A plain div, not <label> wrapping the input: <label> would fold
    // the live value readout into the input's accessible NAME, so it'd
    // change on every drag tick. aria-labelledby points at only the
    // static label text instead; the live value is aria-hidden since
    // aria-valuetext (below) already gives the input's accessible value.
    <div className="flex flex-col gap-1 text-sm">
      <span className="flex justify-between">
        <span id={labelId}>{label}</span>
        <span aria-hidden="true" className="font-mono tabular-nums text-ink/70">
          {value.toFixed(1)} {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-labelledby={labelId}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-ink"
      />
    </div>
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

  // The two harmonics as the sliders define them directly — not a
  // re-fit of monthlyMm (which would drift slightly once the 0mm floor
  // clamps a negative value), so what's drawn is exactly what the two
  // amplitude/phase sliders above are constructing. Same shape as
  // CycleCurve.tsx: annualHarmonicMm carries the mean; semiAnnualHarmonicMm
  // is zero-mean and shifted by MEAN_MM only for display.
  const syntheticFit = { meanMm: MEAN_MM, annualAmpMm, annualPeakMonth, semiAnnualAmpMm, semiAnnualPeakMonth };
  // Twelve values apiece — cheap enough every render, no memoization needed.
  const annualCurveMm = Array.from({ length: MONTHS_PER_YEAR }, (_, t) => annualHarmonicMm(syntheticFit, t));
  const semiAnnualCurveMm = Array.from({ length: MONTHS_PER_YEAR }, (_, t) => semiAnnualHarmonicMm(syntheticFit, t));

  const maxMm = Math.max(...monthlyMm, ...annualCurveMm, 1);

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <Slider
          label="Amplitudo tahunan"
          value={annualAmpMm}
          min={0}
          max={200}
          step={1}
          unit="mm"
          valueText={`${annualAmpMm.toFixed(0)} mm`}
          onChange={setAnnualAmpMm}
        />
        <Slider
          label="Bulan puncak tahunan"
          value={annualPeakMonth}
          min={0}
          max={11.9}
          step={0.1}
          unit={MONTH_LABELS_ID[Math.round(annualPeakMonth) % 12] ?? ""}
          valueText={MONTH_LABELS_ID[Math.round(annualPeakMonth) % 12] ?? ""}
          onChange={setAnnualPeakMonth}
        />
        <Slider
          label="Amplitudo semi-tahunan"
          value={semiAnnualAmpMm}
          min={0}
          max={200}
          step={1}
          unit="mm"
          valueText={`${semiAnnualAmpMm.toFixed(0)} mm`}
          onChange={setSemiAnnualAmpMm}
        />
        <Slider
          label="Bulan puncak semi-tahunan"
          value={semiAnnualPeakMonth}
          min={0}
          max={5.9}
          step={0.1}
          unit={MONTH_LABELS_ID[Math.round(semiAnnualPeakMonth) % 12] ?? ""}
          valueText={MONTH_LABELS_ID[Math.round(semiAnnualPeakMonth) % 12] ?? ""}
          onChange={setSemiAnnualPeakMonth}
        />

        <div className="border-t border-rule pt-3">
          <p className={`text-lg font-semibold ${FAMILY_TEXT_CLASS[family]}`}>
            {FAMILY_LABEL[family]} · {classification.subtype}
          </p>
          <p className="text-sm text-ink/70">
            Diklasifikasikan langsung oleh <code className="font-mono">lib/harmonic</code> yang sama dengan yang
            memproses data nyata — ambang yang sama, kode yang sama.
          </p>
        </div>
      </div>

      <figure className="flex flex-col gap-1">
        <p className="text-xs font-medium text-ink/70">
          Kurva buatan — dibangun langsung dari keempat nilai di kiri, bukan data cuaca asli manapun.
        </p>
        <svg viewBox="0 0 480 240" role="img" aria-label="Kurva sintetis dari parameter yang dipilih, dengan harmonik tahunan dan semi-tahunan" className="w-full">
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

          <path
            d={annualCurveMm.map((mm, t) => `${t === 0 ? "M" : "L"} ${40 + ((480 - 48) / 12) * t + ((480 - 48) / 12) / 2} ${216 - 190 * (mm / maxMm)}`).join(" ")}
            fill="none"
            className="stroke-ink"
            strokeWidth={1.5}
          />
          <path
            d={semiAnnualCurveMm
              .map((mm, t) => `${t === 0 ? "M" : "L"} ${40 + ((480 - 48) / 12) * t + ((480 - 48) / 12) / 2} ${216 - 190 * ((MEAN_MM + mm) / maxMm)}`)
              .join(" ")}
            fill="none"
            className="stroke-ink/50"
            strokeWidth={1}
            strokeDasharray="3 2"
          />

          {MONTH_LABELS_ID.map((label, t) => (
            <text key={label} x={40 + ((480 - 48) / 12) * t + ((480 - 48) / 12) / 2} y={232} textAnchor="middle" className="fill-ink font-mono text-[10px]">
              {label}
            </text>
          ))}
        </svg>

        <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/70">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className={`inline-block h-2 w-3 shrink-0 ${FAMILY_FILL_CLASS[family]}`} />
            Batang — kedua harmonik dijumlahkan
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="inline-block h-0 w-3 shrink-0 border-t-[1.5px] border-ink" />
            Garis penuh — harmonik tahunan sendiri
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="inline-block h-0 w-3 shrink-0 border-t border-dashed border-ink/50" />
            Garis putus-putus — harmonik semi-tahunan sendiri
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
