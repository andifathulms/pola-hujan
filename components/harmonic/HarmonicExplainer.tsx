"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { RegimeRecord } from "@/lib/grid/schema";
import { annualHarmonicMm, classifyRegime, fitHarmonics, MONTHS_PER_YEAR, semiAnnualHarmonicMm } from "@/lib/harmonic";
import { FAMILY_FILL_CLASS, FAMILY_LABEL, FAMILY_TEXT_CLASS, MONTH_LABELS_ID, type Family } from "@/lib/family";

/**
 * Only the four numbers this component actually seeds itself from, plus
 * what identifies the seed to the reader — not the full RegimeRecord
 * (which also carries two 12-value curve arrays, monthlyMm, province,
 * coordinates, and the BMKG comparison, none of which this component
 * reads). Trimming the type lets the page trim the data before it
 * crosses into the client bundle.
 */
export type HarmonicSeed = Pick<RegimeRecord, "id" | "name" | "family" | "fit">;

export interface HarmonicExplainerProps {
  records: HarmonicSeed[];
}

function buildCycle(meanMm: number, annualAmpMm: number, annualPeakMonth: number, semiAnnualAmpMm: number, semiAnnualPeakMonth: number) {
  const months: number[] = [];
  for (let t = 0; t < MONTHS_PER_YEAR; t += 1) {
    const annual = annualAmpMm * Math.cos((2 * Math.PI * (t - annualPeakMonth)) / 12);
    const semi = semiAnnualAmpMm * Math.cos((2 * Math.PI * (t - semiAnnualPeakMonth)) / 6);
    months.push(Math.max(0, meanMm + annual + semi));
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

const FALLBACK_MEAN_MM = 200;
const FALLBACK_SEED = { annualAmpMm: 120, annualPeakMonth: 0, semiAnnualAmpMm: 20, semiAnnualPeakMonth: 2, meanMm: FALLBACK_MEAN_MM };

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
 *
 * Starts from a real location's actual fit — Jakarta by default, or
 * whichever id the atlas linked here with via ?dari= — rather than an
 * arbitrary made-up cycle, so there's a worked, real example to look at
 * before anyone drags anything. `records` (from the pipeline, not
 * computed here) is only ever read for that starting point; every value
 * on screen afterward comes from what the sliders are set to.
 */
export function HarmonicExplainer({ records }: HarmonicExplainerProps) {
  const defaultSeed = records.find((r) => r.id === "jakarta") ?? records[0];
  const seedValues = defaultSeed
    ? {
        annualAmpMm: defaultSeed.fit.annualAmpMm,
        annualPeakMonth: defaultSeed.fit.annualPeakMonth,
        semiAnnualAmpMm: defaultSeed.fit.semiAnnualAmpMm,
        semiAnnualPeakMonth: defaultSeed.fit.semiAnnualPeakMonth,
        meanMm: defaultSeed.fit.meanMm,
      }
    : FALLBACK_SEED;

  const [meanMm, setMeanMm] = useState(seedValues.meanMm);
  const [annualAmpMm, setAnnualAmpMm] = useState(seedValues.annualAmpMm);
  const [annualPeakMonth, setAnnualPeakMonth] = useState(seedValues.annualPeakMonth);
  const [semiAnnualAmpMm, setSemiAnnualAmpMm] = useState(seedValues.semiAnnualAmpMm);
  const [semiAnnualPeakMonth, setSemiAnnualPeakMonth] = useState(seedValues.semiAnnualPeakMonth);
  const [seedLabel, setSeedLabel] = useState(defaultSeed ? `${defaultSeed.name} (${FAMILY_LABEL[defaultSeed.family as Family]})` : null);

  // ?dari=<id> (linked from a location's "kenapa diklasifikasi begini?"
  // disclosure on the atlas) overrides the default Jakarta starting
  // point with that location's real numbers. Read on mount only, same
  // pattern as AtlasView's ?lokasi= — window isn't available during the
  // static-export server render.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("dari");
    const seed = fromUrl ? records.find((r) => r.id === fromUrl) : undefined;
    if (!seed) return;
    setMeanMm(seed.fit.meanMm);
    setAnnualAmpMm(seed.fit.annualAmpMm);
    setAnnualPeakMonth(seed.fit.annualPeakMonth);
    setSemiAnnualAmpMm(seed.fit.semiAnnualAmpMm);
    setSemiAnnualPeakMonth(seed.fit.semiAnnualPeakMonth);
    setSeedLabel(`${seed.name} (${FAMILY_LABEL[seed.family as Family]})`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthlyMm = useMemo(
    () => buildCycle(meanMm, annualAmpMm, annualPeakMonth, semiAnnualAmpMm, semiAnnualPeakMonth),
    [meanMm, annualAmpMm, annualPeakMonth, semiAnnualAmpMm, semiAnnualPeakMonth],
  );
  const classification = useMemo(() => classifyRegime(fitHarmonics(monthlyMm)), [monthlyMm]);
  const family = classification.family as Family;

  // The two harmonics as the sliders define them directly — not a
  // re-fit of monthlyMm (which would drift slightly once the 0mm floor
  // clamps a negative value), so what's drawn is exactly what the two
  // amplitude/phase sliders above are constructing. Same shape as
  // CycleCurve.tsx: annualHarmonicMm carries the mean; semiAnnualHarmonicMm
  // is zero-mean and shifted by meanMm only for display.
  const syntheticFit = { meanMm, annualAmpMm, annualPeakMonth, semiAnnualAmpMm, semiAnnualPeakMonth };
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
          {seedLabel
            ? `Titik awal: data nyata ${seedLabel}. Begitu kamu menggeser slider di atas, kurva ini jadi buatan — hipotetis, bukan lagi data asli.`
            : "Kurva buatan — dibangun langsung dari keempat nilai di kiri, bukan data cuaca asli manapun."}
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
              .map((mm, t) => `${t === 0 ? "M" : "L"} ${40 + ((480 - 48) / 12) * t + ((480 - 48) / 12) / 2} ${216 - 190 * ((meanMm + mm) / maxMm)}`)
              .join(" ")}
            fill="none"
            className="stroke-ink/50"
            strokeWidth={1}
            strokeDasharray="3 2"
          />

          {MONTH_LABELS_ID.map((label, t) => (
            <text key={label} x={40 + ((480 - 48) / 12) * t + ((480 - 48) / 12) / 2} y={232} textAnchor="middle" className="fill-ink font-mono text-tick">
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
