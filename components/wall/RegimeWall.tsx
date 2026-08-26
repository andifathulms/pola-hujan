"use client";

import { useMemo, useState } from "react";
import type { RegimeRecord } from "@/lib/grid/schema";
import {
  FAMILIES,
  FAMILY_BG_CLASS,
  FAMILY_BORDER_CLASS,
  FAMILY_DESCRIPTION,
  FAMILY_LABEL,
  FAMILY_TEXT_CLASS,
  MONTH_LABELS_ID,
  type Family,
} from "@/lib/family";
import { MiniCycle } from "@/components/wall/MiniCycle";

export interface RegimeWallProps {
  /** Already filtered by the atlas — the wall draws what it is given. */
  records: RegimeRecord[];
  /** The unfiltered atlas size, so the heading can say how much of it is on screen. */
  totalCount: number;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}

type SortMode = "keluarga" | "puncak" | "curah";

const SORT_LABEL: Record<SortMode, string> = {
  keluarga: "keluarga",
  puncak: "bulan puncak",
  curah: "curah tahunan",
};

const SORT_CAPTION: Record<SortMode, string> = {
  keluarga: "Dikelompokkan per keluarga, lalu diurutkan menurut bulan puncaknya.",
  puncak:
    "Diurutkan menurut bulan puncak hujan, Januari ke Desember. Warna keluarga tidak ikut diurutkan — kalau warnanya tetap mengelompok, itu temuannya.",
  curah: "Diurutkan menurut total curah hujan tahunan, dari yang paling basah.",
};

const SORT_MODES: SortMode[] = ["keluarga", "puncak", "curah"];

/** Peak month as a whole month index. `peakMonth` is the fitted phase in months and can be fractional; the label needs a month. */
function peakMonthIndex(record: RegimeRecord): number {
  return Math.round(record.peakMonth) % 12;
}

/**
 * Presentation aggregates only — the wettest month's value sets the
 * cell's own y-scale, and the annual total is a sort key. Neither is a
 * classification quantity: the fit, the family and the sub-type all
 * arrive already decided from the pipeline (CLAUDE.md invariant 15).
 */
function maxMm(record: RegimeRecord): number {
  return Math.max(...record.monthlyMm);
}
function annualMm(record: RegimeRecord): number {
  return record.monthlyMm.reduce((total, mm) => total + mm, 0);
}

function byPeakThenName(a: RegimeRecord, b: RegimeRecord): number {
  return peakMonthIndex(a) - peakMonthIndex(b) || a.name.localeCompare(b.name, "id");
}

/**
 * Every location's annual cycle, at once, on one shared twelve-month
 * axis. The atlas's founding claim — PRD.md §1, that "musim hujan" does
 * not mean the same months everywhere — is a comparison, and a
 * one-selection-at-a-time map makes the reader hold that comparison in
 * their head. Here it is on the page: sort by peak month and the
 * Monsunal bars bunch at the two ends of the year while the Lokal ones
 * sit in the middle of it, before anything has been clicked.
 *
 * Each cell keeps its own mm scale and states it. A shared y-scale
 * across 34 places would flatten the drier ones into nothing — the
 * comparison here is of shape and timing, not of magnitude
 * (DESIGN-REWORK.md §1.1, the same reason CompareView labels two
 * scales).
 */
