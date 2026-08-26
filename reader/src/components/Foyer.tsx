/**
 * The front page's three instruments: the shelf, the disagreement line, the
 * trust line.
 *
 * The foyer's job is invitation, and the invitation is the material itself —
 * so the shelf shows the authors' own words, in the passage register. One card
 * per AUTHOR, every definition of theirs stacked inside it chronologically:
 * where an author revised, the card shows the revision instead of electing a
 * favourite. Each definition — not the card — is the door into its entry.
 * Everything editorial is set smaller than what it introduces.
 *
 * The card is quote-forward: the glyph's one computed number carries the
 * accretion story, and the apparatus (floor roles, additions, context) lives
 * on the entry page. Rigor is a pipeline property — the gates and the
 * computed ordering are unchanged by showing less ink — but exceptions are
 * not detail: the badge rows render here whenever a quote falls short of the
 * good state.
 *
 * These take data and callbacks; wiring to the store stays in the view, as with
 * EntryRail. Definitions render as real anchors so an entry can be opened in a
 * new tab or copied as a citation, not merely clicked.
 */
import type { MouseEvent, ReactNode } from "react";
import { EvidenceBadge, TranscriptBadge } from "./Badge";
import { cite, worldOf } from "./EntryRail";
import { excerptOf } from "../excerpts";
import type { Author, Conflict, Entry, Floor, Transcription } from "../types";

/** A one-line formula is set large and centred; a definitional sentence is a
    different kind of object and takes the reading register instead. Between
    the two sits the long formula — Mobus's subscripted tuples — which is still
    beheld, not read, but wraps mid-subscript at the display size: it keeps the
    centred formula treatment one step down the scale. */
const FORMULA_CHARS = 40;
const SHORT_FORMULA_CHARS = 22;

const displayClass = (display: string | null) => {
  const n = display?.length ?? 0;
  if (n > FORMULA_CHARS) return "shelf-display shelf-display-long";
  if (n > SHORT_FORMULA_CHARS) return "shelf-display shelf-display-mid";
  return "shelf-display";
};

/** "Klir (2001)" -> "2001". The year the strip and the definition rows use;
    degrades to nothing rather than to a wrong number. */
const yearOf = (label: string | null) => label?.match(/\((\d{4})\)/)?.[1] ?? null;

/** The strip's second line, derived from the data alone: how many definitions
    this author's card holds, across which years. Hand-written copy here would
    be an editorial claim about an author; a count and a span are not. */
function armSpan(entries: Entry[]) {
  const years = [...new Set(entries.map((e) => yearOf(e.label)).filter(Boolean))];
  const span = years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : years[0];
  const n = entries.length === 1 ? "one definition" : `${entries.length} definitions`;
  return span ? `${n} · ${span}` : n;
}

/** The floor lede: one sentence. The receipt ("machine-checked") lives in the
    trust line with the other receipts; the arrow convention lives on the entry
    page's floor figure, where the roles actually render — the lede makes no
    claim it has to defend and explains no notation it no longer shows. */
export function FloorLede() {
  return (
    <section className="floor-lede">
      <p className="floor-lede-line">One floor. Every definition builds on it differently.</p>
    </section>
  );
}

/** The card unit is the AUTHORSHIP, not the author: a co-authored bearer
    (Mesarović & Takahara) lists its entry under every author node — that is
    the identity layer doing its job — but rendering one card per author would
    print the same definition twice. Entries are regrouped by the full set of
    authors that share them; a joint card's head joins the authors' names in
    declaration order. Author nodes themselves stay untouched — revision arcs
    still hang off the person, not the team. */
function byAuthorship(authors: Author[]): Author[] {
  const teamOf = new Map<string, Author[]>();
  for (const a of authors)
    for (const iri of a.entries) (teamOf.get(iri) ?? teamOf.set(iri, []).get(iri)!).push(a);
  const cards = new Map<string, Author>();
  for (const a of authors)
    for (const iri of a.entries) {
      const team = teamOf.get(iri)!;
      const key = team.map((t) => t.iri).join("+");
      const c =
        cards.get(key) ??
        cards
          .set(key, { iri: key, id: key, label: team.map((t) => t.label).join(" & "), entries: [] })
          .get(key)!;
      if (!c.entries.includes(iri)) c.entries.push(iri);
    }
  return [...cards.values()];
}

/** Commitment order is COMPUTED: authorships ascend by how many primitives
    their definitions add beyond the floor (union across the card's entries),
    ties broken by the existing accession order. A hand-written ordering would
    be an editorial ranking of authors; a count of their own declared
    primitives is not. */
function byCommitment(authors: Author[], floor: Record<string, Floor>) {
  const load = (a: Author) =>
    new Set(a.entries.flatMap((iri) => floor[iri]?.adds ?? [])).size;
  return byAuthorship(authors)
    .map((a, i) => ({ a, i, n: load(a) }))
    .sort((x, y) => x.n - y.n || x.i - y.i)
    .map((x) => x.a);
}

