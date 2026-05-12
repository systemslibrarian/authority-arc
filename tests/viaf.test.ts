import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { viafLookup, viafAutoSuggest } from "@/lib/viaf";

/**
 * VIAF client unit tests.
 *
 * We mock global.fetch so the tests don't hit the network. The point of these
 * tests is to verify the normalizer, not VIAF's uptime.
 */

const STEPHEN_KING_CLUSTER = {
  viafID: "27066711",
  nameType: "Personal",
  mainHeadings: {
    data: [
      {
        text: "King, Stephen, 1947-",
        sources: { s: [{ "#text": "LC" }] },
      },
      {
        text: "King, Stephen, 1947- (other)",
        sources: { s: [{ "#text": "DNB" }] },
      },
    ],
  },
  sources: {
    source: [
      "LC|n79018049",
      "DNB|118562525",
      "BNF|11909418",
      "WIKIDATA|Q39829",
    ],
  },
};

describe("lib/viaf", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("normalizes a typical cluster response", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      url: "https://viaf.org/viaf/27066711",
      json: async () => STEPHEN_KING_CLUSTER,
    });

    const result = await viafLookup({ curator: "LC", id: "n79018049" });

    expect(result.source).toBe("viaf");
    expect(result.canonicalUri).toBe("http://viaf.org/viaf/27066711");
    expect(result.label).toBe("King, Stephen, 1947-");
    expect(result.nameType).toBe("Personal");
    expect(result.entityMd5).toBeUndefined(); // VIAF does not publish one
    expect(result.wire.responseStatus).toBe(200);
  });

  it("excludes the query identifier from the sameAs list", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      url: "https://viaf.org/viaf/27066711",
      json: async () => STEPHEN_KING_CLUSTER,
    });

    const result = await viafLookup({ curator: "LC", id: "n79018049" });
    const sameAsAsStrings = result.sameAs.map((s) => `${s.curator}|${s.id}`);
    expect(sameAsAsStrings).not.toContain("LC|n79018049");
    expect(sameAsAsStrings).toContain("DNB|118562525");
    expect(sameAsAsStrings).toContain("WIKIDATA|Q39829");
  });

  it("prefers the LC heading for the label when multiple are present", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      url: "https://viaf.org/viaf/27066711",
      json: async () => STEPHEN_KING_CLUSTER,
    });

    const result = await viafLookup({ curator: "LC", id: "n79018049" });
    expect(result.label).toBe("King, Stephen, 1947-");
    // not the DNB-sourced alternate heading
  });

  it("raises a typed NOT_FOUND error on 404", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      url: "https://viaf.org/viaf/sourceID/LC|nope",
      json: async () => ({}),
    });

    await expect(
      viafLookup({ curator: "LC", id: "nope" })
    ).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });
  });

  it("raises an UPSTREAM_ERROR on 5xx", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 503,
      url: "https://viaf.org/...",
      json: async () => ({}),
    });

    await expect(
      viafLookup({ curator: "LC", id: "n79018049" })
    ).rejects.toMatchObject({ code: "UPSTREAM_ERROR", status: 503 });
  });

  it("upper-cases the curator code in the request URL", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      url: "https://viaf.org/viaf/27066711",
      json: async () => STEPHEN_KING_CLUSTER,
    });

    await viafLookup({ curator: "lc", id: "n79018049" });
    const calledUrl = (global.fetch as any).mock.calls[0][0] as string;
    // encodeURIComponent leaves "|" untouched (it's not in the reserved set
    // per the spec). What we want to verify is that the curator was uppercased.
    expect(calledUrl).toContain("sourceID/LC");
    expect(calledUrl).not.toContain("sourceID/lc");
    expect(calledUrl).toContain("n79018049");
  });

  it("handles a single-source string in sources.source (not always an array)", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      url: "https://viaf.org/viaf/123",
      json: async () => ({
        viafID: "123",
        nameType: "Personal",
        mainHeadings: { data: { text: "Lone, Author", sources: { s: "LC" } } },
        sources: { source: "LC|n00000000" },
      }),
    });

    const result = await viafLookup({ curator: "DNB", id: "nonexistent" });
    expect(result.sameAs.length).toBeGreaterThanOrEqual(1);
    expect(result.sameAs[0].curator).toBe("LC");
  });

  describe("viafAutoSuggest", () => {
    it("returns an empty hit set on an empty query without hitting the network", async () => {
      const res = await viafAutoSuggest("");
      expect(res.hits).toEqual([]);
      expect((global.fetch as any).mock?.calls?.length ?? 0).toBe(0);
    });

    it("normalizes a typical AutoSuggest response to AutoSuggestHit[]", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          query: "stephen king",
          result: [
            {
              viafid: "27066711",
              displayForm: "King, Stephen, 1947-",
              nametype: "personal",
              lc: "n79018049",
              wkp: "Q39829",
              dnb: ["118562525"], // arrays should be flattened
              bnf: "11909418",
            },
            {
              recordID: "5678",
              term: "Older Heading",
              nametype: "personal",
            },
          ],
        }),
      });
      const res = await viafAutoSuggest("stephen king");
      expect(res.hits).toHaveLength(2);
      expect(res.hits[0]).toMatchObject({
        viafId: "27066711",
        label: "King, Stephen, 1947-",
        nameType: "personal",
      });
      expect(res.hits[0].identifiers?.lc).toBe("n79018049");
      expect(res.hits[0].identifiers?.dnb).toBe("118562525");
      expect(res.hits[1].viafId).toBe("5678");
      expect(res.hits[1].label).toBe("Older Heading");
    });

    it("drops hits missing a viafid or label", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          query: "x",
          result: [
            { displayForm: "no viaf id, dropped" },
            { viafid: "123" /* no label, dropped */ },
            { viafid: "999", displayForm: "Kept" },
          ],
        }),
      });
      const res = await viafAutoSuggest("x");
      expect(res.hits).toHaveLength(1);
      expect(res.hits[0].label).toBe("Kept");
    });

    it("raises UPSTREAM_ERROR on non-2xx", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({}),
      });
      await expect(viafAutoSuggest("anything")).rejects.toMatchObject({
        code: "UPSTREAM_ERROR",
        status: 503,
      });
    });
  });
});
