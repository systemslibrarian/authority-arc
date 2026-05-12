import { describe, it, expect } from "vitest";
import { fixtureLookup, listFixtures } from "@/lib/fixtures";

describe("lib/fixtures", () => {
  it("resolves the primary identifier (LC|n79018049 → Stephen King)", () => {
    const result = fixtureLookup({ curator: "LC", id: "n79018049" });
    expect(result).not.toBeNull();
    expect(result?.label).toMatch(/King, Stephen/);
    expect(result?.source).toBe("fixture");
  });

  it("resolves by any sameAs identifier in the cluster", () => {
    const byDnb = fixtureLookup({ curator: "DNB", id: "118562525" });
    const byWikidata = fixtureLookup({ curator: "WIKIDATA", id: "Q39829" });
    const byFast = fixtureLookup({ curator: "FAST", id: "41201" });

    expect(byDnb?.canonicalUri).toBe(byWikidata?.canonicalUri);
    expect(byWikidata?.canonicalUri).toBe(byFast?.canonicalUri);
  });

  it("matches case-insensitively on the curator", () => {
    expect(fixtureLookup({ curator: "lc", id: "n79018049" })).not.toBeNull();
    expect(fixtureLookup({ curator: "Lc", id: "n79018049" })).not.toBeNull();
  });

  it("returns null when the (curator, id) is unknown", () => {
    expect(fixtureLookup({ curator: "LC", id: "no-such-id" })).toBeNull();
    expect(fixtureLookup({ curator: "FAKE", id: "12345" })).toBeNull();
  });

  it("marks every returned fixture with source=fixture", () => {
    for (const fx of listFixtures()) {
      expect(fx.source).toBe("fixture");
    }
  });

  it("the Stephen King fixture has the expected shape", () => {
    const sk = fixtureLookup({ curator: "LC", id: "n79018049" });
    expect(sk).not.toBeNull();
    expect(sk!.canonicalUri).toMatch(/viaf\.org\/viaf\/\d+/);
    expect(sk!.sameAs.length).toBeGreaterThanOrEqual(5);
    expect(sk!.nameType).toBe("Personal");
    // VIAF does not publish a content hash; fixture must reflect that.
    expect(sk!.entityMd5).toBeFalsy();
  });
});
