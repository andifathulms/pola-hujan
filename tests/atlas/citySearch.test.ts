import { describe, expect, it } from "vitest";
import { normaliseQuery, searchCities, type CityIndexEntry } from "@/lib/citySearch";

const INDEX: CityIndexEntry[] = [
  { id: "ambon", name: "Ambon", province: "Maluku", family: "lokal" },
  { id: "tual", name: "Tual", province: "Maluku", family: "ekuatorial" },
  { id: "ternate", name: "Ternate", province: "Maluku Utara", family: "ekuatorial" },
  { id: "palangka-raya", name: "Palangka Raya", province: "Kalimantan Tengah", family: "monsunal" },
  { id: "palembang", name: "Palembang", province: "Sumatera Selatan", family: "monsunal" },
  { id: "palu", name: "Palu", province: "Sulawesi Tengah", family: "monsunal" },
];

describe("searchCities", () => {
  it("returns nothing for an empty or blank query", () => {
    expect(searchCities(INDEX, "")).toEqual([]);
    expect(searchCities(INDEX, "   ")).toEqual([]);
  });

  it("ranks name prefixes before name substrings before provinces", () => {
    // "al" is a substring of Palangka Raya, Palembang, Palu; no prefix.
    // "mal" is a prefix of no name but matches Maluku provinces.
    expect(searchCities(INDEX, "pal").map((c) => c.id)).toEqual(["palangka-raya", "palembang", "palu"]);
    expect(searchCities(INDEX, "maluku").map((c) => c.id)).toEqual(["ambon", "ternate", "tual"]);
  });

  it("puts a name hit ahead of a province hit for the same query", () => {
    const index: CityIndexEntry[] = [
      { id: "a", name: "Kota A", province: "Tengah", family: "monsunal" },
      { id: "b", name: "Tengah Raya", province: "Barat", family: "monsunal" },
    ];
    expect(searchCities(index, "tengah").map((c) => c.id)).toEqual(["b", "a"]);
  });

  it("ignores case, accents and repeated whitespace", () => {
    expect(normaliseQuery("  Palangka   RAYA ")).toBe("palangka raya");
    expect(searchCities(INDEX, "palangka  raya").map((c) => c.id)).toEqual(["palangka-raya"]);
    expect(searchCities(INDEX, "ámbon").map((c) => c.id)).toEqual(["ambon"]);
  });

  it("respects the limit", () => {
    expect(searchCities(INDEX, "a", 2)).toHaveLength(2);
  });
});
