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
        // "Pesisir Terang" — the bright coastal dyes of Pekalongan and
        // Lasem on mori primissima, the fine white cotton good batik is
        // drawn on. It replaces "Batik Pesisir", whose muted indigo,
        // olive and soga gold were really the sogan palette of the Solo
        // and Yogya courts: correct in value, dull in chroma (mean
        // CIELAB chroma 40 → 59 here). Every value is solved against the
        // floors in tests/design/palette.test.ts, and every one of those
        // floors moved up rather than down — see DESIGN.md §3.
        //
        // The neutral ramp. Relative luminance in brackets. `sea` is the
        // one cool step: a faint water tint lets the coastline read
        // without a heavy stroke, and the ramp still descends
        // monotonically.
        stock: "#FAF8F3", // [0.939] page ground — mori primissima
        sea: "#EDF1F2", // [0.873] the map's water
        plate: "#F0ECE3", // [0.841] the field plate's mount, cards
        land: "#E8E2D4", // [0.763] the map's landmass
        rule: "#DDD7CA", // [0.682] hairlines, month gridlines
        stitch: "#B9B09C", // [0.438] the plate's seam, the coastline
        ink: "#14171F", // jelaga, 16.88:1 on stock, 15.20:1 on plate
        // Declared rather than derived so its contrast is checkable:
        // 6.53:1 on stock, 5.88:1 on plate.
        "ink-muted": "#545A66",

        // Family = hue (DESIGN.md §3). Spread 0.144 in luminance
        // (0.061 / 0.149 / 0.205), against the previous palette's 0.120.
        // The green leans yellow on purpose: a teal green scored ΔE 8.8
        // against the indigo under tritanopia and would fail the floor.
        monsunal: "#1F3F99", // nila Pekalongan  8.88:1 stock, 7.29:1 land
        ekuatorial: "#3B7A1F", // hijau daun     4.96:1 stock, 4.08:1 land
        lokal: "#B86A00", // kunyit (turmeric)   3.88:1 stock, 3.19:1 land
        // Darker variants for TEXT only — the canonical ekuatorial and
        // lokal hues clear the 3:1 a dot needs, not the 4.5:1 text needs.
        // 6.19:1 / 5.57:1 and 6.02:1 / 5.42:1 on stock / plate.
        "ekuatorial-text": "#2F6A18",
        "lokal-text": "#8A5200",
        // Sub-type = tint (DESIGN.md §3). The second sub-type of each
        // family is a lighter value of the same hue, always drawn with a
        // stroke in the canonical hue so the mark keeps its 3:1 edge.
        "monsunal-tint": "#8FA2D6",
        "ekuatorial-tint": "#A6C794",
        "lokal-tint": "#E6BC7E",
        // Your location — magenta Lasem, outside all three families so
        // it is findable on any regime. Not a red. 5.37:1 on land.
        you: "#A1286A",
      },
      fontFamily: {
        // Plus Jakarta Sans for structure, Newsreader for story, IBM Plex
        // Mono for figures — see app/layout.tsx and DESIGN.md §8.
        // `display` and `sans` are the same face (headings are set apart
        // by weight and tracking); `story` is the italic serif used only
        // for sentences that carry a finding.
        display: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        story: ["var(--font-story)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
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
        // 2px stays the default and the only radius on data marks.
        // Cards, sheets and panels take `card`; chips and pills take
        // Tailwind's built-in `rounded-full`. DESIGN.md §1.
        DEFAULT: "2px",
        card: "10px",
        sheet: "22px",
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
