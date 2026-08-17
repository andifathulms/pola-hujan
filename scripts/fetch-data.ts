/**
 * DEV/CI: pull precipitation source data.
 *
 * Not yet implemented against a real source. GPM IMERG requires a NASA
 * Earthdata login and CHIRPS a bulk download from UCSB/CHC (PRD.md §4);
 * neither is wired up here. Until then this only checks that the
 * placeholder dataset (`data/source/locations.json`, see
 * `data/source/README.md`) is present, so `pnpm data:build` always has
 * something valid to read.
 */
import { existsSync } from "node:fs";
import path from "node:path";

const sourcePath = path.join(process.cwd(), "data", "source", "locations.json");

if (!existsSync(sourcePath)) {
  console.error(
    `data:fetch — ${sourcePath} is missing. Real IMERG/CHIRPS ingestion is not yet implemented; ` +
      "see data/source/README.md for what's expected there.",
  );
  process.exit(1);
}

console.log(`data:fetch — using placeholder source at ${sourcePath} (see data/source/README.md).`);
console.log("data:fetch — no real fetch performed. This is expected until IMERG/CHIRPS ingestion is built.");
