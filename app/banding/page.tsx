import type { Metadata } from "next";
import { regimeRecords } from "@/lib/grid/lookup";
import { CompareView } from "@/components/compare/CompareView";
import { SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Banding — Pola Hujan",
};

// M3: two-place comparison, with Jakarta-vs-Ambon as the one-tap preset
// demonstrating the Java/Lokal inversion PRD.md §6.4 calls the
// demonstration.
export default function BandingPage() {
  const hasJakarta = regimeRecords.some((r) => r.id === "jakarta");
  const hasAmbon = regimeRecords.some((r) => r.id === "ambon");
  const defaultLeftId = hasJakarta ? "jakarta" : (regimeRecords[0]?.id ?? "");
  const defaultRightId = hasAmbon ? "ambon" : (regimeRecords[1]?.id ?? regimeRecords[0]?.id ?? "");

  return (
    <>
      <SiteNav />
      <CompareView records={regimeRecords} defaultLeftId={defaultLeftId} defaultRightId={defaultRightId} />
    </>
  );
}
