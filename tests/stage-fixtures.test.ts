import { describe, it, expect } from "vitest";
import { listDisambiguationCases, getDisambiguationCase } from "@/lib/disambiguation-cases";
import { listClassifyRecords, getClassifyRecord } from "@/lib/classify-records";
import { listConnectRecords, getConnectRecord } from "@/lib/connect-records";
import { listMaintainRecords, getMaintainRecord, merkleizeRecord } from "@/lib/maintain-records";

/**
 * Loader tests for the four stage-fixture modules. These tests guard
 * against shape regressions — if a fixture JSON gets edited in a way that
 * breaks the loader's contract, these tests catch it before the page tries
 * to render against a malformed record.
 */

describe("disambiguation cases (Stage 2)", () => {
  it("lists both curated cases", () => {
    const cases = listDisambiguationCases();
    expect(cases).toHaveLength(2);
    expect(cases.map((c) => c.id).sort()).toEqual([
      "twain-clemens",
      "two-john-smiths",
    ]);
  });

  it("provides one merge case and one split case", () => {
    const cases = listDisambiguationCases();
    const kinds = cases.map((c) => c.kind).sort();
    expect(kinds).toEqual(["merge", "split"]);
  });

  it("includes at least three pieces of evidence per case", () => {
    for (const c of listDisambiguationCases()) {
      expect(c.viafDecision.evidence.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("returns null for an unknown id", () => {
    expect(getDisambiguationCase("does-not-exist")).toBeNull();
  });

  it("returns the requested case when id matches", () => {
    const c = getDisambiguationCase("twain-clemens");
    expect(c?.kind).toBe("merge");
    expect(c?.leftRecord.heading).toContain("Twain");
  });
});

describe("classify records (Stage 3)", () => {
  it("lists at least one record", () => {
    expect(listClassifyRecords().length).toBeGreaterThanOrEqual(1);
  });

  it("has a Dewey path that descends from a 3-digit top-level class", () => {
    const r = listClassifyRecords()[0];
    expect(r.dewey.path.length).toBeGreaterThanOrEqual(3);
    // First level is always a 3-digit top class (000–999); subsequent
    // levels are at least as long (digits or digits + decimal subdivision).
    expect(r.dewey.path[0].number).toMatch(/^\d{3}$/);
    for (let i = 1; i < r.dewey.path.length; i++) {
      const prev = r.dewey.path[i - 1].number;
      const curr = r.dewey.path[i].number;
      expect(curr.length).toBeGreaterThanOrEqual(prev.length);
    }
    // Every level has a non-empty description.
    for (const level of r.dewey.path) {
      expect(level.description.length).toBeGreaterThan(0);
    }
  });

  it("groups FAST headings across multiple facets", () => {
    const r = listClassifyRecords()[0];
    const facets = new Set(r.fast.headings.map((h) => h.facet));
    expect(facets.size).toBeGreaterThanOrEqual(2);
  });

  it("looks up by id", () => {
    expect(getClassifyRecord("it-by-king")?.work.title).toBe("It");
    expect(getClassifyRecord("nope")).toBeNull();
  });
});

describe("connect records (Stage 4)", () => {
  it("includes at least one entity with multiple relationship types", () => {
    const r = listConnectRecords()[0];
    expect(r.relationships.length).toBeGreaterThanOrEqual(3);
    const types = new Set(r.relationships.map((rel) => rel.type));
    expect(types.size).toBe(r.relationships.length);
  });

  it("every relationship carries an editorial explanation", () => {
    const r = listConnectRecords()[0];
    for (const rel of r.relationships) {
      expect(rel.explanation.length).toBeGreaterThan(40);
    }
  });

  it("looks up by id", () => {
    expect(getConnectRecord("stephen-king")?.entity.name).toBe("Stephen King");
    expect(getConnectRecord("missing")).toBeNull();
  });
});

describe("maintain records + merkleization (Stage 5)", () => {
  it("lists at least one ledger", () => {
    expect(listMaintainRecords().length).toBeGreaterThanOrEqual(1);
  });

  it("ledger entries are ordered chronologically", () => {
    const r = listMaintainRecords()[0];
    for (let i = 1; i < r.entries.length; i++) {
      const prev = parseInt(r.entries[i - 1].year, 10);
      const curr = parseInt(r.entries[i].year, 10);
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  });

  it("merkleization returns a 64-char hex root and one proof per entry", () => {
    const r = listMaintainRecords()[0];
    const m = merkleizeRecord(r);
    expect(m.merkleRoot).toMatch(/^[0-9a-f]{64}$/);
    expect(m.merkleAlgorithm).toBe("sha-256");
    expect(m.entries.length).toBe(r.entries.length);
    for (const e of m.entries) {
      expect(e.merkleProof.leafHash).toMatch(/^[0-9a-f]{64}$/);
      expect(e.merkleProof.siblings.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("merkleization is deterministic across calls", () => {
    const r = listMaintainRecords()[0];
    expect(merkleizeRecord(r).merkleRoot).toBe(merkleizeRecord(r).merkleRoot);
  });

  it("looks up by id", () => {
    expect(getMaintainRecord("king-ledger")?.entity.name).toBe("Stephen King");
    expect(getMaintainRecord("nope")).toBeNull();
  });
});
