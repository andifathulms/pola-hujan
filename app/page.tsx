import { archetypeRecords, manifest, regimeRecords } from "@/lib/grid/lookup";
import { AtlasView } from "@/components/AtlasView";
import { SiteNav } from "@/components/SiteNav";

// The atlas is the home page directly — no redirect. An earlier version
// redirected "/" to "/peta/" client-side (useEffect + window.location),
// with a plain fallback link for anyone/anything that didn't run the
// JS. That fallback is exactly what a screenshot tool, a crawler, or a
// no-JS visitor would get stuck on instead of the real atlas — a
// needless failure mode on a static site that has no server-side
// redirect option anyway. Rendering the same content at both "/" and
// "/peta/" (PRD.md M2, "ship publicly here") avoids the whole class of
// problem.
export default function HomePage() {
  return (
    <>
      <SiteNav />
      <AtlasView records={regimeRecords} archetypes={archetypeRecords} manifest={manifest} />
    </>
  );
}
