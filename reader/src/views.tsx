import { Block, Chip, EvidenceBadge, InContext, ProofBadge, TranscriptBadge, Verbatim, localName } from "./chrome";
import { useStore } from "./store";
import type { Atlas, Entry, Reasoning } from "./types";

const byIri = <T extends { iri: string }>(xs: T[]) => new Map(xs.map((x) => [x.iri, x]));

/** "Bunge (1979), Definition 1.1: concrete system" -> "Definition 1.1: concrete system".
    The author and year are already the column's context; what distinguishes two
    entries from one book is everything after them. */
const distinguishing = (label: string | null) => (label ?? "").replace(/^[^,]*\(\d{4}\),\s*/, "");

/* ------------------------------------------------------------------ read -- */

export function ReadView({ atlas }: { atlas: Atlas }) {
  const reading = useStore((s) => s.reading);
  const entry = atlas.entries.find((e) => e.iri === reading) ?? atlas.entries[0];
  const bearer = byIri(atlas.bearers).get(entry.statedIn ?? "");
  const prims = byIri(atlas.primitives);
  const t = atlas.transcription[entry.iri];

  return (
    <>
      <Block
        title="The passage"
        note={
          <span className="flex items-center gap-2">
            <TranscriptBadge t={t} />
            {bearer?.label}
          </span>
        }
      >
        <Verbatim text={entry.verbatim} location={entry.sourceLocation} />
        {entry.authorCaveat && (
          <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--hairline)" }}>
            <div className="eyebrow mb-1">The author's own caveat</div>
            <p
              className="m-0 text-sm italic"
              style={{ color: "var(--text-secondary)", maxWidth: "var(--measure-verbatim)" }}
            >
              {entry.authorCaveat}
            </p>
          </div>
        )}
      </Block>

      {t?.context && (
        <Block
          title="In the source"
          note={`${t.source} · ${t.matchedChars}/${t.verbatimChars} characters located`}
        >
          <InContext t={t} />
          {t.normalisations?.length ? (
            <p className="mt-4 mb-0 text-xs" style={{ color: "var(--text-muted)" }}>
              Ignored when matching: {t.normalisations.join("; ")}.
            </p>
          ) : null}
        </Block>
      )}

      <Block
        title="What it posits"
        note={
          atlas.primitives.every((p) => !p.role)
            ? "untyped — lexical only, no signature roles recorded yet"
            : undefined
        }
      >
        <div className="flex flex-wrap gap-2">
          {entry.primitives.map((p) => (
            <Chip key={p}>
              {prims.get(p)?.label ?? localName(p)}
              {prims.get(p)?.role ? ` · ${prims.get(p)!.role}` : ""}
            </Chip>
          ))}
        </div>
      </Block>

      {(entry.includedExamples.length > 0 || entry.excludedExamples.length > 0) && (
        <Block title="What it admits and refuses">
          <Admits included={entry.includedExamples} excluded={entry.excludedExamples} />
        </Block>
      )}

      <Block title="Provenance">
        <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          <EvidenceBadge code={entry.evidenceCode} />
          <span>
            {entry.encodedBy} · {entry.encodedOn}
          </span>
        </div>
        {bearer && (
          <p className="mt-3 mb-0 text-sm" style={{ color: "var(--text-muted)" }}>
            {bearer.label}
            {bearer.identifiers.length > 0 && <> · {bearer.identifiers.join(" · ")}</>}
          </p>
        )}
      </Block>

      {entry.annotation.length > 0 && (
        <Block title="Encoder's apparatus" note="written into the entry, not derived">
          {entry.annotation.map((b, i) => (
            <div key={i} className="mb-4 last:mb-0">
              {b.title && (
                <div
                  className="eyebrow mb-1"
                  style={{ color: b.kind === "flag" ? "var(--proof-not-proven)" : "var(--text-muted)" }}
                >
                  {b.kind === "flag" ? "⚑ " : ""}
                  {b.title}
                </div>
              )}
              <p
                className="m-0 text-sm whitespace-pre-wrap"
                style={{ color: "var(--text-secondary)", maxWidth: "44rem" }}
              >
                {b.body}
              </p>
            </div>
          ))}
        </Block>
      )}
    </>
  );
}

