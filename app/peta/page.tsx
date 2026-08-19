import type { Metadata } from "next";
import { archetypeRecords, manifest, regimeRecords } from "@/lib/grid/lookup";
import { AtlasView } from "@/components/AtlasView";
import { SiteNav } from "@/components/SiteNav";
import { pageMetadata } from "@/lib/metadata";
import { ATLAS_LEAD } from "@/lib/pageCopy";

// Renders byte-identical content to "/" (see app/page.tsx) — canonical
// points there instead of here, so the two URLs don't compete as
// separate pages for the same content.
export const metadata: Metadata = pageMetadata({
  title: "Peta rezim — Pola Hujan",
  description: ATLAS_LEAD,
  path: "/peta/",
  canonicalPath: "/",
});

// The atlas (PRD.md M2, "ship publicly here"): regime map, cycle curve,
// archetype strip. This page only reads pipeline output — the fit and
// classification already happened in scripts/build-data.ts.
export default function PetaPage() {
  return (
    <>
      <SiteNav />
      <AtlasView records={regimeRecords} archetypes={archetypeRecords} manifest={manifest} />
    </>
  );
}
