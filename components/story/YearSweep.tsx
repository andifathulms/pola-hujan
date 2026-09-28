"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Manifest, RegimeRecord } from "@/lib/grid/schema";
import { MONTH_LABELS_ID, MONTH_NAMES_ID, formatMm } from "@/lib/family";
import { RegimeMap } from "@/components/map/RegimeMap";
import { ROUTES } from "@/lib/routes";

/** How long each month holds during the sweep. Twelve steps ≈ eleven seconds a year: slow enough to read, not so slow it stalls. */
const STEP_MS = 900;
const LABELLED = ["jakarta", "ambon", "kupang", "padang", "timika"];

export interface YearSweepProps {
  records: RegimeRecord[];
  manifest: Manifest;
  lead: string;
  /** "2006–2015" — PERIOD_LABEL from lib/grid/lookup, passed in so this client component does not import the grids. */
  periodLabel: string;
}

/**
 * The home page hero and the app's one orchestrated moment (DESIGN.md
 * §7): the year sweeps January to December and every dot grows with
 * that month's normal. Month order is fixed and never rotated
 * (invariant 8). Every number shown comes from the pipeline —
 * manifest.months for the per-month extremes and means.
 *
 * Reduced motion gets a complete alternative, not a degraded one: no
 * autoplay, and the twelve month buttons step through the same frames.
 * The sweep also stops once the reader takes a month for themselves, and
 * pauses while the hero is off screen or the tab is hidden.
 */
export function YearSweep({ records, manifest, lead, periodLabel }: YearSweepProps) {
  const [month, setMonth] = useState(0);
  const [playing, setPlaying] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  const byId = new Map(records.map((r) => [r.id, r]));
  const maxMean = Math.max(1, ...manifest.months.map((m) => m.meanMm));
  const maxMonthlyMm = Math.max(1, ...records.map((r) => r.monthlyMm[r.wettestMonth] ?? 0));

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) setPlaying(true);
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry?.isIntersecting ?? true), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !onScreen) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") setMonth((m) => (m + 1) % 12);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [playing, onScreen]);

  const pick = useCallback((m: number) => {
    setPlaying(false);
    setMonth(m);
  }, []);

  const current = manifest.months[month];
  const wettest = current ? byId.get(current.wettestId) : undefined;
  const driest = current ? byId.get(current.driestId) : undefined;

  return (
    <section ref={heroRef} aria-labelledby="hero-title" className="flex flex-col gap-4">
      <div className="grid items-end gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-muted">
            Atlas pola hujan tahunan · {records.length} kota
          </p>
          <h1 id="hero-title" className="max-w-[14ch] text-balance text-[40px] font-extrabold leading-[0.98] tracking-[-0.035em] sm:text-[52px] lg:text-[64px]">
            Musim hujan tidak datang serentak.
          </h1>
          <p className="max-w-[40ch] font-story text-lg italic leading-snug lg:text-[22px]">{lead}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link href={ROUTES.atlas} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-stock no-underline hover:bg-ink/85">
              Jelajahi peta →
            </Link>
            <a href="#cari-kota" className="inline-flex items-center gap-2 rounded-full border border-stitch px-5 py-3 text-sm font-bold text-ink no-underline hover:border-ink">
              Cari kotamu
            </a>
          </div>
        </div>

        <div aria-live="polite" className="flex flex-col gap-1.5 lg:pb-2">
          <span className="text-[48px] font-extrabold leading-[0.9] tracking-[-0.04em] tabular-nums lg:text-[76px]">{MONTH_NAMES_ID[month]}</span>
          {wettest && driest && current && (
            <span className="text-sm text-ink-muted">
              Terbasah: <strong className="font-bold text-ink">{wettest.name} {formatMm(wettest.monthlyMm[month] ?? 0)} mm</strong> · Terkering:{" "}
              <strong className="font-bold text-ink">{driest.name} {formatMm(driest.monthlyMm[month] ?? 0)} mm</strong>
            </span>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-rule">
        <RegimeMap
          records={records}
          selectedId={undefined}
          mode="month"
          month={month}
          labelIds={LABELLED}
          maxMonthlyMm={maxMonthlyMm}
          ariaLabel={`Peta Indonesia: titik berukuran sesuai curah hujan normal bulan ${MONTH_NAMES_ID[month]}`}
        />
      </div>

      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Jeda putaran tahun" : "Putar tahun, Januari sampai Desember"}
          className="grid w-11 flex-none place-items-center rounded-card border border-rule bg-stock text-ink hover:border-ink"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" className="fill-current">
            {playing ? <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" /> : <path d="M4 2.5v11l9-5.5z" />}
          </svg>
        </button>
        <div role="group" aria-label="Pilih bulan" className="grid flex-1 grid-cols-12 gap-0.5">
          {MONTH_LABELS_ID.map((label, i) => {
            const meanMm = manifest.months[i]?.meanMm ?? 0;
            const on = i === month;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={on}
                aria-label={`${MONTH_NAMES_ID[i]}, rata-rata ${formatMm(meanMm)} mm di ${records.length} kota`}
                onClick={() => pick(i)}
                className={`flex flex-col items-center justify-end gap-1 rounded-card px-0.5 pb-1.5 pt-1 transition-colors duration-fast ${
                  on ? "bg-plate text-ink" : "text-ink-muted hover:bg-plate/60"
                }`}
              >
                <span className="flex h-8 w-full items-end justify-center">
                  <span
                    aria-hidden
                    className={`w-3/5 rounded-t-[2px] transition-colors duration-fast ${on ? "bg-ink" : "bg-stitch"}`}
                    style={{ height: `${Math.round((meanMm / maxMean) * 28) + 3}px` }}
                  />
                </span>
                <span className="text-xs font-semibold">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
        <span className="rounded-[4px] border border-rule bg-stock px-1.5 py-0.5 font-mono">CHIRPS 2.0 · normal {periodLabel}</span>
        <span>
          Luas titik: curah hujan normal bulan itu; batang di bawah: rata-rata {records.length} kota.{" "}
          <strong className="font-semibold text-ink">Klasifikasi turunan, bukan Zona Musim resmi BMKG.</strong> Normal jangka panjang, bukan
          prakiraan.
        </span>
      </p>
    </section>
  );
}
