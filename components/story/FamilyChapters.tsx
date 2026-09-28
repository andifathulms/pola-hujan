import Link from "next/link";
import type { Manifest, RegimeRecord } from "@/lib/grid/schema";
import { FAMILY_BG_CLASS, FAMILY_LABEL, FAMILY_TEXT_CLASS, MONTH_LABELS_ID, formatMm, type Family } from "@/lib/family";
import { MiniCycle } from "@/components/wall/MiniCycle";
import { cityHref } from "@/lib/routes";

/**
 * One chapter per family, each told through one real city. The shape
 * descriptions are about the family; the city line under each chart is
 * that city's own pipeline figures.
 */
const CHAPTERS: Array<{ family: Family; cityId: string; title: string; body: string }> = [
  {
    family: "monsunal",
    cityId: "jakarta",
    title: "Satu puncak, di awal tahun",
    body: "Hujan memuncak sekitar Desember sampai Februari, bersamaan dengan monsun Asia. Kemarau jatuh di pertengahan tahun. Ini pola yang paling banyak.",
  },
  {
    family: "lokal",
    cityId: "ambon",
    title: "Satu puncak, di tengah tahun",
    body: "Puncaknya jatuh sekitar Juni dan Juli, saat sebagian besar Jawa sedang kering. Bukan anomali, melainkan pola tersendiri.",
  },
  {
    family: "ekuatorial",
    cityId: "pontianak",
    title: "Dua puncak setahun",
    body: "Matahari melintas di atas khatulistiwa dua kali setahun, dan hujan mengikutinya. Tidak ada satu musim kemarau panjang.",
  },
];

export function FamilyChapters({ records, manifest }: { records: RegimeRecord[]; manifest: Manifest }) {
  return (
    <section aria-labelledby="bab-judul" className="flex flex-col gap-6">
      <div className="flex max-w-[60ch] flex-col gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-muted">Tiga pola</p>
        <h2 id="bab-judul" className="text-2xl font-extrabold leading-tight tracking-tight lg:text-3xl">
          Satu negara, tiga kalender hujan.
        </h2>
        <p className="text-sm text-ink-muted">
          Istilahnya mengikuti kerangka BMKG: Monsunal, Lokal, Ekuatorial. Di sini ketiganya dihitung dari bentuk kurva hujan tiap kota.
        </p>
      </div>
      <div className="grid gap-px overflow-hidden rounded-card border border-rule bg-rule md:grid-cols-3">
        {CHAPTERS.map(({ family, cityId, title, body }) => {
          const city = records.find((r) => r.id === cityId);
          const count = manifest.coverage.byFamily[family] ?? 0;
          return (
            <article key={family} className="flex flex-col gap-3 bg-stock p-5 lg:p-6">
              <p className={`flex items-center gap-2 text-lg font-extrabold tracking-tight ${FAMILY_TEXT_CLASS[family]}`}>
                <span aria-hidden className={`h-3.5 w-3.5 rounded-full ${FAMILY_BG_CLASS[family]}`} />
                {FAMILY_LABEL[family]}
                <span className="ml-auto font-mono text-xs font-normal text-ink-muted">{count} kota</span>
              </p>
              <h3 className="text-base font-bold">{title}</h3>
              {city && (
                <Link href={cityHref(city.id)} className="flex flex-col gap-1.5 rounded-card border border-rule p-3 no-underline transition-colors duration-fast hover:border-ink">
                  <MiniCycle monthlyMm={city.monthlyMm} family={family} maxMm={city.monthlyMm[city.wettestMonth] ?? 1} wettestMonth={city.wettestMonth} />
                  <span className="flex justify-between font-mono text-xs text-ink-muted">
                    <span className="font-sans font-bold text-ink">{city.name}</span>
                    <span>
                      terbasah {MONTH_LABELS_ID[city.wettestMonth]} · {formatMm(city.annualTotalMm)} mm/thn
                    </span>
                  </span>
                </Link>
              )}
              <p className="text-sm text-ink-muted">{body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
