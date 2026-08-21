import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import tailwindConfig from "@/tailwind.config";

// tailwind.config.ts and app/globals.css's :root block hold the same
// token values, kept in sync by hand because Tailwind can't read CSS
// custom properties at build time (comment in both files). This test
// is the guard against that drift, per DESIGN-REWORK.md §4.
const globalsCss = readFileSync(path.resolve(process.cwd(), "app/globals.css"), "utf8");

function cssVar(name: string): string {
  const match = globalsCss.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!match || match[1] === undefined) throw new Error(`--${name} not declared in app/globals.css`);
  return match[1].trim();
}

const extend = tailwindConfig.theme?.extend ?? {};
const colors = extend.colors as Record<string, string>;
const fontSize = extend.fontSize as Record<string, string>;
const spacing = extend.spacing as Record<string, string>;

describe("tailwind.config.ts colours match app/globals.css --color-* vars", () => {
  it.each(Object.entries(colors))("%s: %s", (name, hex) => {
    expect(cssVar(`color-${name}`).toLowerCase()).toBe(hex.toLowerCase());
  });
});

describe("tailwind.config.ts fontSize matches app/globals.css --text-* vars", () => {
  it.each(Object.entries(fontSize))("%s: %s", (name, px) => {
    expect(cssVar(`text-${name}`)).toBe(px);
  });
});

describe("tailwind.config.ts spacing matches app/globals.css --space-* vars", () => {
  it.each(Object.entries(spacing))("%s: %s", (name, px) => {
    expect(cssVar(`space-${name}`)).toBe(px);
  });
});
