import { describe, expect, it } from "vitest";
import tailwindConfig from "@/tailwind.config";
import { FAMILIES, type Family } from "@/lib/family";

/**
 * The palette's floors, asserted rather than commented.
 *
 * The palette this replaced had all three family hues within 0.06 of
 * each other in relative luminance. Hue is the primary data channel
 * (DESIGN.md §3), but it is not the only thing a reader receives:
 * strip the colour — greyscale, the print stylesheet, or a colour-
 * vision deficiency — and three families collapsed into one grey.
 *
 * Nothing here constrains *which* hues are used. It constrains how far
 * apart they have to stay, and how much contrast they have to keep
 * against every surface they are drawn on, so the next palette edit
 * cannot quietly undo this.
 */

const colors = (tailwindConfig.theme?.extend?.colors ?? {}) as Record<string, string>;

function channel(hex: string, offset: number): number {
  const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function linear(name: string): [number, number, number] {
  const hex = colors[name];
  if (!hex) throw new Error(`token "${name}" is not declared in tailwind.config.ts`);
  return [channel(hex, 1), channel(hex, 3), channel(hex, 5)];
}

/** WCAG 2.1 relative luminance. */
function luminance(name: string): number {
  const [r, g, b] = linear(name);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Viénot 1999 dichromacy matrices, applied in linear RGB. An
 * approximation of what a reader with each deficiency receives — good
 * enough to catch two hues that merge, which is all this is for.
 */
const DICHROMACY = {
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758],
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525],
  ],
} as const;
type Dichromacy = keyof typeof DICHROMACY;

function simulate(name: string, kind: Dichromacy): [number, number, number] {
  const [r, g, b] = linear(name);
  const [row0, row1, row2] = DICHROMACY[kind];
  const apply = (row: readonly [number, number, number]) => row[0] * r + row[1] * g + row[2] * b;
  return [apply(row0), apply(row1), apply(row2)];
}

/** CIE L*a*b* from linear RGB, D65. */
function lab(rgb: [number, number, number]): [number, number, number] {
  const [r, g, b] = rgb;
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

/** CIE76 distance. Under ~10 two colours are hard to tell apart; over ~25 they are comfortably distinct. */
function deltaE(a: [number, number, number], b: [number, number, number]): number {
  const p = lab(a);
  const q = lab(b);
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}

/** Every surface a family-coloured map dot is ever drawn on. */
const DOT_SURFACES = ["stock", "sea", "land"] as const;
/** Every surface family-coloured *text* is ever set on. `plate` is the field plate's ground. */
const TEXT_SURFACES = ["stock", "plate"] as const;

/** The token carrying each family's hue as text — the canonical hue where it already clears 4.5:1. */
const FAMILY_TEXT_TOKEN: Record<Family, string> = {
  monsunal: "monsunal",
  ekuatorial: "ekuatorial-text",
  lokal: "lokal-text",
};

describe("ink clears the text floor on every ground it is set on", () => {
  it.each([...TEXT_SURFACES])("ink on %s", (surface) => {
    expect(contrast("ink", surface)).toBeGreaterThanOrEqual(4.5);
  });

  it.each([...TEXT_SURFACES])("ink-muted on %s", (surface) => {
    expect(contrast("ink-muted", surface)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("every family hue stays visible as a map dot", () => {
  // 3:1 is the floor for a non-text graphical object (WCAG 2.1 SC
  // 1.4.11). `land` is the binding one: it is the darkest surface a dot
  // is drawn on, and the lightest family hue is the one at risk there.
  it.each(FAMILIES.flatMap((family) => DOT_SURFACES.map((surface) => [family, surface] as const)))(
    "%s on %s",
    (family, surface) => {
      expect(contrast(family, surface)).toBeGreaterThanOrEqual(3);
    },
  );

  it("`you` is visible on every one of them too", () => {
    for (const surface of DOT_SURFACES) {
      expect(contrast("you", surface)).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("every family hue is readable as text", () => {
  it.each(FAMILIES.flatMap((family) => TEXT_SURFACES.map((surface) => [family, surface] as const)))(
    "%s text token on %s",
    (family, surface) => {
      expect(contrast(FAMILY_TEXT_TOKEN[family], surface)).toBeGreaterThanOrEqual(4.5);
    },
  );
});

describe("the three families survive the colour being removed", () => {
  const luminances = FAMILIES.map(luminance).sort((a, b) => a - b);

  it("spans a real luminance range, not one grey", () => {
    const spread = (luminances.at(-1) as number) - (luminances[0] as number);
    expect(spread).toBeGreaterThanOrEqual(0.1);
  });

  it("keeps every adjacent pair apart, so no two collapse into each other", () => {
    for (let i = 0; i < luminances.length - 1; i += 1) {
      expect((luminances[i + 1] as number) - (luminances[i] as number)).toBeGreaterThanOrEqual(0.04);
    }
  });
});

describe("the three families stay distinct under dichromacy", () => {
  it.each(Object.keys(DICHROMACY) as Dichromacy[])("%s", (kind) => {
    let worst = Number.POSITIVE_INFINITY;
    for (let i = 0; i < FAMILIES.length; i += 1) {
      for (let j = i + 1; j < FAMILIES.length; j += 1) {
        const distance = deltaE(
          simulate(FAMILIES[i] as string, kind),
          simulate(FAMILIES[j] as string, kind),
        );
        worst = Math.min(worst, distance);
      }
    }
    // Comfortably above the ~10 where two colours become hard to tell
    // apart, with room to spare so an ordinary hue tweak doesn't trip
    // this — but tight enough to catch a palette that puts two families
    // in the same place for a reader who cannot separate them.
    expect(worst).toBeGreaterThanOrEqual(18);
  });
});

describe("the neutral ramp descends in one direction", () => {
  it("each step is darker than the last", () => {
    const ramp = ["stock", "sea", "plate", "land", "rule", "stitch"];
    for (let i = 0; i < ramp.length - 1; i += 1) {
      expect(luminance(ramp[i + 1] as string)).toBeLessThan(luminance(ramp[i] as string));
    }
  });
});