export function Shelf({
  authors,
  entries,
  floor,
  transcription,
  hrefOf,
  onOpen,
}: {
  authors: Author[];
  entries: Entry[];
  floor: Record<string, Floor>;
  transcription: Record<string, Transcription>;
  hrefOf: (e: Entry) => string;
  onOpen: (iri: string) => void;
}) {
  const byIri = new Map(entries.map((e) => [e.iri, e]));
  const addCount = (a: Author) =>
    new Set(a.entries.flatMap((iri) => floor[iri]?.adds ?? [])).size;
  return (
    <div className="shelf shelf-rail">
      {/* The rail: continuity whispered — a hairline behind the dot rows.
          The per-author arrows above it are the loud layer. */}
      <span className="shelf-rail-line" aria-hidden />
      {byCommitment(authors, floor).map((a) => {
        // The author's entries, in the catalogue's chronological order. ALL of
        // them: an author card that elected a representative definition would
        // hide exactly the finding this catalogue exists to record — that one
        // author defines "system" differently in different works. The build's
        // author-coverage gate guarantees the list is complete; this component
        // owes only the discipline of rendering every element of it.
        const defs = a.entries.map((iri) => byIri.get(iri)).filter((e): e is Entry => Boolean(e));
        if (!defs.length) return null;
        const world = worldOf(defs[0].label);
        const n = addCount(a);
        return (
          <article key={a.iri} className="shelf-col" data-world={world}>
            <span className="shelf-glyph">
              <svg viewBox="0 0 120 52" aria-label="the floor shape, plus this author's additions">
                <circle cx="24" cy="26" r="7" fill="var(--bg-primary)" stroke="var(--world)" strokeWidth="3" />
                <circle cx="96" cy="26" r="7" fill="var(--bg-primary)" stroke="var(--world)" strokeWidth="3" />
                <line x1="34" y1="26" x2="82" y2="26" stroke="var(--world)" strokeWidth="2.5" />
                <polygon points="82,20 92,26 82,32" fill="var(--world)" />
                {Array.from({ length: Math.min(n, 9) }, (_, i) => (
                  <circle key={i} cx={60 + (i - (Math.min(n, 9) - 1) / 2) * 12} cy="44" r="3" fill="var(--world)" />
                ))}
              </svg>
              <span className="shelf-glyph-count eyebrow">+{n} beyond the floor</span>
            </span>
            <div className="shelf-card" data-world={world}>
            <span className="shelf-strip">
              <span className="shelf-head">{a.label}</span>
              <span className="shelf-tail">{armSpan(defs)}</span>
            </span>
            {defs.map((e) => {
              const t = transcription[e.iri];
              const { display } = excerptOf(e);
              const year = yearOf(e.label);
              // Badges appear on the front page only as EXCEPTIONS. The good
              // state — passage located by the build, encoding human-verified —
              // is the trust line's aggregate claim and needs no per-card pill;
              // repeating "verified" under every definition made verification
              // read as decoration. Anything LESS than the good state must stay
              // loudly visible (the evidence-code doctrine: unverified is never
              // silently equal to verified), so only those pills render.
              const located = t?.status === "located";
              const hvp = (e.evidenceCode ?? "").split("/").pop() === "HVP";
              const open = (ev: MouseEvent) => {
                // Plain click navigates in place; modified clicks keep browser behaviour.
                if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
                ev.preventDefault();
                onOpen(e.iri);
              };
              // The card carries the quote and nothing that argues: floor
              // roles and additions render on the entry page's floor figure,
              // one click down. What may NOT move is the exception badges —
              // unverified is never silently equal to verified — so they stay
              // wherever the quote renders.
              return (
                <a key={e.iri} className="shelf-def" href={hrefOf(e)} onClick={open}>
                  {year && defs.length > 1 && (
                    <span className="shelf-def-year eyebrow">{year}</span>
                  )}
                  <blockquote className={displayClass(display)}>
                    {display ?? "No verbatim recorded."}
                  </blockquote>
                  <span className="shelf-cue disclosure" aria-hidden>
                    Read the full passage →
                  </span>
                  {(!located || !hvp) && (
                    <span className="shelf-meta">
                      {!located && (
                        <TranscriptBadge status={t?.status ?? "no-verbatim"} source={t?.source} />
                      )}
                      {!hvp && <EvidenceBadge code={e.evidenceCode} />}
                    </span>
                  )}
                </a>
              );
            })}
            </div>
          </article>
        );
      })}
    </div>
  );
}

/**
 * One derived disagreement, compressed to a sentence. The full apparatus —
 * both rulings in the authors' own words, the identification and its grade —
 * lives in the Cases ledger; the front page states only that the finding
 * exists and where it is examined. Every clause is generated from the recorded
 * rulings, so the line stays derived as the catalogue grows.
 */
export function ConflictLine({
  conflict,
  entries,
  seeCases,
}: {
  conflict: Conflict;
  entries: Entry[];
  /** The link into the ledger, rendered by the caller so routing stays in the view. */
  seeCases: ReactNode;
}) {
  const headOf = (iri: string) => cite(entries.find((e) => e.iri === iri)?.label ?? null).head;
  const yes = conflict.admittedBy.map((a) => headOf(a.entry));
  const no = conflict.refusedBy.map((r) => headOf(r.entry));
  return (
    <p className="conflict-line">
      <span className="conflict-line-q">Is {conflict.label} a system?</span>{" "}
      {yes.join(", ")} {yes.length > 1 ? "say" : "says"} yes; {no.join(", ")}{" "}
      {no.length > 1 ? "say" : "says"} no — found, not asserted. {seeCases}
    </p>
  );
}
