import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Same reasoning and same exception as app/icon.tsx: raw hex because
 * satori (next/og's renderer) doesn't read Tailwind classes, and shapes
 * only because satori needs a loaded font buffer for any text and this
 * app's fonts are woff2-only (satori wants ttf/otf/woff).
 *
 * Larger version of the same three-bar motif — this is what a shared
 * link's preview card shows; previously nothing did, since the app had
 * no og:image at all.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 48,
          background: "#F2F0E7",
        }}
      >
        <div style={{ width: 140, height: 260, background: "#3A6B8A" }} />
        <div style={{ width: 140, height: 420, background: "#4A7C59" }} />
        <div style={{ width: 140, height: 170, background: "#B5652E" }} />
      </div>
    ),
    { ...size },
  );
}
