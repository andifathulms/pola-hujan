"use client";

import { useState } from "react";
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
    <label className="flex flex-col gap-1 text-xs">
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

  const left = records.find((r) => r.id === leftId) ?? records[0];
  const right = records.find((r) => r.id === rightId) ?? records[1] ?? records[0];

  if (!left || !right) {
    return <p className="p-6">Tidak ada data lokasi.</p>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-xl font-semibold lg:text-2xl">Banding dua tempat</h1>
        <p className="text-ink/70">
          Sumbu bulan yang sama, tidak pernah digeser untuk menyelaraskan puncak — perbedaan letak puncak adalah
          temuannya.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-4">
        <LocationPicker records={records} value={leftId} onChange={setLeftId} label="Tempat pertama" />
        <LocationPicker records={records} value={rightId} onChange={setRightId} label="Tempat kedua" />
        <button
          type="button"
          onClick={() => {
            setLeftId(defaultLeftId);
            setRightId(defaultRightId);
          }}
          className="rounded border border-ink px-3 py-1 text-xs font-medium transition-colors duration-fast hover:bg-ink hover:text-stock"
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
