import type { Metadata } from "next";
import { archetypeRecords, manifest, regimeRecords } from "@/lib/grid/lookup";
import { AtlasView } from "@/components/AtlasView";
import { SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Peta rezim — Pola Hujan",
};

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
