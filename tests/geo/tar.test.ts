import { describe, expect, it } from "vitest";
import { extractTarEntries } from "@/lib/geo/tar";

const BLOCK_SIZE = 512;

/** Build a minimal ustar-compatible archive with the given entries, for testing without a real downloaded file. */
function buildTar(entries: Array<{ name: string; content: string }>): Buffer {
  const blocks: Buffer[] = [];
  for (const { name, content } of entries) {
    const header = Buffer.alloc(BLOCK_SIZE);
    header.write(name, 0, "utf-8");
    const sizeOctal = content.length.toString(8).padStart(11, "0");
    header.write(sizeOctal, 124, "utf-8");
    header.write("0", 156, "utf-8"); // typeflag: regular file
    blocks.push(header);

    const data = Buffer.from(content, "utf-8");
    const padded = Buffer.alloc(Math.ceil(data.length / BLOCK_SIZE) * BLOCK_SIZE);
    data.copy(padded);
    blocks.push(padded);
  }
  blocks.push(Buffer.alloc(BLOCK_SIZE * 2)); // end-of-archive marker
  return Buffer.concat(blocks);
}

describe("extractTarEntries", () => {
  it("extracts named entries with their exact content", () => {
    const tar = buildTar([
      { name: "chirps-v2.0_201601.hdr", content: "NROWS 4\n" },
      { name: "chirps-v2.0_201601.bil", content: "\x01\x02\x03\x04" },
    ]);

    const entries = extractTarEntries(tar);

    expect(entries.get("chirps-v2.0_201601.hdr")?.toString("utf-8")).toBe("NROWS 4\n");
    expect(entries.get("chirps-v2.0_201601.bil")?.toString("binary")).toBe("\x01\x02\x03\x04");
  });

  it("returns an empty map for an archive with only the end marker", () => {
    const tar = Buffer.alloc(BLOCK_SIZE * 2);
    expect(extractTarEntries(tar).size).toBe(0);
  });

  it("handles content that is not a multiple of the block size", () => {
    const tar = buildTar([{ name: "odd.txt", content: "x".repeat(513) }]);
    const entries = extractTarEntries(tar);
    expect(entries.get("odd.txt")?.length).toBe(513);
  });
});
