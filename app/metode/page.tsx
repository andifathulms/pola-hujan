import type { Metadata } from "next";
import { manifest, regimeRecords } from "@/lib/grid/lookup";
import { SiteNav } from "@/components/SiteNav";
import { DownloadData } from "@/components/DownloadData";

export const metadata: Metadata = {
  title: "Metode — Pola Hujan",
};

const THRESHOLD_ROWS: Array<{ label: string; key: keyof typeof manifest.thresholds; unit: string; note: string }> = [
  {
    label: "Pusat puncak monsun",
    key: "monsoonPeakCenterMonth",
    unit: "bulan (Jan = 0)",
    note: "Titik tengah jendela basah monsun Asia di sebagian besar Indonesia barat/tengah (Des–Feb).",
  },
  {
    label: "Batas jarak Monsunal",
    key: "monsunalMaxDisplacementMonths",
    unit: "bulan, jarak melingkar",
    note: "Puncak siklus tahunan-dominan dalam jarak ini dari pusat monsun diklasifikasi Monsunal.",
  },
  {
    label: "Batas jarak Lokal",
    key: "lokalMinDisplacementMonths",
    unit: "bulan, jarak melingkar",
    note: "Di atas batas ini, puncak jatuh di 'separuh tahun yang salah' — diklasifikasi Lokal.",
  },
  {
    label: "Rasio dominasi Ekuatorial",
    key: "ekuatorialDominanceRatio",
    unit: "amplitudo semi-tahunan / tahunan",
    note: "Pada dan di atas rasio ini, harmonik semi-tahunan dianggap dominan: dua puncak per tahun.",
  },
  {
    label: "Rasio Ekuatorial-4",
    key: "ekuatorial4Ratio",
    unit: "amplitudo semi-tahunan / tahunan",
    note: "Rasio yang lebih tinggi memisahkan sub-tipe empat-musim yang jelas dari yang bimodal lemah.",
  },
  {
    label: "Rasio sub-tipe sekunder",
    key: "secondaryHarmonicSubtypeRatio",
    unit: "amplitudo sekunder / dominan",
    note: "Harmonik sekunder yang cukup besar memberi sub-tipe '-2' alih-alih '-1' yang bersih.",
  },
];

