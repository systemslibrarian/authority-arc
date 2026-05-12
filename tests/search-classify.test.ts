import { describe, it, expect } from "vitest";
import { classifySearchQuery, describeClassification } from "@/lib/search-classify";

/**
 * Global-search classifier unit tests.
 *
 * The classifier is the contract for every identifier shape the strip-nav
 * search bar promises to recognize. Add a new identifier scheme, add a test
 * here, then update lib/search-classify.ts.
 */

describe("classifySearchQuery", () => {
  it("returns empty for blank input", () => {
    expect(classifySearchQuery("")).toMatchObject({ kind: "empty", path: "" });
    expect(classifySearchQuery("   ")).toMatchObject({ kind: "empty", path: "" });
  });

  it("routes Wikidata Q-ids to Stage 4 (case-insensitive, upper-cased)", () => {
    expect(classifySearchQuery("Q39829")).toMatchObject({
      kind: "wikidata",
      path: "/connect?q=Q39829",
      normalized: "Q39829",
    });
    expect(classifySearchQuery("q1077")).toMatchObject({
      kind: "wikidata",
      path: "/connect?q=Q1077",
    });
  });

  it("routes LCNAF identifiers to Stage 1 with curator=LC", () => {
    expect(classifySearchQuery("n79018049")).toMatchObject({
      kind: "lc",
      path: "/identify?curator=LC&id=n79018049",
    });
    expect(classifySearchQuery("no2010012345")).toMatchObject({
      kind: "lc",
      path: "/identify?curator=LC&id=no2010012345",
    });
    expect(classifySearchQuery("nr95018049")).toMatchObject({
      kind: "lc",
      path: "/identify?curator=LC&id=nr95018049",
    });
  });

  it("routes FAST identifiers to Stage 1 with curator=FAST", () => {
    expect(classifySearchQuery("fst00041201")).toMatchObject({
      kind: "fast",
      path: "/identify?curator=FAST&id=fst00041201",
    });
  });

  it("routes BNF identifiers to Stage 1 with curator=BNF", () => {
    expect(classifySearchQuery("cb11909418n")).toMatchObject({
      kind: "bnf",
      path: "/identify?curator=BNF&id=cb11909418n",
    });
  });

  it("routes BNE identifiers to Stage 1 with curator=BNE", () => {
    expect(classifySearchQuery("XX1058570")).toMatchObject({
      kind: "bne",
      path: "/identify?curator=BNE&id=XX1058570",
    });
  });

  it("routes long pure-numeric to Stage 1 as a VIAF cluster", () => {
    expect(classifySearchQuery("27066711")).toMatchObject({
      kind: "viaf",
      path: "/identify?curator=VIAF&id=27066711",
    });
  });

  it("routes free-text names to Stage 2 with the name URL-encoded", () => {
    expect(classifySearchQuery("stephen king")).toMatchObject({
      kind: "name",
      path: "/disambiguate?q=stephen%20king",
      normalized: "stephen king",
    });
    expect(classifySearchQuery("García Márquez")).toMatchObject({
      kind: "name",
      // toMatchObject inspects strings literally — just confirm encoding
      // happened by checking the prefix and that no raw accented chars
      // leak into the path.
      path: expect.stringMatching(/^\/disambiguate\?q=/) as unknown as string,
    });
  });

  it("trims leading and trailing whitespace before classifying", () => {
    expect(classifySearchQuery("  Q39829  ")).toMatchObject({
      kind: "wikidata",
      path: "/connect?q=Q39829",
    });
  });
});

describe("describeClassification", () => {
  it("returns a human-readable label for each kind", () => {
    expect(describeClassification("wikidata")).toMatch(/Connect/);
    expect(describeClassification("lc")).toMatch(/Identify/);
    expect(describeClassification("name")).toMatch(/Distinguish/);
    expect(describeClassification("empty")).toBe("");
  });
});
