"use client";

import { useEffect, useRef, useState } from "react";
import type { RegimeRecord } from "@/lib/grid/schema";
import { FAMILY_LABEL, FAMILY_TEXT_CLASS, type Family } from "@/lib/family";
import { CycleCurve } from "@/components/curve/CycleCurve";
import { CycleTable } from "@/components/table/CycleTable";

export interface CompareViewProps {
  records: RegimeRecord[];
  defaultLeftId: string;
  defaultRightId: string;
}

function LocationPicker({
  records,
  value,
  onChange,
  label,
}: {
  records: RegimeRecord[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-ink/70">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-rule bg-stock px-2 py-1 text-sm"
      >
        {records.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function CompareSide({ record }: { record: RegimeRecord }) {
  const family = record.family as Family;
  return (
    <div className="flex flex-col gap-2">
      <div>
        <h3 className="font-display text-lg font-semibold">{record.name}</h3>
        <p className={`text-sm font-medium ${FAMILY_TEXT_CLASS[family]}`}>
          {FAMILY_LABEL[family]} · {record.subtype}
        </p>
      </div>
      <CycleCurve
        monthlyMm={record.monthlyMm}
        annualCurveMm={record.annualCurveMm}
        semiAnnualCurveMm={record.semiAnnualCurveMm}
        meanMm={record.fit.meanMm}
        family={family}
      />
      <CycleTable monthlyMm={record.monthlyMm} caption={`Curah hujan bulanan di ${record.name}, mm`} />
    </div>
  );
}

/**
 * Two places, side by side, curves aligned on the same fixed Jan-Dec
 * axis (PRD.md §6.4, DESIGN.md §6). Both curves draw simultaneously —
 * that simultaneity is the demonstration, so this deliberately does not
 * stagger the two CycleCurve mounts against each other.
 */
export function CompareView({ records, defaultLeftId, defaultRightId }: CompareViewProps) {
  const [leftId, setLeftId] = useState(defaultLeftId);
  const [rightId, setRightId] = useState(defaultRightId);

  // Same URL-sync approach as AtlasView: read ?kiri=&kanan= on mount,
  // keep them in sync afterwards, so a comparison can be shared as a
  // link (M6 "sharing" — see the note in components/AtlasView.tsx).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const kiri = params.get("kiri");
    const kanan = params.get("kanan");
    if (kiri && records.some((r) => r.id === kiri)) setLeftId(kiri);
    if (kanan && records.some((r) => r.id === kanan)) setRightId(kanan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("kiri", leftId);
    url.searchParams.set("kanan", rightId);
    window.history.replaceState(null, "", url);
  }, [leftId, rightId]);

  const left = records.find((r) => r.id === leftId) ?? records[0];
  const right = records.find((r) => r.id === rightId) ?? records[1] ?? records[0];

  // Announces which two places are now being compared to screen
  // readers when either picker (or the preset button) changes — not on
  // first mount, where it'd duplicate the visible panel content.
  const isFirstSelection = useRef(true);
  const [announcement, setAnnouncement] = useState("");
  useEffect(() => {
    if (isFirstSelection.current) {
      isFirstSelection.current = false;
      return;
    }
    if (!left || !right) return;
    setAnnouncement(
      `Membandingkan ${left.name} (${FAMILY_LABEL[left.family as Family]}) dengan ${right.name} (${FAMILY_LABEL[right.family as Family]}).`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftId, rightId]);

  if (!left || !right) {
    return <p className="p-6">Tidak ada data lokasi.</p>;
  }

  return (
    <div id="main-content" className="flex flex-col gap-6 p-4 lg:p-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-xl font-semibold lg:text-2xl">Banding dua tempat</h1>
        <p className="max-w-prose text-lg">
          Bandingkan dua kota berdampingan pada sumbu bulan yang sama, supaya perbedaan pola hujannya terlihat
          langsung.
        </p>
        <p className="text-sm text-ink/70">
          Sumbu bulan tidak pernah digeser untuk menyelaraskan puncak — perbedaan letak puncak adalah temuannya.
        </p>
      </header>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="flex flex-wrap items-end gap-4">
        <LocationPicker records={records} value={leftId} onChange={setLeftId} label="Tempat pertama" />
        <LocationPicker records={records} value={rightId} onChange={setRightId} label="Tempat kedua" />
        <button
          type="button"
          onClick={() => {
            setLeftId(defaultLeftId);
            setRightId(defaultRightId);
          }}
          className="rounded border border-ink px-3 py-1 text-sm font-medium transition-colors duration-fast hover:bg-ink hover:text-stock"
        >
          Jawa vs Maluku
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <CompareSide record={left} />
        <CompareSide record={right} />
      </div>
    </div>
  );
}
