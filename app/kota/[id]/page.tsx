import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PERIOD_LABEL, archetypeRecords, manifest, mosaic, regimeRecords } from "@/lib/grid/lookup";
import { FAMILY_LABEL, type Family } from "@/lib/family";
import { SiteNav } from "@/components/SiteNav";
import { CycleCurve } from "@/components/curve/CycleCurve";
import { CycleTable } from "@/components/table/CycleTable";
import { ArchetypeStrip } from "@/components/archetypes/ArchetypeStrip";
import { CityStats, FamilyBadges, SimilarPlaces, WhyThisFamily } from "@/components/atlas/CityReading";
import { CityLocator } from "@/components/city/CityLocator";
import { pageMetadata } from "@/lib/metadata";
import { cityLead, referenceCityId } from "@/lib/storyCopy";
import { ROUTES, atlasHref, cityHref, compareHref, explainerHref } from "@/lib/routes";

// Static export: exactly one page per location in the build, nothing else.
export const dynamicParams = false;

export function generateStaticParams() {
  return regimeRecords.map((r) => ({ id: r.id }));
}

function recordFor(id: string) {
  return regimeRecords.find((r) => r.id === id);
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const record = recordFor(params.id);
  if (!record) return {};
  const lead = cityLead(record, recordFor(referenceCityId(record.id)));
  return pageMetadata({
    title: `Pola hujan ${record.name} — ${FAMILY_LABEL[record.family as Family]} · Pola Hujan`,
    description: `${lead} Normal CHIRPS ${PERIOD_LABEL}, klasifikasi turunan — bukan Zona Musim resmi BMKG.`,
    path: `/kota/${record.id}/`,
  });
}

/**
 * One page per city: shareable, and findable by a search for "pola hujan
 * <kota>". Carries the field plate (DESIGN.md §4.1) — the one full-width,
 * mounted rendering of a curve — plus the same reading the atlas card
 * shows. Every figure is pipeline output.
 */
export default function CityPage({ params }: { params: { id: string } }) {
  const record = recordFor(params.id);
  if (!record) notFound();
  const family = record.family as Family;
  const reference = recordFor(referenceCityId(record.id));
  const byId = new Map(regimeRecords.map((r) => [r.id, r]));

  return (
    <>
      <SiteNav />
      <article id="main-content" aria-labelledby="kota-nama" className="mx-auto flex max-w-[1100px] flex-col gap-8 px-4 pb-8 pt-6 lg:px-6 lg:pt-10">
        <nav aria-label="Remah roti" className="text-xs text-ink-muted">
          <Link href={ROUTES.atlas} className="font-semibold text-ink no-underline hover:underline">
            ← Peta
          </Link>{" "}
          / {record.province}
        </nav>

        <header className="grid items-end gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-muted">{record.province}</p>
            <h1 id="kota-nama" className="text-[44px] font-extrabold leading-[0.95] tracking-[-0.035em] lg:text-4xl">
              {record.name}
            </h1>
            <FamilyBadges record={record} />
            <p className="max-w-[46ch] font-story text-lg italic leading-snug lg:text-[22px]">{cityLead(record, reference)}</p>
          </div>
          <CityLocator records={regimeRecords} selectedId={record.id} mosaic={mosaic.rows > 0 ? mosaic : undefined} />
        </header>

        {/* The field plate — DESIGN.md §4.1. One per page. */}
        <section aria-label={`Kurva hujan bulanan ${record.name}`} className="flex flex-col gap-4 rounded-sheet border border-stitch bg-plate p-4 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stitch pb-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">Bacaan lapangan · normal {PERIOD_LABEL}</p>
            <p className="font-mono text-xs uppercase tracking-wide text-ink-muted">
              {FAMILY_LABEL[family]} · {record.subtype}
            </p>
          </div>
          <div className="mx-auto w-full max-w-[880px]">
            <CycleCurve
              monthlyMm={record.monthlyMm}
              annualCurveMm={record.annualCurveMm}
              semiAnnualCurveMm={record.semiAnnualCurveMm}
              meanMm={record.fit.meanMm}
              family={family}
              size="plate"
            />
          </div>
          <div className="overflow-x-auto">
            <CycleTable monthlyMm={record.monthlyMm} caption={`Curah hujan bulanan normal di ${record.name}, mm`} />
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <CityStats record={record} manifest={manifest} />
            <p className="text-xs text-ink-muted">
              Bulan basah dan kering memakai kriteria Mohr (&gt; {manifest.monthCriteria.wetMonthMinMm} mm, &lt;{" "}
              {manifest.monthCriteria.dryMonthMaxMm} mm) seperti Schmidt–Ferguson, tetapi dihitung dari tahun normal, bukan per tahun — jadi
              bukan nilai Q Schmidt–Ferguson.
            </p>
            <SimilarPlaces record={record} lookup={(id) => byId.get(id)} hrefFor={cityHref} />
          </div>
          <WhyThisFamily record={record} manifest={manifest} />
        </div>

        <div className="flex flex-wrap gap-2">
          {reference && (
            <Link
              href={compareHref(record.id, reference.id)}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-stock no-underline hover:bg-ink/85"
            >
              Bandingkan dengan {reference.name} →
            </Link>
          )}
          <Link href={atlasHref(record.id)} className="inline-flex items-center gap-2 rounded-full border border-stitch px-5 py-3 text-sm font-bold text-ink no-underline hover:border-ink">
            Lihat di peta
          </Link>
          <Link href={explainerHref(record.id)} className="inline-flex items-center gap-2 rounded-full border border-stitch px-5 py-3 text-sm font-bold text-ink no-underline hover:border-ink">
            Ubah gelombangnya sendiri
          </Link>
        </div>

        <ArchetypeStrip archetypes={archetypeRecords} activeFamily={family} />

        <p className="rounded-card bg-plate p-4 text-xs text-ink-muted">
          <strong className="font-semibold text-ink">Klasifikasi turunan dari data presipitasi grid terbuka, bukan Zona Musim resmi BMKG.</strong> Angka di
          halaman ini adalah normal {PERIOD_LABEL} di titik koordinat kota, bukan prakiraan. Untuk prakiraan awal musim di {record.name}, rujuk{" "}
          <a href="https://www.bmkg.go.id/iklim/" target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline underline-offset-2">
            BMKG
          </a>
          .
        </p>
      </article>
    </>
  );
}
