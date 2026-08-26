import type { Config } from "tailwindcss";

// Tokens exactly as DESIGN.md specifies — never a raw hex in a component
// (CLAUDE.md Conventions). §1 (space/motion/edge) and §3 (colour).
const config: Config = {
  // lib/family.ts is where FAMILY_FILL_CLASS etc. write out their full
  // literal class-name strings ("fill-monsunal", "bg-monsunal", ...) —
  // Tailwind's content scanner only sees a class if the file containing
  // its literal text is in this list, and lib/ was missing, so every
  // family-hue class was silently never generated.
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // "Batik Pesisir" — indigo (nila), olive and soga gold on
        // unbleached mori cloth, the north-coast dye triad. It replaces a
        // palette whose three family hues sat within 0.06 of each other
        // in relative luminance: hue is the primary channel, but strip
        // the colour (greyscale, the print stylesheet, or one form of
        // colour-vision deficiency) and the encoding collapsed into one
        // grey. Every value below is solved, not picked — see
        // tests/design/palette.test.ts, which asserts the floors.
        //
        // The warm-neutral ramp, cloth rather than bleached paper.
        // Relative luminance in brackets.
        stock: "#F1EADD", // [0.828] page ground
        sea: "#ECE3D2", // [0.774] the map's water
        plate: "#E7DECA", // [0.735] the field plate's mount
        land: "#E1D7C2", // [0.685] the map's landmass
        rule: "#DBD1BD", // [0.643] hairlines, month gridlines
        stitch: "#BFB092", // [0.442] the plate's seam, the coastline
        ink: "#231D17", // 13.94:1 on stock, 12.46:1 on plate
        // Equivalent to the old ink/70%, but declared rather than
        // derived so its contrast is checkable: 6.01:1 on stock.
        "ink-muted": "#605648",

        // Family = hue (DESIGN.md §3). Spaced across the widest
        // luminance range that still clears 3:1 against `land`, the
        // darkest surface a map dot ever sits on — 0.065 / 0.136 / 0.185,
        // a spread of 0.120 against the old palette's 0.061.
        monsunal: "#2B477B", // nila indigo   [0.065] 7.67:1 stock, 6.42:1 land
        ekuatorial: "#527030", // olive green   [0.136] 4.72:1 stock, 3.95:1 land
        lokal: "#977121", // soga gold     [0.185] 3.73:1 stock, 3.13:1 land
        // Darker variants for TEXT only. The canonical hues above clear
        // the 3:1 a dot fill needs but not the 4.5:1 normal-weight text
        // needs on both `stock` and `plate`. These clear both (5.05:1 /
        // 4.52:1 and 5.08:1 / 4.55:1). `monsunal` needs no variant.
        "ekuatorial-text": "#4F6B2E",
        "lokal-text": "#7D5D1B",
        // Your location — a batik plum, outside all three families so it
        // is findable on any regime. 7.46:1 on stock.
        you: "#763254",
      },
      fontFamily: {
        display: ["var(--font-alegreya)", "serif"],
        sans: ["var(--font-alegreya-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      fontSize: {
        // Below the 16px floor, so scoped to axis ticks and month labels
        // inside a chart's own SVG — never prose. Was a repeated
        // text-[10px] arbitrary value; named so the exception is
        // declared once instead of written inline at every call site.
        tick: "10px",
        xs: "14px",
        sm: "16px",
        base: "18px",
        lg: "22px",
        xl: "28px",
        "2xl": "36px",
        "3xl": "46px",
        // Scoped to the field plate's location name only (VISUAL_AMBITION
        // direction A) — continues the scale's own ~1.25-1.28 progression
        // (46 * ~1.26) rather than introducing an unrelated ratio.
        "4xl": "58px",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        6: "24px",
        8: "32px",
        12: "48px",
        16: "64px",
        24: "96px",
        32: "128px",
      },
      borderRadius: {
        DEFAULT: "2px",
      },
      transitionDuration: {
        fast: "120ms",
        state: "240ms",
        curve: "600ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.2, 0, 0, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
