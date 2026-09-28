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
  /** Called with a location id while a cell is hovered or focused, and null when it leaves — rings the dot on the map. */
  onHover?: (id: string | null) => void;
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
    "Diurutkan menurut bulan terbasah, Januari ke Desember. Warna keluarga tidak ikut diurutkan — kalau warnanya tetap mengelompok, itu temuannya.",
  curah: "Diurutkan menurut total curah hujan tahunan, dari yang paling basah.",
};

const SORT_MODES: SortMode[] = ["puncak", "keluarga", "curah"];


/** The wettest month's value — emitted by the pipeline; sets the cell's own y-scale. */
function maxMm(record: RegimeRecord): number {
  return record.monthlyMm[record.wettestMonth] ?? 0;
}

/**
 * By the wettest month each cell is labelled with, Jan to Des, then by
 * the fitted peak phase within a month, then name. Sorting on the same
 * month the cell shows keeps the order readable at a glance.
 */
function byPeakThenName(a: RegimeRecord, b: RegimeRecord): number {
  return a.wettestMonth - b.wettestMonth || a.peakMonth - b.peakMonth || a.name.localeCompare(b.name, "id");
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
export function RegimeWall({ records, totalCount, selectedId, onSelect, onHover }: RegimeWallProps) {
  // Peak month first: it is the sort that proves the finding with no
  // interaction — Monsunal gathers at both ends of the year, Lokal in
  // the middle (DESIGN.md §5.1).
  const [sort, setSort] = useState<SortMode>("puncak");

  const sorted = useMemo(() => {
    const copy = [...records];
    switch (sort) {
      case "puncak":
        return copy.sort(byPeakThenName);
      case "curah":
        return copy.sort((a, b) => b.annualTotalMm - a.annualTotalMm);
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
    <section aria-labelledby="dinding-rezim" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex flex-col gap-1">
          <h2 id="dinding-rezim" className="text-xl font-extrabold tracking-tight">
            Semua kota{" "}
            <span className="font-mono text-sm font-normal tabular-nums text-ink-muted">
              {records.length === totalCount ? totalCount : `${records.length} dari ${totalCount}`}
            </span>
          </h2>
          <p className="max-w-[70ch] text-xs text-ink-muted">{SORT_CAPTION[sort]}</p>
        </div>

        <fieldset className="inline-flex rounded-full bg-plate p-1">
          <legend className="sr-only">Urutkan</legend>
          {SORT_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSort(mode)}
              aria-pressed={sort === mode}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-fast ${
                sort === mode ? "bg-stock text-ink shadow-[0_1px_2px_rgba(20,23,31,0.12)]" : "text-ink-muted hover:text-ink"
              }`}
            >
              {SORT_LABEL[mode]}
            </button>
          ))}
        </fieldset>
      </div>

      {records.length === 0 && (
        <p className="rounded-card border border-dashed border-stitch p-4 text-sm text-ink-muted">Tidak ada lokasi yang cocok dengan saringan ini.</p>
      )}

      <div className="flex flex-col gap-6">
        {bands.map((band) => (
          <div key={band.family ?? "semua"} className="flex flex-col gap-3">
            {band.family && (
              <div className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b-2 pb-1.5 ${FAMILY_BORDER_CLASS[band.family]}`}>
                <h3 className={`text-base font-extrabold tracking-tight ${FAMILY_TEXT_CLASS[band.family]}`}>{FAMILY_LABEL[band.family]}</h3>
                <p className="text-xs text-ink-muted">
                  {FAMILY_DESCRIPTION[band.family]} <span className="tabular-nums">{band.rows.length} lokasi</span>
                </p>
              </div>
            )}

            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
              {band.rows.map((record) => {
                const family = record.family as Family;
                const isSelected = record.id === selectedId;
                const disagrees = record.agrees === false;
                const wettest = MONTH_LABELS_ID[record.wettestMonth] ?? "";
                return (
                  <li key={record.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(record.id)}
                      onMouseEnter={() => onHover?.(record.id)}
                      onMouseLeave={() => onHover?.(null)}
                      onFocus={() => onHover?.(record.id)}
                      onBlur={() => onHover?.(null)}
                      aria-pressed={isSelected}
                      aria-label={`${record.name}, ${FAMILY_LABEL[family]}, terbasah ${wettest}, ${Math.round(maxMm(record))} milimeter${
                        disagrees ? ", berbeda dari keluarga BMKG" : ""
                      }`}
                      className={`flex w-full flex-col gap-1.5 rounded-card border bg-stock px-2.5 pb-2 pt-2 text-left transition duration-fast hover:-translate-y-px hover:border-ink ${
                        isSelected ? "border-ink ring-1 ring-inset ring-ink" : "border-rule"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                          {disagrees ? (
                            <span
                              aria-hidden
                              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full outline outline-1 outline-ink"
                              style={{ backgroundImage: "repeating-linear-gradient(45deg, var(--color-ink) 0 1.2px, var(--color-stock) 1.2px 3px)" }}
                            />
                          ) : (
                            <span aria-hidden className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${FAMILY_BG_CLASS[family]}`} />
                          )}
                          <span className="truncate text-xs font-bold">{record.name}</span>
                        </span>
                        <span className="flex-none font-mono text-tick uppercase text-ink-muted">{wettest}</span>
                      </span>

                      <MiniCycle monthlyMm={record.monthlyMm} family={family} maxMm={maxMm(record)} wettestMonth={record.wettestMonth} />

                      <span className="font-mono text-tick tabular-nums text-ink-muted">maks {Math.round(maxMm(record))} mm</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <p className="font-mono text-xs text-ink-muted">
        Tiap sel: Januari di kiri, Desember di kanan, jadi satu bulan jatuh di tempat yang sama di semua sel. Skala mm per sel.
        Titik berarsir: berbeda dengan keluarga BMKG.
      </p>
    </section>
  );
}
