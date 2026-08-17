/**
 * Family display metadata in one place, so no component invents its own
 * label or reaches for a raw hex (CLAUDE.md Conventions). Tailwind class
 * names are written out as full literal strings here — even inside an
 * object — because Tailwind's content scanner matches on literal
 * substrings, not runtime-constructed class names.
 */
export type Family = "monsunal" | "ekuatorial" | "lokal";

export const FAMILIES: readonly Family[] = ["monsunal", "ekuatorial", "lokal"];

export const FAMILY_LABEL: Record<Family, string> = {
  monsunal: "Monsunal",
  ekuatorial: "Ekuatorial",
  lokal: "Lokal",
};

export const FAMILY_DESCRIPTION: Record<Family, string> = {
  monsunal: "Satu puncak hujan, jatuh sekitar monsun Asia (Des–Feb).",
  ekuatorial: "Dua puncak hujan per tahun.",
  lokal: "Satu puncak hujan, tapi di luar musim monsun Asia — kebalikan dari Jawa.",
};

export const FAMILY_TEXT_CLASS: Record<Family, string> = {
  monsunal: "text-monsunal",
  ekuatorial: "text-ekuatorial",
  lokal: "text-lokal",
};

export const FAMILY_BG_CLASS: Record<Family, string> = {
  monsunal: "bg-monsunal",
  ekuatorial: "bg-ekuatorial",
  lokal: "bg-lokal",
};

export const FAMILY_FILL_CLASS: Record<Family, string> = {
  monsunal: "fill-monsunal",
  ekuatorial: "fill-ekuatorial",
  lokal: "fill-lokal",
};

export const FAMILY_STROKE_CLASS: Record<Family, string> = {
  monsunal: "stroke-monsunal",
  ekuatorial: "stroke-ekuatorial",
  lokal: "stroke-lokal",
};

export const MONTH_LABELS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
