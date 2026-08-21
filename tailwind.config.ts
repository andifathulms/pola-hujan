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
        stock: "#F2F0E7",
        ink: "#23211C",
        rule: "#D6D2C4",
        monsunal: "#3A6B8A",
        ekuatorial: "#4A7C59",
        lokal: "#B5652E",
        you: "#8B3A62",
        // Darker variants of ekuatorial/lokal for TEXT use only — the
        // canonical hues above are 4.26:1 and 3.78:1 against `stock`,
        // below the 4.5:1 floor for normal-weight text (they're fine as
        // map-dot/swatch fills, which only need 3:1). These are 5.0:1
        // and 4.99:1. `monsunal` needs no variant (5.0:1 already).
        "ekuatorial-text": "#437050",
        "lokal-text": "#99552A",
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
