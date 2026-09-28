import type { Metadata } from "next";
import Link from "next/link";
import { PERIOD_LABEL, manifest, regimeRecords } from "@/lib/grid/lookup";
import { SiteNav } from "@/components/SiteNav";
import { YearSweep } from "@/components/story/YearSweep";
import { FamilyChapters } from "@/components/story/FamilyChapters";
import { StackedCompare } from "@/components/compare/StackedCompare";
import { CitySearch } from "@/components/shell/CitySearch";
import { toCityIndex } from "@/lib/citySearch";
import { pageMetadata } from "@/lib/metadata";
import { STORY_LEAD_META } from "@/lib/pageCopy";
import { compareCaption, storyLead } from "@/lib/storyCopy";
import { ROUTES, compareHref } from "@/lib/routes";

export const metadata: Metadata = pageMetadata({
  title: "Pola Hujan — musim hujan tidak datang serentak",
  description: STORY_LEAD_META,
  path: "/",
});

/**
 * Beranda: the story before the tool. The reader this is for has been
 * taught that Indonesia has two seasons; the page shows the year moving
 * across the map, names the three patterns, and puts Jakarta and Ambon
 * on one axis — then hands over to the atlas and the search.
 */
export default function HomePage() {
  const jakarta = regimeRecords.find((r) => r.id === "jakarta");
  const ambon = regimeRecords.find((r) => r.id === "ambon");
  const agreementPercent = Math.round(manifest.agreement.agreementRate * 100);

  return (
    <>
      <SiteNav />
      <div id="main-content" className="mx-auto flex max-w-[1280px] flex-col gap-20 px-4 pb-8 pt-8 lg:gap-24 lg:px-6 lg:pt-12">
        <YearSweep records={regimeRecords} manifest={manifest} lead={storyLead(regimeRecords)} periodLabel={PERIOD_LABEL} />

        <FamilyChapters records={regimeRecords} manifest={manifest} />

        {jakarta && ambon && (
          <section aria-labelledby="banding-judul" className="grid items-center gap-8 rounded-sheet bg-plate p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:p-10">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-muted">Satu sumbu bulan, dua kota</p>
              <h2 id="banding-judul" className="text-2xl font-extrabold leading-tight tracking-tight lg:text-3xl">
                Saat Jakarta kering, Ambon di puncak hujannya.
              </h2>
              <p className="font-story text-lg italic leading-snug">{compareCaption(jakarta, ambon)}</p>
              <p className="text-xs text-ink-muted">Garis tegak: bulan puncak tiap kota. Sumbu bulan tidak pernah digeser untuk menyamakan puncak.</p>
              <Link href={compareHref("jakarta", "ambon")} className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-stock no-underline hover:bg-ink/85">
                Bandingkan kota lain →
              </Link>
            </div>
            <div className="rounded-card bg-stock p-4">
              <StackedCompare left={jakarta} right={ambon} />
            </div>
          </section>
        )}

        <section id="cari-kota" aria-labelledby="cari-judul" className="flex scroll-mt-24 flex-col items-center gap-5 py-4 text-center">
          <h2 id="cari-judul" className="max-w-[20ch] text-balance text-2xl font-extrabold leading-tight tracking-tight lg:text-3xl">
            Bagaimana pola hujan di kotamu?
          </h2>
          <CitySearch index={toCityIndex(regimeRecords)} shortcut={false} size="lg" className="w-full max-w-[520px] text-left" />
          <p className="text-xs text-ink-muted">
            {regimeRecords.length} kota tersedia. Atau buka{" "}
            <Link href={ROUTES.atlas} className="font-semibold text-ink underline underline-offset-4">
              peta lengkap
            </Link>
            .
          </p>
        </section>

        <section aria-label="Tentang klasifikasi ini" className="grid gap-px overflow-hidden rounded-card border border-rule bg-rule sm:grid-cols-3">
          <div className="flex flex-col gap-1 bg-stock p-5">
            <span className="font-mono text-2xl font-medium tabular-nums">{agreementPercent}%</span>
            <span className="text-sm text-ink-muted">
              cocok dengan keluarga BMKG ({manifest.agreement.agreeingLocations} dari {manifest.agreement.comparedLocations}). Dilaporkan, tidak
              pernah disetel untuk naik.
            </span>
          </div>
          <div className="flex flex-col gap-1 bg-stock p-5">
            <span className="font-mono text-2xl font-medium tabular-nums">{PERIOD_LABEL}</span>
            <span className="text-sm text-ink-muted">periode normal CHIRPS 2.0 dari data satelit dan stasiun. Bukan prakiraan.</span>
          </div>
          <Link href={ROUTES.method} className="group flex flex-col gap-1 bg-stock p-5 no-underline hover:bg-plate">
            <span className="text-lg font-extrabold tracking-tight text-ink">Cara kerja →</span>
            <span className="text-sm text-ink-muted">Dua gelombang harmonik, ambang yang dikutip, dan batasan metodenya. Bisa dicoba sendiri.</span>
          </Link>
        </section>
      </div>
    </>
  );
}
