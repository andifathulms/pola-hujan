import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * next/og's ImageResponse renders through satori, not a browser — it
 * has no Tailwind build to read classes from and only understands
 * inline flexbox styles, so the raw hex here (matching
 * tailwind.config.ts exactly) is a necessary exception to "never a raw
 * hex in a component," not an oversight.
 *
 * Three bars in the three family hues, tallest-to-shortest like a tiny
 * bar chart — the same visual language as CycleCurve's monthly bars and
 * the regime map's dots, not a new brand mark. No text: satori requires
 * an explicit font buffer for any text, and this app's self-hosted
 * fonts ship as woff2 only (satori needs ttf/otf/woff) — shapes avoid
 * that entirely rather than fetching a font at build time for a favicon.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 3,
          background: "#F2F0E7",
        }}
      >
        <div style={{ width: 6, height: 14, background: "#3A6B8A" }} />
        <div style={{ width: 6, height: 22, background: "#4A7C59" }} />
        <div style={{ width: 6, height: 9, background: "#B5652E" }} />
      </div>
    ),
    { ...size },
  );
}
