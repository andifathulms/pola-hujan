import Link from "next/link";
import type { Manifest, RegimeRecord } from "@/lib/grid/schema";
import {
  FAMILY_BG_CLASS,
  FAMILY_LABEL,
  FAMILY_TEXT_CLASS,
  MONTH_LABELS_ID,
  formatDecimal,
  formatMm,
  subtypeFillClass,
  type Family,
} from "@/lib/family";
import { classificationReason } from "@/lib/classificationCopy";
import { ThresholdGauge } from "@/components/ThresholdGauge";

/** Circular distance in months is always in [0, 6]; this is the quantity's own range, not a threshold. */
const DISPLACEMENT_GAUGE_MAX_MONTHS = 6;

/** The hatch swatch that stands for "differs from BMKG" wherever it appears as text. */
export function HatchSwatch({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block flex-none rounded-[2px] outline outline-1 outline-ink ${className}`}
      style={{ backgroundImage: "repeating-linear-gradient(45deg, var(--color-ink) 0 1.3px, var(--color-stock) 1.3px 3.4px)" }}
    />
  );
}

/** Family (hue) and sub-type (tint) as a label, plus the BMKG comparison. Text, so colour is never the only channel. */
export function FamilyBadges({ record }: { record: RegimeRecord }) {
  const family = record.family as Family;
  const disagrees = record.agrees === false;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-2 rounded-full border border-rule bg-stock px-3 py-1 text-xs font-bold">
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <circle cx="6" cy="6" r="5" className={`${subtypeFillClass(family, record.subtype)} stroke-current ${FAMILY_TEXT_CLASS[family]}`} strokeWidth="1.4" />
        </svg>
        <span className={FAMILY_TEXT_CLASS[family]}>{FAMILY_LABEL[family]}</span>
        <span className="font-mono font-normal text-ink-muted">{record.subtype}</span>
      </span>
      {record.bmkgFamily && (
        <span className="inline-flex items-center gap-2 rounded-full border border-rule bg-stock px-3 py-1 text-xs font-semibold">
          {disagrees && <HatchSwatch className="h-2.5 w-2.5" />}
          BMKG {record.bmkgFamilySource === "bmkg-zom9120" ? "(terverifikasi ZOM9120)" : "(perkiraan)"}:{" "}
          {FAMILY_LABEL[record.bmkgFamily as Family]}
          <span className="font-normal text-ink-muted">· {disagrees ? "berbeda" : "cocok"}</span>
        </span>
      )}
    </div>
  );
}

/** Four numbers of the normal year, all emitted by the pipeline. */
export function CityStats({ record, manifest }: { record: RegimeRecord; manifest: Manifest }) {
  const stats = [
    { label: "Total tahunan", value: formatMm(record.annualTotalMm), unit: "mm" },
    { label: "Terbasah", value: MONTH_LABELS_ID[record.wettestMonth] ?? "", unit: `${formatMm(record.monthlyMm[record.wettestMonth] ?? 0)} mm` },
    { label: "Terkering", value: MONTH_LABELS_ID[record.driestMonth] ?? "", unit: `${formatMm(record.monthlyMm[record.driestMonth] ?? 0)} mm` },
    {
      label: `Bulan basah (> ${manifest.monthCriteria.wetMonthMinMm} mm)`,
      value: String(record.wetMonths),
      unit: `/ 12 · kering ${record.dryMonths}`,
    },
  ];
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-rule bg-rule">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col gap-1 bg-stock px-3 py-2.5">
          <dt className="text-xs leading-tight text-ink-muted">{s.label}</dt>
          <dd className="flex items-baseline gap-1.5 font-mono text-lg font-medium leading-none tabular-nums">
            {s.value} <span className="whitespace-nowrap text-xs font-normal text-ink-muted">{s.unit}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Why this family: a sentence first, then the two decisive quantities as
 * positions against their thresholds, then the exact figures in text.
 * Proximity to a threshold is fragility (DESIGN-REWORK.md §2.2), shown
 * as position — never as a colour for confidence (invariant 10).
 */
export function WhyThisFamily({ record, manifest }: { record: RegimeRecord; manifest: Manifest }) {
  const family = record.family as Family;
  const detail = record.classificationDetail;
  const t = manifest.thresholds;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm">
        <strong className="font-bold">Mengapa {FAMILY_LABEL[family]}?</strong> {classificationReason(family, detail, t)}
      </p>
      <div className="flex flex-col gap-3">
        {detail.semiToAnnualRatio !== null && (
          <ThresholdGauge
            label="Kekuatan puncak kedua (rasio semi-tahunan / tahunan)"
            valueText={formatDecimal(detail.semiToAnnualRatio, 2)}
            thresholdText={`ambang Ekuatorial ${formatDecimal(t.ekuatorialDominanceRatio, 2)}`}
            value={detail.semiToAnnualRatio}
            threshold={t.ekuatorialDominanceRatio}
            domainMin={0}
            domainMax={Math.max(t.ekuatorialDominanceRatio * 2, detail.semiToAnnualRatio * 1.2)}
            family={family}
          />
        )}
        {detail.displacementMonths !== undefined && (
          <ThresholdGauge
            label="Jarak puncak dari pusat monsun Asia"
            valueText={`${formatDecimal(detail.displacementMonths)} bulan`}
            thresholdText={`ambang Lokal > ${t.lokalMinDisplacementMonths} bulan`}
            value={detail.displacementMonths}
            threshold={t.lokalMinDisplacementMonths}
            domainMin={0}
            domainMax={DISPLACEMENT_GAUGE_MAX_MONTHS}
            family={family}
          />
        )}
      </div>
      <details className="text-xs text-ink-muted">
        <summary className="cursor-pointer select-none font-semibold text-ink">Angka pastinya</summary>
        <dl className="mt-2 flex flex-col gap-1 font-mono">
          <div>
            <dt className="inline">Rasio semi-tahunan/tahunan: </dt>
            <dd className="inline tabular-nums">
              {detail.semiToAnnualRatio === null ? "tak terhingga (amplitudo tahunan nol)" : detail.semiToAnnualRatio.toFixed(3)}
            </dd>
            <dd className="inline"> — ambang Ekuatorial {t.ekuatorialDominanceRatio.toFixed(2)}</dd>
          </div>
          {detail.displacementMonths !== undefined && (
            <div>
              <dt className="inline">Jarak puncak dari pusat monsun: </dt>
              <dd className="inline tabular-nums">{detail.displacementMonths.toFixed(3)} bulan</dd>
              <dd className="inline">
                {" "}
                — ambang Monsunal ≤{t.monsunalMaxDisplacementMonths}, Lokal &gt;{t.lokalMinDisplacementMonths}
              </dd>
            </div>
          )}
          <div>
            <dt className="inline">Amplitudo tahunan / semi-tahunan: </dt>
            <dd className="inline tabular-nums">
              {record.fit.annualAmpMm.toFixed(1)} / {record.fit.semiAnnualAmpMm.toFixed(1)} mm
            </dd>
          </div>
        </dl>
      </details>
    </div>
  );
}

/** "Pola serupa" — shape-similar places, from the pipeline. Buttons when a handler is given, links otherwise. */
export function SimilarPlaces({
  record,
  lookup,
  onSelect,
  hrefFor,
}: {
  record: RegimeRecord;
  lookup: (id: string) => RegimeRecord | undefined;
  onSelect?: (id: string) => void;
  hrefFor?: (id: string) => string;
}) {
  const similar = record.similarIds.map(lookup).filter((r): r is RegimeRecord => r !== undefined);
  if (similar.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-ink-muted">
        <strong className="font-semibold text-ink">Pola serupa</strong> — bentuk tahunan paling mirip, bukan zona yang sama
      </p>
      <div className="flex flex-wrap gap-1.5">
        {similar.map((s) => {
          const inner = (
            <>
              <span aria-hidden className={`h-2 w-2 rounded-full ${FAMILY_BG_CLASS[s.family as Family]}`} />
              {s.name}
            </>
          );
          const cls =
            "inline-flex items-center gap-1.5 rounded-full border border-rule bg-stock px-3 py-1 text-xs font-semibold text-ink no-underline transition-colors duration-fast hover:border-ink";
          return onSelect ? (
            <button key={s.id} type="button" onClick={() => onSelect(s.id)} className={cls}>
              {inner}
            </button>
          ) : (
            <Link key={s.id} href={hrefFor ? hrefFor(s.id) : "#"} className={cls}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
