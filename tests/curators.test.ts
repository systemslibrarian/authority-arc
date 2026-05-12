import { describe, it, expect } from "vitest";
import { lookupCurator, listCurators } from "@/lib/curators";

describe("lib/curators", () => {
  it("looks up LC by exact code", () => {
    const c = lookupCurator("LC");
    expect(c).toBeDefined();
    expect(c?.label).toMatch(/Library of Congress/);
    expect(c?.marcOrganizationCode).toBe("DLC");
  });

  it("looks up curators case-insensitively", () => {
    expect(lookupCurator("lc")?.label).toMatch(/Library of Congress/);
    expect(lookupCurator("DNB")?.label).toMatch(/German/);
    expect(lookupCurator("dnb")?.label).toMatch(/German/);
  });

  it("returns undefined for unknown codes", () => {
    expect(lookupCurator("NOT_A_REAL_CODE")).toBeUndefined();
  });

  it("treats OCLC PID Lookup codes (dlcnames) and VIAF codes (LC) as the same institution", () => {
    const viafLc = lookupCurator("LC");
    const oclcDlc = lookupCurator("dlcnames");
    expect(viafLc?.marcOrganizationCode).toBe(oclcDlc?.marcOrganizationCode);
  });

  it("listCurators returns each institution once (deduplicated by label)", () => {
    const curators = listCurators();
    const labels = curators.map((c) => c.label);
    const unique = new Set(labels);
    expect(labels.length).toBe(unique.size);
  });

  it("includes the major source authorities", () => {
    const labels = listCurators().map((c) => c.label);
    expect(labels.some((l) => l.includes("Library of Congress"))).toBe(true);
    expect(labels.some((l) => l.includes("German National"))).toBe(true);
    expect(labels.some((l) => l.includes("France"))).toBe(true);
    expect(labels.some((l) => l.includes("Wikidata"))).toBe(true);
  });
});