export function RegimeWall({ records, totalCount, selectedId, onSelect }: RegimeWallProps) {
  const [sort, setSort] = useState<SortMode>("keluarga");

  const sorted = useMemo(() => {
    const copy = [...records];
    switch (sort) {
      case "puncak":
        return copy.sort(byPeakThenName);
      case "curah":
        return copy.sort((a, b) => annualMm(b) - annualMm(a));
      case "keluarga":
        return copy.sort(byPeakThenName);
      default: {
        const exhaustive: never = sort;
        return exhaustive;
      }
    }
  }, [records, sort]);

  const bands =
    sort === "keluarga"
      ? FAMILIES.map((family) => ({
          family,
          rows: sorted.filter((record) => record.family === family),
        })).filter((band) => band.rows.length > 0)
      : [{ family: null, rows: sorted }];

  return (
    <section aria-labelledby="dinding-rezim" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div>
          <h2 id="dinding-rezim" className="font-display text-lg font-semibold">
            Dinding rezim —{" "}
            <span className="tabular-nums">
              {records.length === totalCount ? `${totalCount} lokasi sekaligus` : `${records.length} dari ${totalCount} lokasi`}
            </span>
          </h2>
          <p className="text-sm text-ink/70">{SORT_CAPTION[sort]}</p>
        </div>

        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="sr-only">Urutkan dinding rezim</legend>
          <span aria-hidden className="font-mono text-xs uppercase tracking-widest text-ink/70">
            Urut
          </span>
          {SORT_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSort(mode)}
              aria-pressed={sort === mode}
              className={`rounded border px-2 py-1 text-xs transition-colors duration-fast ${
                sort === mode ? "border-ink bg-ink text-stock" : "border-rule text-ink/70 hover:border-ink hover:text-ink"
              }`}
            >
              {SORT_LABEL[mode]}
            </button>
          ))}
        </fieldset>
      </div>

      {records.length === 0 && (
        <p className="border border-dashed border-stitch p-4 text-sm text-ink/70">
          Tidak ada lokasi yang cocok dengan saringan ini.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {bands.map((band) => (
          <div key={band.family ?? "semua"} className="flex flex-col">
            {band.family && (
              <div
                className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b-2 pb-1 ${FAMILY_BORDER_CLASS[band.family]}`}
              >
                <h3 className={`font-display text-base font-semibold ${FAMILY_TEXT_CLASS[band.family]}`}>
                  {FAMILY_LABEL[band.family]}
                </h3>
                <p className="text-sm text-ink/70">
                  {FAMILY_DESCRIPTION[band.family]} <span className="tabular-nums">{band.rows.length} lokasi</span>
                </p>
              </div>
            )}

            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
              {band.rows.map((record) => {
                const family = record.family as Family;
                const isSelected = record.id === selectedId;
                const disagrees = record.agrees === false;
                return (
                  <li key={record.id} className="-mr-px -mb-px border border-rule">
                    <button
                      type="button"
                      onClick={() => onSelect(record.id)}
                      aria-pressed={isSelected}
                      aria-label={`${record.name}, ${FAMILY_LABEL[family]}, puncak ${MONTH_LABELS_ID[peakMonthIndex(record)]}, ${Math.round(
                        maxMm(record),
                      )} milimeter di bulan terbasah${disagrees ? ", berbeda dari klasifikasi BMKG" : ""}`}
                      className={`flex w-full flex-col gap-1 px-2 py-2 text-left transition-colors duration-fast ${
                        isSelected ? "bg-plate ring-1 ring-inset ring-stitch" : "hover:bg-plate/50"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span
                          aria-hidden
                          className={`inline-block h-2 w-2 shrink-0 rounded-full ${FAMILY_BG_CLASS[family]}`}
                          style={
                            disagrees
                              ? {
                                  backgroundImage:
                                    "repeating-linear-gradient(45deg, transparent, transparent 1px, var(--color-ink) 1px, var(--color-ink) 2px)",
                                }
                              : undefined
                          }
                        />
                        <span className="truncate text-sm">{record.name}</span>
                      </span>

                      <MiniCycle monthlyMm={record.monthlyMm} family={family} maxMm={maxMm(record)} />

                      <span className="font-mono text-xs tabular-nums text-ink/70">
                        {MONTH_LABELS_ID[peakMonthIndex(record)]} · {Math.round(maxMm(record))} mm
                        {disagrees && <span> · beda dari BMKG</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* The wall's contract, stated once rather than 34 times: what the
          x-axis is, and that the y-axis is per-cell. */}
      <p className="border-t border-rule pt-1 font-mono text-xs text-ink/70">
        Setiap sel membagi lebarnya jadi dua belas slot bulan yang sama, Januari di kiri sampai Desember di kanan —
        jadi satu bulan jatuh di tempat yang sama di seluruh dinding. Skala mm-nya per sel, dicantumkan di bawah tiap
        grafik.
      </p>
    </section>
  );
}