function Admits({ included, excluded }: { included: string[]; excluded: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="eyebrow mb-2" style={{ color: "var(--proof-entailed)" }}>
          Admits
        </div>
        {included.length === 0 ? (
          <Nothing />
        ) : (
          included.map((x) => (
            <p key={x} className="m-0 mb-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              {x}
            </p>
          ))
        )}
      </div>
      <div>
        <div className="eyebrow mb-2" style={{ color: "var(--proof-refuted)" }}>
          Refuses
        </div>
        {excluded.length === 0 ? (
          <Nothing />
        ) : (
          excluded.map((x) => (
            <p key={x} className="m-0 mb-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              {x}
            </p>
          ))
        )}
      </div>
    </div>
  );
}

const Nothing = () => (
  <p className="m-0 text-sm italic" style={{ color: "var(--text-muted)" }}>
    None recorded.
  </p>
);

/* --------------------------------------------------------------- compare -- */

export function CompareView({ atlas }: { atlas: Atlas }) {
  const compared = useStore((s) => s.compared);
  const toggle = useStore((s) => s.toggle);
  const shown = atlas.entries.filter((e) => compared.includes(e.iri));
  const prims = byIri(atlas.primitives);

  return (
    <>
      <Block title="Definitions in view">
        <div className="flex flex-wrap gap-2">
          {atlas.entries.map((e) => (
            <button
              key={e.iri}
              onClick={() => toggle(e.iri)}
              style={{
                background: compared.includes(e.iri) ? "var(--accent)" : "var(--bg-surface)",
                color: compared.includes(e.iri) ? "var(--text-on-accent)" : "var(--text-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
              }}
              className="px-3 py-1 text-sm cursor-pointer"
            >
              {e.label}
            </button>
          ))}
        </div>
      </Block>

      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.max(shown.length, 1)}, minmax(0,1fr))` }}>
        {shown.map((e) => (
          <div key={e.iri} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
            <div
              style={{ background: "var(--accent-soft)", borderBottom: "1px solid var(--border)" }}
              className="px-4 py-2"
            >
              <div className="name-column text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {e.label}
              </div>
            </div>
            <div className="px-4 py-4">
              <Row label="Passage">
                <div
                  className="verbatim"
                  style={{ whiteSpace: "pre-wrap", fontSize: "1.05rem", maxWidth: "none" }}
                >
                  {e.verbatim}
                </div>
              </Row>
              <Row label="Posits">
                <div className="flex flex-wrap gap-1.5">
                  {e.primitives.map((p) => (
                    <Chip key={p}>{prims.get(p)?.label ?? localName(p)}</Chip>
                  ))}
                </div>
              </Row>
              <Row label="Admits">
                <Lines xs={e.includedExamples} />
              </Row>
              <Row label="Refuses">
                <Lines xs={e.excludedExamples} />
              </Row>
              <Row label="Author's caveat">
                {e.authorCaveat ? (
                  <span className="italic">{e.authorCaveat}</span>
                ) : (
                  <span style={{ color: "var(--text-muted)" }}>—</span>
                )}
              </Row>
              <Row label="Evidence">
                <EvidenceBadge code={e.evidenceCode} />
              </Row>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3" style={{ borderBottom: "1px solid var(--hairline)" }}>
      <div className="eyebrow mb-1.5">{label}</div>
      <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {children}
      </div>
    </div>
  );
}

const Lines = ({ xs }: { xs: string[] }) =>
  xs.length === 0 ? (
    <span style={{ color: "var(--text-muted)" }}>—</span>
  ) : (
    <ul className="m-0 pl-4">
      {xs.map((x) => (
        <li key={x} className="mb-1">
          {x}
        </li>
      ))}
    </ul>
  );

/* ---------------------------------------------------------------- census -- */

export function CensusView({ atlas }: { atlas: Atlas }) {
  const untyped = atlas.primitives.every((p) => !p.role);
  return (
    <Block
      title="Primitive census"
      note={`${atlas.primitives.length} primitives across ${atlas.entries.length} entries`}
    >
      {untyped && (
        <p
          className="mt-0 mb-4 text-sm px-3 py-2"
          style={{ background: "var(--bg-surface)", color: "var(--text-secondary)", maxWidth: "48rem" }}
        >
          {atlas.primitiveSchemeScopeNote?.split("\n\n")[0].replace(/^LEXICAL, NOT SEMANTIC\.\s*/, "Lexical, not semantic. ")}
        </p>
      )}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="eyebrow text-left py-2 pr-4" style={{ borderBottom: "2px solid var(--border)" }}>
              Primitive
            </th>
            {atlas.entries.map((e) => (
              <th
                key={e.iri}
                className="eyebrow text-left py-2 px-2 align-bottom"
                style={{ borderBottom: "2px solid var(--border)", width: "9rem" }}
              >
                {distinguishing(e.label)}
              </th>
            ))}
            <th className="eyebrow text-right py-2" style={{ borderBottom: "2px solid var(--border)" }}>
              n
            </th>
          </tr>
        </thead>
        <tbody>
          {atlas.primitives.map((p, i) => (
            <tr key={p.iri} style={{ background: i % 2 ? "var(--bg-primary)" : "transparent" }}>
              <td className="py-1.5 pr-4 name-column" style={{ borderBottom: "1px solid var(--hairline)" }}>
                {p.label}
                {p.role && <span style={{ color: "var(--text-muted)" }}> · {p.role}</span>}
              </td>
              {atlas.entries.map((e) => (
                <td
                  key={e.iri}
                  className="py-1.5 px-2"
                  style={{ borderBottom: "1px solid var(--hairline)" }}
                >
                  {p.usedBy.includes(e.iri) ? (
                    <span style={{ color: "var(--accent)" }}>●</span>
                  ) : (
                    <span style={{ color: "var(--hairline)" }}>·</span>
                  )}
                </td>
              ))}
              <td
                className="py-1.5 text-right tabular-nums"
                style={{ borderBottom: "1px solid var(--hairline)", color: "var(--text-muted)" }}
              >
                {p.usedBy.length}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Block>
  );
}

/* ---------------------------------------------------------------- ledger -- */

export function LedgerView({ atlas }: { atlas: Atlas }) {
  const rows = atlas.entries.flatMap((e) => [
    ...e.includedExamples.map((x) => ({ entry: e, stance: "admits" as const, text: x })),
    ...e.excludedExamples.map((x) => ({ entry: e, stance: "refuses" as const, text: x })),
  ]);

  return (
    <>
      <Block title="Derived conflicts" note="computed by matching admitted against refused examples">
        {atlas.conflicts.length === 0 ? (
          <p className="m-0 text-sm" style={{ color: "var(--text-secondary)", maxWidth: "48rem" }}>
            None. No example is admitted by one entry and refused by another <em>in the recorded data</em>.
            The catalogue does assert one such clash — Bunge's refusal of “a collection of events, even if
            ordered” against Klir — but Klir's side of it lives in Bunge's annotation rather than in Klir's
            entry, so it cannot be derived here. Authored claims appear below; derived ones would appear
            in this block.
          </p>
        ) : (
          atlas.conflicts.map((c) => (
            <div key={c.example} className="mb-3">
              <div className="text-sm font-semibold">{c.example}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                admitted by {c.admittedBy.length} · refused by {c.refusedBy.length}
              </div>
            </div>
          ))
        )}
      </Block>

      <Block title="Examples ledger" note={`${rows.length} recorded across ${atlas.entries.length} entries`}>
        <table className="w-full text-sm border-collapse">
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td
                  className="py-2 pr-3 align-top"
                  style={{ borderBottom: "1px solid var(--hairline)", width: "6rem" }}
                >
                  <span
                    className="eyebrow"
                    style={{ color: r.stance === "admits" ? "var(--proof-entailed)" : "var(--proof-refuted)" }}
                  >
                    {r.stance}
                  </span>
                </td>
                <td className="py-2 pr-3" style={{ borderBottom: "1px solid var(--hairline)" }}>
                  {r.text}
                </td>
                <td
                  className="py-2 name-column text-right align-top"
                  style={{ borderBottom: "1px solid var(--hairline)", color: "var(--text-muted)", width: "16rem" }}
                >
                  {distinguishing(r.entry.label)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Block>
    </>
  );
}

/* ----------------------------------------------------------- commitments -- */

export function CommitmentsView({ reasoning }: { reasoning: Reasoning }) {
  const variant = useStore((s) => s.variant);
  const setVariant = useStore((s) => s.setVariant);
  const v = reasoning.variants[variant];

  return (
    <>
      <Block title="Import closure" note="the same entries, read against two different sets of imported axioms">
        <div className="flex gap-2">
          {(["shipped", "full"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setVariant(k)}
              style={{
                background: variant === k ? "var(--accent)" : "var(--bg-surface)",
                color: variant === k ? "var(--text-on-accent)" : "var(--text-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
              }}
              className="px-3 py-1.5 text-sm cursor-pointer"
            >
              {reasoning.variants[k].label}
            </button>
          ))}
        </div>
      </Block>

      <Block title="What the entries are committed to" note={v.label}>
        {v.commitments.map((c) => (
          <div key={c.id} className="mb-5 last:mb-0">
            <div className="flex items-baseline gap-3 mb-1">
              <ProofBadge status={c.verdict} bounded={c.bounded} />
              <span className="text-sm font-semibold">{c.question}</span>
            </div>
            <p className="m-0 text-sm" style={{ color: "var(--text-secondary)", maxWidth: "46rem" }}>
              {c.matters}
            </p>
          </div>
        ))}
      </Block>

      <Block title="Why" note="one minimal justification per entailment, from the reasoner">
        {v.justifications.map((j, i) => (
          <div key={i} className="mb-4 last:mb-0">
            <div className="eyebrow mb-1">
              {term(j.sub, v.labels)} ⊑ {term(j.sup, v.labels)}
            </div>
            {j.axioms.length === 0 ? (
              <p className="m-0 text-sm italic" style={{ color: "var(--text-muted)" }}>
                Not entailed under this closure{j.note ? ` (${j.note})` : ""}.
              </p>
            ) : (
              <ul className="m-0 pl-4">
                {j.axioms.map((a, k) => (
                  <li
                    key={k}
                    className="text-xs mb-1"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}
                  >
                    {readable(a, v.labels)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </Block>

      <Block title="What the reasoner could not represent" note="a sound under-approximation, reported rather than swallowed">
        {Object.keys(v.droppedAxioms).length === 0 ? (
          <p className="m-0 text-sm" style={{ color: "var(--text-secondary)" }}>
            Nothing dropped. Consistent: {String(v.consistent)}.
          </p>
        ) : (
          <ul className="m-0 pl-4 text-sm" style={{ color: "var(--text-secondary)" }}>
            {Object.entries(v.droppedAxioms).map(([k, n]) => (
              <li key={k}>
                {k} — {n}
              </li>
            ))}
          </ul>
        )}
      </Block>
    </>
  );
}

export function EntryRail({ entries }: { entries: Entry[] }) {
  const reading = useStore((s) => s.reading);
  const read = useStore((s) => s.read);
  return (
    <nav style={{ borderRight: "1px solid var(--border)", background: "var(--bg-secondary)" }} className="w-72 shrink-0">
      <div
        className="eyebrow px-4 py-2"
        style={{ background: "var(--accent-soft)", borderBottom: "1px solid var(--border)" }}
      >
        Entries
      </div>
      {entries.map((e, i) => (
        <button
          key={e.iri}
          onClick={() => read(e.iri)}
          className="w-full text-left flex cursor-pointer"
          style={{
            borderBottom: "1px solid var(--border)",
            background: reading === e.iri ? "var(--bg-primary)" : "transparent",
          }}
        >
          <span
            className="px-3 py-3 tabular-nums text-xs shrink-0"
            style={{ background: "var(--accent-soft)", color: "var(--text-muted)" }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="px-3 py-3">
            <span className="name-column text-sm block" style={{ color: "var(--text-primary)" }}>
              {e.label}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {e.sourceLocation}
            </span>
          </span>
        </button>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------- axiom ink -- */

/** A term's label if the closure carried one, else its local name. */
function term(iri: string, labels: Record<string, string>) {
  const ln = localName(iri);
  return labels[ln] ?? ln;
}

/**
 * A Manchester axiom, made readable.
 *
 * Substitutes labels for term IRIs and leaves the operators alone. This changes
 * the presentation of the reasoner's output, never its content -- the axiom is
 * generated here, so setting it legibly is our own typography, not a source
 * being altered.
 */
function readable(axiom: string, labels: Record<string, string>) {
  return axiom.replace(/<([^>]+)>/g, (_, iri: string) => {
    const ln = iri.split(/[/#]/).pop() ?? iri;
    return labels[ln] ?? ln;
  });
}
