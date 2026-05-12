import type { CuratorInfo } from "./types";

/**
 * Curator registry.
 *
 * Keys are the short codes used by both VIAF (LC, DNB, BNF, ...) and OCLC's
 * PID Lookup (dlcnames, etc.). Where the two systems use different codes for
 * the same authority, we include both as keys pointing at the same record.
 *
 * Source of truth for VIAF source codes:
 *   https://viaf.org/api/source-codes
 *
 * Source for MARC Organization Codes:
 *   https://www.loc.gov/marc/organizations/
 */
export const CURATORS: Record<string, CuratorInfo> = {
  LC: {
    code: "LC",
    label: "Library of Congress / NACO",
    country: "United States",
    marcOrganizationCode: "DLC",
    uriPattern: "http://id.loc.gov/authorities/names/{id}",
    description:
      "The National Authority File maintained by the Library of Congress, the largest single contributor of name authority records to VIAF.",
  },
  dlcnames: {
    code: "dlcnames",
    label: "Library of Congress / NACO",
    country: "United States",
    marcOrganizationCode: "DLC",
    uriPattern: "http://id.loc.gov/authorities/names/{id}",
    description:
      "OCLC's PID Lookup label for the LCNAF — the same body as VIAF's 'LC'.",
  },
  DNB: {
    code: "DNB",
    label: "German National Library",
    country: "Germany",
    marcOrganizationCode: "DE-101",
    uriPattern: "http://d-nb.info/gnd/{id}",
    description:
      "Deutsche Nationalbibliothek — issuer of the Gemeinsame Normdatei (GND) integrated authority file.",
  },
  BNF: {
    code: "BNF",
    label: "National Library of France",
    country: "France",
    marcOrganizationCode: "FrPBN",
    uriPattern: "http://catalogue.bnf.fr/ark:/12148/cb{id}",
    description: "Bibliothèque nationale de France authority records.",
  },
  BNE: {
    code: "BNE",
    label: "National Library of Spain",
    country: "Spain",
    marcOrganizationCode: "SpMaBN",
    uriPattern: "http://datos.bne.es/resource/{id}",
    description: "Biblioteca Nacional de España authority records.",
  },
  NDL: {
    code: "NDL",
    label: "National Diet Library, Japan",
    country: "Japan",
    marcOrganizationCode: "JTNDL",
    uriPattern: "http://id.ndl.go.jp/auth/ndlna/{id}",
  },
  NLA: {
    code: "NLA",
    label: "National Library of Australia",
    country: "Australia",
    marcOrganizationCode: "AuCNLKIN",
    uriPattern: "http://nla.gov.au/anbd.aut-an{id}",
  },
  WIKIDATA: {
    code: "WIKIDATA",
    label: "Wikidata",
    description:
      "A free collaborative knowledge base; in VIAF and OCLC, Q-numbers serve as identifiers.",
    uriPattern: "https://www.wikidata.org/wiki/{id}",
  },
  ISNI: {
    code: "ISNI",
    label: "International Standard Name Identifier",
    description:
      "ISO 27729 — a 16-digit identifier for the public identities of persons and organizations.",
    uriPattern: "https://isni.org/isni/{id}",
  },
  FAST: {
    code: "FAST",
    label: "FAST (Faceted Application of Subject Terminology)",
    description:
      "OCLC's faceted derivation of LCSH. Personal Name facet for biographical headings.",
    uriPattern: "http://id.worldcat.org/fast/{id}",
  },
  fast: {
    code: "fast",
    label: "FAST (Faceted Application of Subject Terminology)",
    description: "OCLC PID Lookup label for FAST — same body as VIAF's 'FAST'.",
    uriPattern: "http://id.worldcat.org/fast/{id}",
  },
  CAOONL: {
    code: "CAOONL",
    label: "Library and Archives Canada",
    country: "Canada",
    marcOrganizationCode: "CaOONL",
  },
  caoonl: {
    code: "caoonl",
    label: "Library and Archives Canada",
    country: "Canada",
    marcOrganizationCode: "CaOONL",
  },
  bne: { code: "bne", label: "National Library of Spain", country: "Spain", marcOrganizationCode: "SpMaBN" },
  bnf: { code: "bnf", label: "National Library of France", country: "France", marcOrganizationCode: "FrPBN" },
  viaf: {
    code: "viaf",
    label: "Virtual International Authority File",
    description:
      "VIAF itself, used as an identifier scheme when other authorities reference the cluster directly.",
    uriPattern: "http://viaf.org/viaf/{id}",
  },
};

export function lookupCurator(code: string): CuratorInfo | undefined {
  return CURATORS[code] ?? CURATORS[code.toUpperCase()] ?? CURATORS[code.toLowerCase()];
}

/** Return all known curator codes (deduplicated by label). */
export function listCurators(): CuratorInfo[] {
  const seen = new Set<string>();
  const out: CuratorInfo[] = [];
  for (const c of Object.values(CURATORS)) {
    if (seen.has(c.label)) continue;
    seen.add(c.label);
    out.push(c);
  }
  return out;
}
