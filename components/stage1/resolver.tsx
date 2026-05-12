"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

interface ResolverProps {
  /**
   * Server-seeded fixture so the first visit to /identify isn't blank. Used
   * only when the URL has no curator/id params. Click "Resolve" to refresh
   * the same record against live VIAF.
   */
  initial?: ResolvedEntity;
}

export function Resolver({ initial }: ResolverProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramCurator = searchParams.get("curator");
  const paramId = searchParams.get("id");

  const [curator, setCurator] = useState(paramCurator ?? initial?.query.curator ?? "LC");
  const [id, setId] = useState(paramId ?? initial?.query.id ?? "n79018049");
  const [state, setState] = useState<State>(
    initial && !paramCurator && !paramId
      ? { kind: "resolved", data: initial }
      : { kind: "idle" }
  );
  const [validation, setValidation] = useState<{ curator?: string; id?: string }>({});

  // Update the URL after a successful (curator,id) request, without scroll.
  const pushUrl = useCallback(
    (c: string, i: string) => {
      const qs = new URLSearchParams({ curator: c, id: i }).toString();
      router.replace(`${pathname}?${qs}`, { scroll: false });
    },
    [router, pathname]
  );

  const resolve = useCallback(
    async (c: string, i: string, options?: { skipUrlUpdate?: boolean }) => {
      const cTrim = c.trim();
      const iTrim = i.trim();
      const next: { curator?: string; id?: string } = {};
      if (!cTrim) next.curator = "Curator code is required.";
      if (!iTrim) next.id = "Identifier is required.";
      setValidation(next);
      if (next.curator || next.id) return;

      setCurator(cTrim);
      setId(iTrim);
      setState({ kind: "loading" });
      try {
        const res = await fetch("/api/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ curator: cTrim, id: iTrim }),
        });
        if (!res.ok) {
          const err = (await res.json()) as ResolveError;
          setState({ kind: "error", error: err });
          return;
        }
        const data = (await res.json()) as ResolvedEntity;
        setState({ kind: "resolved", data });
        if (!options?.skipUrlUpdate) pushUrl(cTrim, iTrim);
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
    },
    [pushUrl]
  );

  // On mount (or when URL params change via back/forward), if URL specifies a
  // (curator, id) that isn't already showing as the resolved record, fetch it.
  useEffect(() => {
    if (!paramCurator || !paramId) return;
    setCurator(paramCurator);
    setId(paramId);
    const showing = state.kind === "resolved" ? state.data.query : null;
    if (
      showing &&
      showing.curator.toUpperCase() === paramCurator.toUpperCase() &&
      showing.id === paramId
    ) {
      return; // already showing this record
    }
    resolve(paramCurator, paramId, { skipUrlUpdate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramCurator, paramId]);

  return (
    <>
      {/* resolver shell */}
      <div className="mb-7 rounded-[2px] border border-paper-edge bg-paper-deep p-5 shadow-paper sm:p-9">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            resolve(curator, id);
          }}
          aria-describedby="resolver-help"
          aria-busy={state.kind === "loading"}
          noValidate
        >
          <div className="flex-shrink-0 sm:w-[120px]">
            <label
              htmlFor="pid-curator"
              className="mb-1.5 block font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint"
            >
              Curator
            </label>
            <input
              id="pid-curator"
              name="curator"
              value={curator}
              onChange={(e) => {
                setCurator(e.target.value);
                if (validation.curator) setValidation((v) => ({ ...v, curator: undefined }));
              }}
              className={`w-full rounded-[2px] border bg-paper px-3 py-3 font-mono text-[14px] uppercase tracking-[.05em] text-ink outline-none focus:ring-[3px] focus:ring-oxblood/20 ${
                validation.curator
                  ? "border-oxblood focus:border-oxblood"
                  : "border-rule focus:border-oxblood"
              }`}
              placeholder="LC"
              autoComplete="off"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
              aria-invalid={validation.curator ? true : undefined}
              aria-describedby={validation.curator ? "pid-curator-error" : undefined}
            />
            {validation.curator && (
              <p
                id="pid-curator-error"
                role="alert"
                className="mt-1.5 font-mono text-[10px] uppercase tracking-eyebrow text-oxblood"
              >
                {validation.curator}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label
              htmlFor="pid-id"
              className="mb-1.5 block font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint"
            >
              Identifier
            </label>
            <input
              id="pid-id"
              name="identifier"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                if (validation.id) setValidation((v) => ({ ...v, id: undefined }));
              }}
              className={`w-full rounded-[2px] border bg-paper px-4 py-3 font-mono text-[14px] text-ink outline-none focus:ring-[3px] focus:ring-oxblood/20 ${
                validation.id
                  ? "border-oxblood focus:border-oxblood"
                  : "border-rule focus:border-oxblood"
              }`}
              placeholder="n79018049"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
              aria-invalid={validation.id ? true : undefined}
              aria-describedby={validation.id ? "pid-id-error" : undefined}
            />
            {validation.id && (
              <p
                id="pid-id-error"
                role="alert"
                className="mt-1.5 font-mono text-[10px] uppercase tracking-eyebrow text-oxblood"
              >
                {validation.id}
              </p>
            )}
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={state.kind === "loading"}
              className="tap-target w-full rounded-[2px] bg-ink px-6 py-3 font-mono text-[11px] uppercase tracking-eyebrow text-paper transition-colors hover:bg-oxblood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-paper-deep disabled:opacity-60 sm:w-auto"
              aria-label="Resolve identifier"
            >
              {state.kind === "loading" ? "Resolving…" : (
                <>Resolve<span aria-hidden="true"> →</span></>
              )}
            </button>
          </div>
        </form>

        <p
          id="resolver-help"
          className="mt-4 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint"
        >
          Paste a persistent identifier, or try one below — all reference Stephen King.
        </p>

        <div
          role="group"
          aria-label="Example identifiers"
          className="mt-3 flex flex-wrap gap-2"
        >
          {STARTER_CHIPS.map((chip) => (
            <button
              key={chip.curator + chip.id}
              type="button"
              onClick={() => resolve(chip.curator, chip.id)}
              className="rounded-[2px] border border-rule bg-paper px-3 py-1.5 font-mono text-[11px] text-ink transition-all hover:border-oxblood hover:text-oxblood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-paper-deep"
              aria-label={`Try ${chip.curator} identifier ${chip.label}`}
            >
              <span className="mr-2 text-ink-faint">{chip.curator.toLowerCase()}</span>
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* live region — screen readers hear resolution outcomes */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {state.kind === "loading" && "Resolving identifier…"}
        {state.kind === "resolved" && `Resolved ${state.data.query.curator} ${state.data.query.id} to ${state.data.label ?? "an entity"} with ${state.data.sameAs.length} related identifiers. Source: ${describeSource(state.data.source)}.`}
        {state.kind === "error" && `Resolution failed: ${state.error.message}`}
      </div>

      {/* resolved card */}
      {state.kind === "resolved" && <ResolvedCard data={state.data} />}

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

function ResolvedCard({ data }: { data: ResolvedEntity }) {
  const [openNote, setOpenNote] = useState<string | null>(null);
  // Restoring focus to the trigger that opened an annotation when it closes.
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const openAnnotation = useCallback((noteId: string, trigger: HTMLButtonElement | null) => {
    triggerRef.current = trigger;
    setOpenNote(noteId);
  }, []);

  const closeAnnotation = useCallback(() => {
    setOpenNote(null);
    // Run on the next frame so the annotation has unmounted and focus
    // can land cleanly on the trigger.
    const el = triggerRef.current;
    if (el) requestAnimationFrame(() => el.focus());
  }, []);

  useEffect(() => {
    if (!openNote) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeAnnotation();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openNote, closeAnnotation]);

  return (
    <div className="animate-fade-up overflow-hidden rounded-[2px] border border-rule bg-paper shadow-paper">
      {/* header strip */}
      <div className="flex flex-col gap-2 bg-ink px-5 py-3 font-mono text-[10px] uppercase tracking-eyebrow text-paper sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3.5">
        <span className="break-all">
          {data.wire.requestMethod} {prettyEndpointFor(data)} · {data.wire.responseStatus} OK
        </span>
        <ProvenancePill source={data.source} />
      </div>

      <div className="p-5 sm:p-8">
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

        <Field label="Canonical URI" copyValue={data.canonicalUri}>
          <Annotated
            id="uri"
            openNote={openNote}
            onOpen={openAnnotation}
          >
            {data.canonicalUri}
          </Annotated>
        </Field>

        <Annotation
          id="uri"
          open={openNote === "uri"}
          onClose={closeAnnotation}
          title="The URI on top of the identifiers"
        >
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
          <Annotated
            id="curator"
            openNote={openNote}
            onOpen={openAnnotation}
          >
            {data.query.curator}
          </Annotated>
          {data.query.curatorLabel && (
            <span className="ml-2 text-ink-faint">
              ({data.query.curatorLabel})
            </span>
          )}
        </Field>

        <Annotation
          id="curator"
          open={openNote === "curator"}
          onClose={closeAnnotation}
          title="A curator is not a database. It is an obligation."
        >
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

        <Field label="Identifier" copyValue={data.query.id}>
          <span className="font-mono text-[13px] text-ink">{data.query.id}</span>
        </Field>

        <Field label="entityMd5">
          {data.entityMd5 ? (
            <Annotated
              id="md5"
              openNote={openNote}
              onOpen={openAnnotation}
            >
              {data.entityMd5}
            </Annotated>
          ) : (
            <Annotated
              id="md5-absent"
              openNote={openNote}
              onOpen={openAnnotation}
            >
              <em className="italic text-ink-faint">not published by this source</em>
            </Annotated>
          )}
        </Field>

        <Annotation
          id="md5"
          open={openNote === "md5"}
          onClose={closeAnnotation}
          title="The fingerprint underneath the name"
        >
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

        <Annotation
          id="md5-absent"
          open={openNote === "md5-absent"}
          onClose={closeAnnotation}
          title="VIAF does not publish a content hash"
        >
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
                  className="grid grid-cols-[88px_1fr] gap-3 font-mono text-[12.5px] sm:grid-cols-[100px_1fr]"
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

function describeSource(source: ResolvedEntity["source"]): string {
  if (source === "viaf") return "live VIAF";
  if (source === "oclc-pid-lookup") return "OCLC PID Lookup";
  return "bundled fixture";
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

// ────────────────────────────────────────────────────────────────────────────
// Provenance pill: tells the visitor at a glance whether the record they're
// looking at came from live VIAF, the bundled offline fixture, or OCLC.
// ────────────────────────────────────────────────────────────────────────────

function ProvenancePill({ source }: { source: ResolvedEntity["source"] }) {
  const { dot, label } = pillStyle(source);
  return (
    <span
      className="inline-flex items-center gap-2 normal-case"
      title={
        source === "viaf"
          ? "Live response from VIAF."
          : source === "fixture"
          ? "Bundled fixture — a captured VIAF response served when the page loads or VIAF is unreachable."
          : "Live response from OCLC PID Lookup."
      }
    >
      <span aria-hidden="true" className={`inline-block h-2 w-2 rounded-full ${dot}`} />
      <span>{label}</span>
    </span>
  );
}

function pillStyle(source: ResolvedEntity["source"]): { dot: string; label: string } {
  if (source === "viaf") return { dot: "bg-[#b8d4a8]", label: "Live · VIAF" };
  if (source === "oclc-pid-lookup") return { dot: "bg-[#b8d4a8]", label: "Live · OCLC" };
  return { dot: "bg-ochre", label: "Fixture fallback" };
}

// ────────────────────────────────────────────────────────────────────────────
// Copy-to-clipboard helper, used inline next to identifiers and URIs.
// ────────────────────────────────────────────────────────────────────────────

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (insecure context, etc). Fail quietly —
      // the value is still visible and selectable in the field.
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className="inline-flex items-center gap-1 rounded-[2px] border border-rule bg-paper px-2 py-1 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint transition-colors hover:border-oxblood hover:text-oxblood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
    >
      <span aria-hidden="true">{copied ? "✓" : "⧉"}</span>
      <span>{copied ? "copied" : "copy"}</span>
    </button>
  );
}

// ── tiny helpers ─────────────────────────────────────────────────────────────

function Field({
  label,
  copyValue,
  children,
}: {
  label: string;
  copyValue?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-paper-edge py-3.5 last:border-b-0 sm:grid sm:grid-cols-[140px_1fr] sm:items-start sm:gap-4">
      <div className="pt-1 font-mono text-[10px] uppercase tracking-eyebrow text-ink-faint">
        {label}
      </div>
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1 break-all font-mono text-[13px] text-ink">{children}</div>
        {copyValue && <CopyButton value={copyValue} label={label} />}
      </div>
    </div>
  );
}

function Annotated({
  id,
  openNote,
  onOpen,
  children,
}: {
  id: string;
  openNote: string | null;
  onOpen: (noteId: string, trigger: HTMLButtonElement | null) => void;
  children: React.ReactNode;
}) {
  const active = openNote === id;
  return (
    <button
      type="button"
      onClick={(e) => onOpen(id, e.currentTarget)}
      aria-expanded={active}
      aria-controls={`note-${id}`}
      className={`cursor-pointer border-b border-dotted border-oxblood pb-0.5 text-left transition-colors hover:bg-oxblood/[.06] focus-visible:bg-oxblood/[.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${active ? "bg-oxblood/[.06]" : ""}`}
    >
      {children}
      <span className="sr-only">
        {active ? " (annotation open, press Escape to close)" : " (open annotation)"}
      </span>
    </button>
  );
}

function Annotation({
  id,
  open,
  title,
  onClose,
  children,
}: {
  id: string;
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      id={`note-${id}`}
      role="region"
      aria-labelledby={`note-${id}-title`}
      className="relative my-5 animate-fade-up border-l-[3px] border-oxblood bg-paper-deep px-5 py-5 font-display text-[15.5px] leading-[1.6] text-ink-soft sm:px-6"
    >
      <div className="flex items-start justify-between gap-3">
        <h4
          id={`note-${id}-title`}
          className="m-0 mb-2.5 font-display text-[14px] font-medium uppercase tracking-eyebrow text-oxblood"
        >
          {title}
        </h4>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close annotation"
          className="-mr-1 -mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[2px] font-mono text-[14px] text-ink-faint transition-colors hover:bg-paper hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div>{children}</div>
    </div>
  );
}
