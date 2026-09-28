import type { Metadata } from "next";
import { manifest, regimeRecords } from "@/lib/grid/lookup";
import { SiteNav } from "@/components/SiteNav";
import { DownloadData } from "@/components/DownloadData";
import { CoverageProportionBar } from "@/components/CoverageProportionBar";
import { ClassificationSpaceDiagram } from "@/components/ClassificationSpaceDiagram";
import { HarmonicExplainer } from "@/components/harmonic/HarmonicExplainer";
import { pageMetadata } from "@/lib/metadata";
import { CARA_KERJA_LEAD } from "@/lib/pageCopy";

export const metadata: Metadata = pageMetadata({
  title: "Cara kerja — Pola Hujan",
  description: CARA_KERJA_LEAD,
  path: "/cara-kerja/",
});

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

const CHAPTERS = [
  { id: "interaktif", label: "Coba sendiri" },
  { id: "pernyataan", label: "Yang harus dinyatakan" },
  { id: "data", label: "Data" },
  { id: "cakupan", label: "Cakupan" },
  { id: "ambang", label: "Ambang" },
  { id: "bmkg", label: "Kecocokan BMKG" },
  { id: "batasan", label: "Batasan" },
];

/**
 * "Cara kerja" — the old /harmonik (M5, the live decomposition
 * explainer) and /metode (M4, dataset, thresholds, agreement rate,
 * limitations) as one page, because both answered the same question.
 * The explainer comes first: a reader who has moved the two harmonics
 * reads the threshold table as a description of what they just did.
 */
