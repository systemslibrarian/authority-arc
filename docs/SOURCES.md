# Sources & Attribution

The Authority Arc renders public data from several institutional sources. This document is the canonical record of what we use, under what license, and how we credit it.

## VIAF — Virtual International Authority File

- **What we use**: VIAF cluster records via the `/viaf/sourceID/{C}|{id}` endpoint, plus AutoSuggest in Stage 02 (planned).
- **License**: Open Data Commons Attribution License (ODC-BY).
- **Attribution required**: Yes, on any display of VIAF-sourced data.
- **How we credit**:
  - On the page footer of every page that renders VIAF data.
  - On the resolver card under `source: viaf`.
  - In this document.
- **Operator**: OCLC, Inc., on behalf of the participating national authority files.

## OCLC WorldCat Entities API family

- **What we use** (planned, gated on Meridian access): PID Lookup, Entity Search, Entity Connections, Entity Changes, Entity Management, Entity Query.
- **License**: Commercial, via OCLC Meridian subscription.
- **Attribution required**: Yes, on any display of API responses.
- **How we credit**:
  - On the page footer of every page that renders OCLC-sourced data.
  - On the resolver card under `source: oclc-pid-lookup`.
  - In this document.

## Contributing source authorities

VIAF clusters aggregate authority records from these institutions, among others. We render their identifiers and link to them where appropriate.

| Code | Institution | Country |
|------|-------------|---------|
| LC | Library of Congress / NACO | United States |
| DNB | Deutsche Nationalbibliothek | Germany |
| BNF | Bibliothèque nationale de France | France |
| BNE | Biblioteca Nacional de España | Spain |
| NDL | National Diet Library | Japan |
| NLA | National Library of Australia | Australia |
| CAOONL | Library and Archives Canada | Canada |
| WIKIDATA | Wikidata (Wikimedia Foundation) | International |
| ISNI | ISNI International Agency | International |
| FAST | FAST (OCLC) | International |

The full list of VIAF source codes lives at <https://viaf.org/api/source-codes>.

## Affiliation disclosure

This project is **not affiliated with OCLC, the Library of Congress, VIAF, or any of the contributing source authorities.** It is an independent educational work by Paul Clark / systemslibrarian.dev.
