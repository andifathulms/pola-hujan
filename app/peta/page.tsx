import type { Metadata } from "next";
import { PERIOD_LABEL, archetypeRecords, manifest, regimeRecords } from "@/lib/grid/lookup";
import { AtlasView } from "@/components/AtlasView";
import { SiteNav } from "@/components/SiteNav";
import { pageMetadata } from "@/lib/metadata";
import { ATLAS_LEAD } from "@/lib/pageCopy";

export const metadata: Metadata = pageMetadata({
  title: "Peta pola hujan — Pola Hujan",
  description: ATLAS_LEAD,
  path: "/peta/",
});

// The atlas (PRD.md M2, "ship publicly here"): regime map, cycle curve,
// archetype strip. This page only reads pipeline output — the fit and
// classification already happened in scripts/build-data.ts.
export default function PetaPage() {
  return (
    <>
      <SiteNav />
      <AtlasView records={regimeRecords} archetypes={archetypeRecords} manifest={manifest} periodLabel={PERIOD_LABEL} />
    </>
  );
}