export default function CaraKerjaPage() {
  const byFamily = Object.entries(manifest.coverage.byFamily);
  const bySubtype = Object.entries(manifest.coverage.bySubtype).sort(([a], [b]) => a.localeCompare(b));
  // Trimmed server-side so unused fields never cross into the client bundle.
  const harmonicSeeds = regimeRecords.map(({ id, name, family, fit }) => ({ id, name, family, fit }));
  const downloadRecords = regimeRecords.map(({ annualCurveMm, semiAnnualCurveMm, ...rest }) => rest);

  return (
    <>
      <SiteNav />
      <div id="main-content" className="mx-auto flex max-w-[1100px] flex-col gap-10 px-4 pb-8 pt-10 lg:px-6 lg:pt-14">
        <header className="flex flex-col gap-4">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-muted">Cara kerja</p>
          <h1 className="max-w-[18ch] text-balance text-2xl font-extrabold leading-[1.05] tracking-tight lg:text-3xl">
            Dua gelombang, tiga pola, satu aturan yang bisa diperiksa.
          </h1>
          <p className="max-w-[58ch] font-story text-lg italic leading-snug">{CARA_KERJA_LEAD}</p>
          <nav aria-label="Bab halaman ini" className="flex flex-wrap gap-2 pt-2">
            {CHAPTERS.map((c) => (
              <a key={c.id} href={`#${c.id}`} className="rounded-full border border-rule px-3 py-1.5 text-xs font-semibold text-ink no-underline hover:border-ink">
                {c.label}
              </a>
            ))}
          </nav>
        </header>

        <section id="interaktif" className="flex scroll-mt-24 flex-col gap-4 rounded-sheet bg-plate p-5 sm:p-8">
          <h2 className="text-xl font-extrabold tracking-tight">Coba sendiri</h2>
          <p className="max-w-[68ch] text-sm text-ink-muted">
            Sebuah <strong className="text-ink">harmonik</strong> di sini adalah gelombang naik-turun yang dicocokkan ke
            data curah hujan. <strong className="text-ink">Amplitudo</strong>-nya seberapa tinggi gelombang itu,{" "}
            <strong className="text-ink">bulan puncak</strong>-nya kapan gelombang itu di titik tertinggi. Setiap siklus
            tahunan adalah dua gelombang yang dijumlahkan: satu naik-turun sekali setahun, satu lagi dua kali setahun.
            Geser keduanya dan lihat keluarganya berubah secara langsung.
          </p>
          <HarmonicExplainer records={harmonicSeeds} />
        </section>

        <section id="pernyataan" className="flex scroll-mt-24 flex-col gap-3 border-t border-rule pt-10">
          <h2 className="text-xl font-extrabold tracking-tight">Yang harus dinyatakan</h2>
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

        <section id="data" className="flex scroll-mt-24 flex-col gap-3 border-t border-rule pt-10">
          <h2 className="text-xl font-extrabold tracking-tight">Dataset</h2>
          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 font-mono text-xs">
            <dt className="text-ink-muted">Nama</dt>
            <dd>{manifest.datasetName}</dd>
            <dt className="text-ink-muted">Periode</dt>
            <dd>{manifest.climatologyPeriod}</dd>
            <dt className="text-ink-muted">Jumlah lokasi</dt>
            <dd>{manifest.generatedFromLocations}</dd>
          </dl>
          <p className="rounded-card bg-plate p-4 text-xs text-ink-muted">{manifest.datasetStatus}</p>
          <DownloadData records={downloadRecords} />
        </section>

        <section id="cakupan" className="flex scroll-mt-24 flex-col gap-3 border-t border-rule pt-10">
          <h2 className="text-xl font-extrabold tracking-tight">Cakupan</h2>
          <CoverageProportionBar byFamily={manifest.coverage.byFamily} total={manifest.coverage.totalLocations} />
          <ul className="flex flex-col gap-1 font-mono text-xs">
            {byFamily.map(([family, count]) => (
              <li key={family}>
                {family}: {count} lokasi
              </li>
            ))}
          </ul>
          <p className="text-sm text-ink-muted">
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

        <section id="ambang" className="flex scroll-mt-24 flex-col gap-3 border-t border-rule pt-10">
          <h2 className="text-xl font-extrabold tracking-tight">Ambang klasifikasi</h2>
          <p className="text-sm text-ink-muted">
            Konstanta bernama, dikutip, satu tempat: <code className="font-mono">lib/harmonic/thresholds.ts</code>.
            Mengubah salah satu mengubah peta, jadi setiap nilai adalah keputusan yang didokumentasikan, bukan
            angka ajaib.
          </p>
          <ClassificationSpaceDiagram
            monsunalMaxDisplacementMonths={manifest.thresholds.monsunalMaxDisplacementMonths}
            ekuatorialDominanceRatio={manifest.thresholds.ekuatorialDominanceRatio}
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-rule text-left">
                  <th scope="col" className="py-1 pr-4 font-medium">Ambang</th>
                  <th scope="col" className="py-1 pr-4 font-medium">Nilai</th>
                  <th scope="col" className="py-1 pr-4 font-medium">Satuan</th>
                  <th scope="col" className="py-1 font-medium">Catatan</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {THRESHOLD_ROWS.map((row) => (
                  <tr key={row.key} className="border-b border-rule align-top">
                    <td className="py-2 pr-4">{row.label}</td>
                    <td className="py-2 pr-4 tabular-nums">{manifest.thresholds[row.key]}</td>
                    <td className="py-2 pr-4">{row.unit}</td>
                    <td className="py-2 font-sans text-ink-muted">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-ink-muted">
            Struktur tiga keluarga mengikuti Aldrian, E. &amp; Susanto, R. D. (2003), &ldquo;Identification of three
            dominant rainfall regions within Indonesia and their relationship to sea surface temperature&rdquo;, Int. J.
            Climatol. 23 — dasar yang sama untuk keluarga Monsunal/Ekuatorial/Lokal milik BMKG. Titik potong rasio
            dan pergeseran fase di atas adalah kalibrasi proyek ini sendiri untuk pencocokan harmonik, divalidasi
            hanya oleh tingkat kecocokan yang dilaporkan di bawah — tidak pernah disetel untuk menaikkannya.
          </p>
        </section>

        <section id="bmkg" className="flex scroll-mt-24 flex-col gap-3 border-t border-rule pt-10">
          <h2 className="text-xl font-extrabold tracking-tight">Kecocokan dengan BMKG</h2>
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
          <p className="text-sm text-ink-muted">
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

        <section id="batasan" className="flex scroll-mt-24 flex-col gap-3 border-t border-rule pt-10">
          <h2 className="text-xl font-extrabold tracking-tight">Yang tidak dilakukan aplikasi ini</h2>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-ink-muted">
            <li>Tidak ada prakiraan, tidak ada prediksi awal musim, tidak ada prospek musiman.</li>
            <li>Tidak ada reproduksi batas ZOM kecuali data terbukti dapat didistribusikan ulang.</li>
            <li>Tidak ada saran pertanian — hanya klimatologi apa adanya.</li>
            <li>Tidak ada animasi medan angin (lihat PRD.md §2 untuk alasannya).</li>
            <li>Tidak ada akun, tidak ada server, tidak ada jaringan saat runtime.</li>
            <li>Tidak ada machine learning — klasifikasinya adalah pencocokan harmonik dengan ambang yang dinyatakan, sepenuhnya dapat diperiksa.</li>
          </ul>
        </section>


        <p className="border-t border-rule pt-4 font-mono text-xs text-ink-muted">
          {regimeRecords.length} lokasi dalam build ini. Lihat kode sumber untuk metode lengkap.
        </p>
      </div>
    </>
  );
}
