import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { wikidataNeighborhood } from "@/lib/wikidata";

/**
 * Wikidata SPARQL client unit tests.
 *
 * fetch is mocked so the tests don't depend on Wikidata's uptime.
 * The point is to verify the normalizer's behavior under realistic
 * SPARQL result shapes.
 */

const KING_RESPONSE = {
  results: {
    bindings: [
      {
        entityLabel: { value: "Stephen King" },
        entityDescription: { value: "American author" },
        viaf: { value: "27066711" },
        lc: { value: "n79018049" },
        birth: { value: "+1947-09-21T00:00:00Z" },
        notableWork: { value: "http://www.wikidata.org/entity/Q272414" },
        notableWorkLabel: { value: "It" },
        influencedBy: { value: "http://www.wikidata.org/entity/Q1077" },
        influencedByLabel: { value: "H. P. Lovecraft" },
      },
      // duplicate notable-work row with a different influencedBy — tests dedup
      {
        notableWork: { value: "http://www.wikidata.org/entity/Q272414" },
        notableWorkLabel: { value: "It" },
        influencedBy: { value: "http://www.wikidata.org/entity/Q316313" },
        influencedByLabel: { value: "Richard Matheson" },
      },
      {
        subjectOf: { value: "http://www.wikidata.org/entity/Q9999" },
        subjectOfLabel: { value: "Stephen King: A Critical Companion" },
      },
    ],
  },
};

describe("lib/wikidata", () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = vi.fn();
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("rejects an invalid Q-id without hitting the network", async () => {
    await expect(wikidataNeighborhood("not-a-qid")).rejects.toMatchObject({
      code: "BAD_INPUT",
      status: 400,
    });
    expect((global.fetch as any).mock.calls.length).toBe(0);
  });

  it("normalizes a typical SPARQL response into a ConnectRecord", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => KING_RESPONSE,
    });
    const r = await wikidataNeighborhood("Q39829");
    expect(r.entity.name).toBe("Stephen King");
    expect(r.entity.wikidata).toBe("Q39829");
    expect(r.entity.viaf).toBe("27066711");
    expect(r.entity.lc).toBe("n79018049");
    expect(r.entity.birthYear).toBe("1947");

    const types = r.relationships.map((rel) => rel.type).sort();
    expect(types).toEqual(["influenced-by", "notable-work", "subject-of"]);

    const works = r.relationships.find((rel) => rel.type === "notable-work")!;
    expect(works.neighbors).toHaveLength(1); // dedup'd to one
    expect(works.neighbors[0].label).toBe("It");
    expect(works.neighbors[0].wikidata).toBe("Q272414");

    const influences = r.relationships.find((rel) => rel.type === "influenced-by")!;
    expect(influences.neighbors).toHaveLength(2);
  });

  it("returns a record with empty relationships when SPARQL returns nothing", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ results: { bindings: [] } }),
    });
    const r = await wikidataNeighborhood("Q99999999");
    expect(r.relationships).toEqual([]);
    expect(r.sparsityNote).toMatch(/no notable-work/i);
  });

  it("maps non-2xx into typed UPSTREAM_ERROR", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({}),
    });
    await expect(wikidataNeighborhood("Q39829")).rejects.toMatchObject({
      code: "UPSTREAM_ERROR",
      status: 503,
    });
  });

  it("upper-cases the Q-id in the request URL", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => KING_RESPONSE,
    });
    await wikidataNeighborhood("q39829");
    const calledUrl = (global.fetch as any).mock.calls[0][0] as string;
    // The query body is URL-encoded; just confirm Q39829 appears somewhere.
    expect(calledUrl).toContain("Q39829");
    expect(calledUrl).not.toMatch(/q39829[^A-Z]/);
  });
});
