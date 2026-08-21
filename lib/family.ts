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

/**
 * Text color per family. `ekuatorial` and `lokal` point at darker
 * text-only variants (tailwind.config.ts) — the canonical hues used for
 * map dots and swatches fall below 4.5:1 against `stock` when rendered
 * as small/medium text. `monsunal` already clears 4.5:1 and uses its
 * canonical hue directly.
 */
export const FAMILY_TEXT_CLASS: Record<Family, string> = {
  monsunal: "text-monsunal",
  ekuatorial: "text-ekuatorial-text",
  lokal: "text-lokal-text",
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

/**
 * SVG `fill` equivalent of FAMILY_TEXT_CLASS, for coloured text set
 * inside an SVG (e.g. a region label) rather than as regular HTML text
 * — Tailwind's `text-*` utility sets CSS `color`, which SVG `<text>`
 * ignores unless it explicitly inherits it, so a `fill-*` class is what
 * actually colours SVG text. Same darker ekuatorial/lokal variants as
 * FAMILY_TEXT_CLASS, for the same contrast reason.
 */
export const FAMILY_TEXT_FILL_CLASS: Record<Family, string> = {
  monsunal: "fill-monsunal",
  ekuatorial: "fill-ekuatorial-text",
  lokal: "fill-lokal-text",
};

export const FAMILY_STROKE_CLASS: Record<Family, string> = {
  monsunal: "stroke-monsunal",
  ekuatorial: "stroke-ekuatorial",
  lokal: "stroke-lokal",
};

export const MONTH_LABELS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
