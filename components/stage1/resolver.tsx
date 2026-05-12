"use client";

import { useState } from "react";
import type { ResolvedEntity, ResolveError } from "@/lib/types";

const STARTER_CHIPS = [
  { curator: "LC",       id: "n79018049",   label: "n79018049" },
  { curator: "VIAF",     id: "27066711",    label: "27066711" },
  { curator: "WIKIDATA", id: "Q39829",      label: "Q39829" },
  { curator: "DNB",      id: "118562525",   label: "118562525" },
  { curator: "FAST",     id: "fst00041201", label: "fst00041201" },
  { curator: "BNE",      id: "XX1058570",   label: "XX1058570" },
];

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "resolved"; data: ResolvedEntity }
  | { kind: "error"; error: ResolveError };

export function Resolver() {
  const [curator, setCurator] = useState("LC");
  const [id, setId] = useState("n79018049");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [openNote, setOpenNote] = useState<string | null>(null);

  async function resolve(c: string, i: string) {
    setCurator(c);
    setId(i);
    setState({ kind: "loading" });
    setOpenNote(null);
    try {
      const res = await fetch("/api/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curator: c, id: i }),
      });
      if (!res.ok) {
        const err = (await res.json()) as ResolveError;
        setState({ kind: "error", error: err });
        return;
      }
      const data = (await res.json()) as ResolvedEntity;
      setState({ kind: "resolved", data });
    } catch (e: any) {
      setState({
        kind: "error",
        error: {
          error: true,
          status: 0,
          code: "UNKNOWN",
          message: e?.message ?? "Network error",
        },
      });
    }
  }

  return (
    <>
      {/* resolver shell */}
      <div className="mb-7 rounded-[2px] border border-paper-edge bg-paper-deep p-9 shadow-paper">
        <label
          htmlFor="pid-curator"
          className="mb-2.5 block font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint"
        >
          Paste a persistent identifier
        </label>
        <form
          className="flex gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            resolve(curator, id);
          }}
        >
          <input
            id="pid-curator"
            value={curator}
            onChange={(e) => setCurator(e.target.value)}
            className="w-[100px] rounded-[2px] border border-rule bg-paper px-3 py-3.5 font-mono text-[13px] uppercase tracking-[.05em] text-ink outline-none focus:border-oxblood focus:ring-[3px] focus:ring-oxblood/10"
            placeholder="LC"
            aria-label="Curator code"
          />
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="flex-1 rounded-[2px] border border-rule bg-paper px-4 py-3.5 font-mono text-[14px] text-ink outline-none focus:border-oxblood focus:ring-[3px] focus:ring-oxblood/10"
            placeholder="n79018049"
            aria-label="Identifier value"
          />
          <button
            type="submit"
            disabled={state.kind === "loading"}
            className="rounded-[2px] bg-ink px-6 font-mono text-[11px] uppercase tracking-eyebrow text-paper transition-colors hover:bg-oxblood disabled:opacity-50"
          >
            {state.kind === "loading" ? "Resolving…" : "Resolve →"}
          </button>
        </form>

        <div className="mt-5 flex flex-wrap gap-2">
          <p className="w-full mb-1 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
            Or try one of these — all known references to Stephen King
          </p>
          {STARTER_CHIPS.map((chip) => (
            <button
              key={chip.curator + chip.id}
              onClick={() => resolve(chip.curator, chip.id)}
              className="rounded-[2px] border border-rule bg-paper px-3 py-1.5 font-mono text-[11px] text-ink transition-all hover:border-oxblood hover:text-oxblood"
            >
              <span className="mr-2 text-ink-faint">{chip.curator.toLowerCase()}</span>
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* resolved card */}
      {state.kind === "resolved" && (
        <ResolvedCard
          data={state.data}
          openNote={openNote}
          setOpenNote={setOpenNote}
        />
      )}

      {state.kind === "error" && (
        <div className="rounded-[2px] border border-oxblood/40 bg-paper p-6">
          <p className="font-mono text-[11px] uppercase tracking-eyebrow text-oxblood">
            Resolution failed · HTTP {state.error.status}
          </p>
          <p className="mt-2 font-display text-[16px] text-ink">
            {state.error.message}
          </p>
          <p className="mt-3 font-display text-[14px] italic text-ink-faint">
            Stage 1 deliberately surfaces failure cases. They are part of the
            lesson — an identifier without a working curator is just a string.
          </p>
        </div>
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// The resolved card — a museum placard rendered from the API response.
// ────────────────────────────────────────────────────────────────────────────

function ResolvedCard({
  data,
  openNote,
  setOpenNote,
}: {
  data: ResolvedEntity;
  openNote: string | null;
  setOpenNote: (n: string | null) => void;
}) {
  const toggle = (n: string) => setOpenNote(openNote === n ? null : n);

  return (
    <div className="animate-fade-up overflow-hidden rounded-[2px] border border-rule bg-paper shadow-paper">
      {/* header strip */}
      <div className="flex items-center justify-between bg-ink px-6 py-3.5 font-mono text-[10px] uppercase tracking-eyebrow text-paper">
        <span>
          {data.wire.requestMethod} {prettyEndpointFor(data)} · {data.wire.responseStatus} OK
        </span>
        <span className="text-[#b8d4a8]">
          ● resolved · source: {data.source}
        </span>
      </div>

      <div className="p-8">
        {/* label */}
        {data.label && (
          <div className="mb-6 border-b border-paper-edge pb-5">
            <div className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
              {data.nameType ?? "Entity"}
            </div>
            <div className="mt-1 font-display text-[26px] font-[380] tracking-[-0.01em]">
              {data.label}
            </div>
          </div>
        )}

        <Field label="Canonical URI">
          <Annotated id="uri" openNote={openNote} setOpenNote={toggle}>
            {data.canonicalUri}
          </Annotated>
        </Field>

        <Annotation id="uri" open={openNote === "uri"} title="The URI on top of the identifiers">
          This URL is the meta-identifier — a single persistent reference that
          survives any one source catalog going dark, rebranding, or restructuring
          its identifier scheme. The Library of Congress could disappear tomorrow
          and the Wikidata Q-number could be deprecated next year, but this URI
          is supposed to remain stable. <em>Supposed to.</em>
          <br /><br />
          Persistence is not a property of an identifier. It is a property of the{" "}
          <em>institution</em> that promises to keep resolving it.
        </Annotation>

        <Field label="Curator">
          <Annotated id="curator" openNote={openNote} setOpenNote={toggle}>
            {data.query.curator}
          </Annotated>
          {data.query.curatorLabel && (
            <span className="ml-2 text-ink-faint">
              ({data.query.curatorLabel})
            </span>
          )}
        </Field>

        <Annotation id="curator" open={openNote === "curator"} title="A curator is not a database. It is an obligation.">
          The OCLC PID Lookup API has a second endpoint{" "}
          <code className="font-mono text-[0.9em]">GET /v1/pid-lookup/curator</code>{" "}
          that returns metadata about <em>who</em> issued an identifier — the
          MARC organization code, the URI pattern, the entity label.
          <br /><br />
          The lesson: the same string in two different catalogs may mean two
          entirely different things. Identifiers are <em>namespaced</em> — and
          librarians have known this since the mid-twentieth century, decades
          before URIs and DNS were named.
        </Annotation>

        <Field label="Identifier">
          <span className="font-mono text-[13px] text-ink">{data.query.id}</span>
        </Field>

        <Field label="entityMd5">
          {data.entityMd5 ? (
            <Annotated id="md5" openNote={openNote} setOpenNote={toggle}>
              {data.entityMd5}
            </Annotated>
          ) : (
            <Annotated id="md5-absent" openNote={openNote} setOpenNote={toggle}>
              <em className="italic text-ink-faint">not published by this source</em>
            </Annotated>
          )}
        </Field>

        <Annotation id="md5" open={openNote === "md5"} title="The fingerprint underneath the name">
          Every WorldCat entity is published with an MD5 hash of its own content,{" "}
          <em>computed by OCLC.</em> Change a single field on the entity — correct
          a birth year, add a pseudonym, merge in a duplicate — and OCLC
          re-computes the hash. Downstream consumers compare the hash they have
          on file against the one in the latest response, and re-fetch only when
          they differ.
          <br /><br />
          It is a quiet, important architectural decision: the system is{" "}
          <em>both</em> name-addressed (by URI) and content-addressed (by MD5).
          <br /><br />
          <span className="block border-t border-paper-edge pt-3 mt-3 text-[13px] italic text-ink-faint">
            A note on the primitive, and on trust: MD5 is cryptographically broken
            — collisions can be constructed in seconds on a laptop. That is fine
            here because the goal is change-detection, not tamper-evidence, and
            because <em>we are trusting OCLC's hash of OCLC's own record.</em> If
            we wanted to verify the record against a hash we did not have to
            trust OCLC for — if we wanted a signature, not a fingerprint — the
            primitive would need to be SHA-256 or stronger, and signed by a key
            we could check independently. We return to this in Stage 5: Maintain.
          </span>
        </Annotation>

        <Annotation id="md5-absent" open={openNote === "md5-absent"} title="VIAF does not publish a content hash">
          VIAF clusters are versioned by date, but the cluster record itself
          does not ship with a content fingerprint. To detect that a cluster
          has changed, a consumer must re-fetch and diff the whole record.
          <br /><br />
          OCLC's newer WorldCat Entities API <em>does</em> publish an{" "}
          <code className="font-mono text-[0.9em]">entityMd5</code> field on
          every response. When Authority Arc has Entities API access provisioned,
          this field will populate for OCLC-sourced lookups.
        </Annotation>

        {data.sameAs.length > 0 && (
          <Field label="sameAs">
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {data.sameAs.map((s, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[100px_1fr] gap-3 font-mono text-[12.5px]"
                >
                  <span className="pt-0.5 text-[10px] uppercase tracking-eyebrow text-oxblood">
                    {s.curator}
                  </span>
                  <span className="text-ink">{s.id}</span>
                </li>
              ))}
            </ul>
          </Field>
        )}

        {/* wire view */}
        <details className="mt-8 border-t border-rule pt-6 group">
          <summary className="cursor-pointer list-none py-2 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint hover:text-ink">
            <span className="text-oxblood mr-1 group-open:hidden">▸</span>
            <span className="text-oxblood mr-1 hidden group-open:inline">▾</span>
            See the request &amp; response on the wire
          </summary>
          <pre className="mt-3.5 overflow-x-auto rounded-[2px] bg-ink p-5 font-mono text-[12px] leading-[1.6] text-[#d4cfb8]">
{formatWire(data)}
          </pre>
          <p className="mt-3 font-display text-[13px] italic text-ink-faint">
            This is what {data.source === "viaf" ? "VIAF" : data.source === "fixture" ? "the bundled fixture" : "OCLC"} returned, normalized to a stable shape. The full upstream payload contains more fields than we render here.
          </p>
        </details>
      </div>
    </div>
  );
}

function prettyEndpointFor(d: ResolvedEntity): string {
  if (d.source === "viaf") return "GET /viaf/sourceID/{C}|{id}";
  if (d.source === "oclc-pid-lookup") return "POST /v1/pid-lookup";
  return "FIXTURE";
}

function formatWire(d: ResolvedEntity): string {
  return [
    `${d.wire.requestMethod} ${d.wire.requestUrl}`,
    `Accept: application/json`,
    ``,
    d.wire.requestBody ? JSON.stringify(d.wire.requestBody, null, 2) + "\n" : "",
    `${d.wire.responseStatus} OK · fetched ${d.wire.fetchedAt}`,
    JSON.stringify(
      {
        canonicalUri: d.canonicalUri,
        query: d.query,
        entityMd5: d.entityMd5 ?? null,
        label: d.label,
        nameType: d.nameType,
        sameAs: d.sameAs,
      },
      null,
      2
    ),
  ]
    .filter(Boolean)
    .join("\n");
}

// ── tiny helpers ─────────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-4 border-b border-paper-edge py-3.5 last:border-b-0">
      <div className="pt-1 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
        {label}
      </div>
      <div className="break-all font-mono text-[13px] text-ink">{children}</div>
    </div>
  );
}

function Annotated({
  id,
  openNote,
  setOpenNote,
  children,
}: {
  id: string;
  openNote: string | null;
  setOpenNote: (id: string) => void;
  children: React.ReactNode;
}) {
  const active = openNote === id;
  return (
    <button
      type="button"
      onClick={() => setOpenNote(id)}
      className={`cursor-pointer border-b border-dotted border-oxblood pb-0.5 text-left transition-colors hover:bg-oxblood/[.06] ${active ? "bg-oxblood/[.06]" : ""}`}
    >
      {children}
    </button>
  );
}

function Annotation({
  id,
  open,
  title,
  children,
}: {
  id: string;
  open: boolean;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      id={`note-${id}`}
      className="my-5 animate-fade-up border-l-[3px] border-oxblood bg-paper-deep px-6 py-5 font-display text-[15.5px] leading-[1.6] text-ink-soft"
    >
      <h4 className="m-0 mb-2.5 font-display text-[14px] font-medium uppercase tracking-eyebrow text-oxblood">
        {title}
      </h4>
      <div>{children}</div>
    </div>
  );
}
