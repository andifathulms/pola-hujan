import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { HarmonicExplainer } from "@/components/harmonic/HarmonicExplainer";

export const metadata: Metadata = {
  title: "Harmonik — Pola Hujan",
};

// M5: the live decomposition explainer (PRD.md §6.7).
export default function HarmonikPage() {
  return (
    <>
      <SiteNav />
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <header className="flex flex-col gap-1">
          <h1 className="font-display text-xl font-semibold lg:text-2xl">Bagaimana klasifikasi bekerja</h1>
          <p className="text-ink/70">
            Tarik amplitudo dan bulan puncak harmonik tahunan dan semi-tahunan, dan lihat siklus sintetis berubah
            keluarga — monsunal, ekuatorial, atau lokal — secara langsung.
          </p>
        </header>
        <HarmonicExplainer />
      </div>
    </>
  );
}
