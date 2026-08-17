import type { Config } from "tailwindcss";

// Tokens exactly as DESIGN.md specifies — never a raw hex in a component
// (CLAUDE.md Conventions). §1 (space/motion/edge) and §3 (colour).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
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
      },
      fontFamily: {
        display: ["var(--font-alegreya)", "serif"],
        sans: ["var(--font-alegreya-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      fontSize: {
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
