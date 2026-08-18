import type { Metadata } from "next";
import { regimeRecords } from "@/lib/grid/lookup";
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
      <div id="main-content" className="flex flex-col gap-6 p-4 lg:p-6">
        <header className="flex flex-col gap-2">
          <h1 className="font-display text-xl font-semibold lg:text-2xl">Bagaimana klasifikasi bekerja</h1>
          <p className="max-w-prose text-lg">
            Klasifikasi ini bukan kotak hitam — inilah aturan yang sama yang memproses data asli, dan kamu bisa
            mencobanya sendiri.
          </p>
          <p className="text-sm text-ink/70">
            Sebuah <strong>harmonik</strong> di sini adalah gelombang naik-turun yang dicocokkan ke data curah
            hujan — <strong>amplitudo</strong>-nya seberapa tinggi gelombang itu, <strong>bulan puncak</strong>-nya
            kapan gelombang itu berada di titik tertinggi. Setiap siklus tahunan adalah dua gelombang begini
            dijumlahkan: satu yang naik-turun sekali setahun, satu lagi dua kali setahun.
          </p>
          <p className="text-sm text-ink/70">
            Tarik amplitudo dan bulan puncak harmonik tahunan dan semi-tahunan, dan lihat siklus sintetis berubah
            keluarga — monsunal, ekuatorial, atau lokal — secara langsung.
          </p>
        </header>
        <HarmonicExplainer records={regimeRecords} />
      </div>
    </>
  );
}