// M4: dataset, thresholds, agreement rate, and the limitations —
// everything PRD.md §4 requires stated, gathered onto one page in
// addition to the map's own one-line disclaimer (CLAUDE.md invariant 6).
export default function MetodePage() {
  const byFamily = Object.entries(manifest.coverage.byFamily);
  const bySubtype = Object.entries(manifest.coverage.bySubtype).sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      <SiteNav />
      <div id="main-content" className="flex flex-col gap-8 p-4 lg:p-6">
        <header className="flex flex-col gap-1">
          <h1 className="font-display text-xl font-semibold lg:text-2xl">Metode</h1>
          <p className="text-ink/70">Bagaimana klasifikasi ini dibuat, dan apa yang tidak bisa ia klaim.</p>
        </header>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-semibold">Yang harus dinyatakan</h2>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-sm">
            <li>
              <strong>Ini adalah klasifikasi turunan, bukan Zona Musim resmi BMKG.</strong> Zona BMKG berasal dari
              jaringan stasiun dan penilaian ahli, bukan dari pencocokan harmonik pada grid satelit.
            </li>
            <li>
              <strong>Peta ini menunjukkan rezim, bukan batas zona.</strong> Tidak ada batas ZOM yang digambar di
              sini yang tidak diturunkan langsung dari klasifikasi.
            </li>
            <li>
              <strong>Ini adalah klimatologi, bukan prakiraan.</strong> BMKG menerbitkan prakiraan awal musim
              setiap tahun; halaman ini menunjukkan normal jangka panjang. Tidak ada tanggal awal musim yang
              disajikan sebagai prakiraan di mana pun di situs ini.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-semibold">Dataset</h2>
          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 font-mono text-xs">
            <dt className="text-ink/70">Nama</dt>
            <dd>{manifest.datasetName}</dd>
            <dt className="text-ink/70">Periode</dt>
            <dd>{manifest.climatologyPeriod}</dd>
            <dt className="text-ink/70">Jumlah lokasi</dt>
            <dd>{manifest.generatedFromLocations}</dd>
          </dl>
          <p className="border border-rule bg-stock p-3 text-xs text-ink/70">{manifest.datasetStatus}</p>
          <DownloadData records={regimeRecords} />
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-semibold">Cakupan</h2>
          <ul className="flex flex-col gap-1 font-mono text-xs">
            {byFamily.map(([family, count]) => (
              <li key={family}>
                {family}: {count} lokasi
              </li>
            ))}
          </ul>
          <p className="text-sm text-ink/70">
            Tiap keluarga bukan satu bentuk tunggal — sub-tipe di bawah ini, mengikuti nomenklatur BMKG sendiri,
            adalah pemecahan berdasarkan seberapa kuat harmonik sekunder atau seberapa dominan pola dua-puncaknya.
          </p>
          <ul className="flex flex-col gap-1 font-mono text-xs">
            {bySubtype.map(([subtype, count]) => (
              <li key={subtype}>
                {subtype}: {count} lokasi
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-semibold">Ambang klasifikasi</h2>
          <p className="text-sm text-ink/70">
            Konstanta bernama, dikutip, satu tempat: <code className="font-mono">lib/harmonic/thresholds.ts</code>.
            Mengubah salah satu mengubah peta, jadi setiap nilai adalah keputusan yang didokumentasikan, bukan
            angka ajaib.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-rule text-left">
                  <th className="py-1 pr-4 font-medium">Ambang</th>
                  <th className="py-1 pr-4 font-medium">Nilai</th>
                  <th className="py-1 pr-4 font-medium">Satuan</th>
                  <th className="py-1 font-medium">Catatan</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {THRESHOLD_ROWS.map((row) => (
                  <tr key={row.key} className="border-b border-rule align-top">
                    <td className="py-2 pr-4">{row.label}</td>
                    <td className="py-2 pr-4 tabular-nums">{manifest.thresholds[row.key]}</td>
                    <td className="py-2 pr-4">{row.unit}</td>
                    <td className="py-2 font-sans text-ink/70">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-ink/70">
            Struktur tiga keluarga mengikuti Aldrian, E. &amp; Susanto, R. D. (2003), &ldquo;Identification of three
            dominant rainfall regions within Indonesia and their relationship to sea surface temperature&rdquo;, Int. J.
            Climatol. 23 — dasar yang sama untuk keluarga Monsunal/Ekuatorial/Lokal milik BMKG. Titik potong rasio
            dan pergeseran fase di atas adalah kalibrasi proyek ini sendiri untuk pencocokan harmonik, divalidasi
            hanya oleh tingkat kecocokan yang dilaporkan di bawah — tidak pernah disetel untuk menaikkannya.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-semibold">Kecocokan dengan BMKG</h2>
          <p className="text-sm">
            <span className="font-mono tabular-nums">
              {manifest.agreement.agreeingLocations}/{manifest.agreement.comparedLocations}
            </span>{" "}
            lokasi ({Math.round(manifest.agreement.agreementRate * 100)}%) memiliki keluarga turunan yang sama
            dengan keluarga BMKG pembanding untuk lokasi tersebut —{" "}
            <span className="font-mono tabular-nums">{manifest.agreement.verifiedComparisons}</span> dari{" "}
            {manifest.agreement.comparedLocations} pembanding itu dikutip langsung dari{" "}
            <em>Pemutakhiran Zona Musim Indonesia Periode 1991-2020</em> (BMKG, 2022), sisanya masih perkiraan
            terbaik yang belum diverifikasi (lihat <code className="font-mono">data/source/README.md</code> untuk
            kutipan lengkap per lokasi).
          </p>
          <p className="text-xs text-ink/70">
            <strong>Ini adalah metrik yang dilaporkan, bukan uji lulus/gagal.</strong> Bahkan untuk pembanding yang
            terverifikasi, lokasi turunan bisa sah berbeda dari peta BMKG — Medan, misalnya, keluarga BMKG-nya
            terverifikasi Ekuatorial, tetapi klasifikasi turunan di titik koordinat kota itu jatuh sebagai Lokal.
            Palu serupa: BMKG menyebutnya eksplisit sebagai contoh wilayah Lokal, tetapi titik kota Palu sendiri
            jatuh sebagai Monsunal turunan — kemungkinan karena efek lembah bayangan hujan Palu yang sangat
            lokal tidak sepenuhnya tertangkap satu titik grid 0,05°. Keduanya bukan bug yang perlu diperbaiki;
            itu perbedaan nyata antara metode. Memaksakan kecocokan — baik
            dengan menyetel ambang maupun menyetel label pembanding — berarti berhenti menganalisis. Lokasi yang
            berbeda ditandai arsir di peta, bukan warna keempat.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-semibold">Yang tidak dilakukan aplikasi ini</h2>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-ink/70">
            <li>Tidak ada prakiraan, tidak ada prediksi awal musim, tidak ada prospek musiman.</li>
            <li>Tidak ada reproduksi batas ZOM kecuali data terbukti dapat didistribusikan ulang.</li>
            <li>Tidak ada saran pertanian — hanya klimatologi apa adanya.</li>
            <li>Tidak ada animasi medan angin (lihat PRD.md §2 untuk alasannya).</li>
            <li>Tidak ada akun, tidak ada server, tidak ada jaringan saat runtime.</li>
            <li>Tidak ada machine learning — klasifikasinya adalah pencocokan harmonik dengan ambang yang dinyatakan, sepenuhnya dapat diperiksa.</li>
          </ul>
        </section>

        <p className="border-t border-rule pt-4 font-mono text-xs text-ink/70">
          {regimeRecords.length} lokasi dalam build ini. Lihat kode sumber untuk metode lengkap.
        </p>
      </div>
    </>
  );
}
