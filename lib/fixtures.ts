import type { ResolvedEntity, SourceIdentifier } from "./types";

/**
 * Fixture loader.
 *
 * In v1 the Stage 1 page works against three named fixtures (Stephen King, plus
 * two others added later) shipped as JSON in data/fixtures/. These are real,
 * captured VIAF responses normalized to ResolvedEntity shape.
 *
 * The fixture path is the resolver's fallback when:
 *   - the upstream VIAF call fails (network, timeout, 5xx)
 *   - the proxy is disabled at build time (static export, demos with no network)
 *
 * Fixtures are content-addressed by (curator, id) so any of the source
 * identifiers in a cluster will resolve to the same canonical record.
 */

import kingStephen from "@/data/fixtures/king-stephen.json";

type FixtureRecord = ResolvedEntity;

const FIXTURES: FixtureRecord[] = [
  kingStephen as FixtureRecord,
];

/**
 * Try to resolve a query against the bundled fixtures.
 *
 * Match logic: a fixture matches if the (curator, id) appears either as the
 * fixture's `query` or anywhere in its `sameAs` cluster.
 */
export function fixtureLookup(query: SourceIdentifier): ResolvedEntity | null {
  const curator = query.curator.toUpperCase();
  const id = query.id.trim();

  for (const fixture of FIXTURES) {
    if (
      fixture.query.curator.toUpperCase() === curator &&
      fixture.query.id === id
    ) {
      return markAsFixture(fixture);
    }
    for (const alt of fixture.sameAs) {
      if (alt.curator.toUpperCase() === curator && alt.id === id) {
        return markAsFixture(fixture);
      }
    }
  }
  return null;
}

function markAsFixture(record: ResolvedEntity): ResolvedEntity {
  return { ...record, source: "fixture" };
}

/** Used by the Stage 1 chips — show the fixture cluster headlines on the page. */
export function listFixtures(): ResolvedEntity[] {
  return FIXTURES.map(markAsFixture);
}
