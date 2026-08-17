/**
 * Minimal ustar/GNU-tar reader: enough to pull named regular-file
 * entries out of the small archives CHIRPS ships (one .bil + one .hdr
 * per month). Not a general-purpose tar implementation — no support for
 * long-name extensions, links, or directories, none of which these
 * archives use.
 */

const BLOCK_SIZE = 512;

export function extractTarEntries(tarBuffer: Buffer): Map<string, Buffer> {
  const entries = new Map<string, Buffer>();
  let offset = 0;

  while (offset + BLOCK_SIZE <= tarBuffer.length) {
    const header = tarBuffer.subarray(offset, offset + BLOCK_SIZE);
    if (header.every((byte) => byte === 0)) break; // end-of-archive marker

    const name = header.subarray(0, 100).toString("utf-8").replace(/\0.*$/, "");
    const sizeOctal = header.subarray(124, 136).toString("utf-8").replace(/\0.*$/, "").trim();
    const size = sizeOctal ? parseInt(sizeOctal, 8) : 0;
    const typeFlag = String.fromCharCode(header[156] ?? 0);

    const dataStart = offset + BLOCK_SIZE;
    if ((typeFlag === "0" || typeFlag === "\0") && name && Number.isFinite(size)) {
      entries.set(name, tarBuffer.subarray(dataStart, dataStart + size));
    }

    const paddedSize = Math.ceil(size / BLOCK_SIZE) * BLOCK_SIZE;
    offset = dataStart + paddedSize;
  }

  return entries;
}
