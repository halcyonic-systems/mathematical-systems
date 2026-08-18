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
 * These take data and callbacks; wiring to the store stays in the view, as with
 * EntryRail. Definitions render as real anchors so an entry can be opened in a
 * new tab or copied as a citation, not merely clicked.
 */
import type { MouseEvent, ReactNode } from "react";
import { EvidenceBadge, TranscriptBadge } from "./Badge";
import { cite, worldOf } from "./EntryRail";
import { excerptOf } from "../excerpts";
import type { Author, Conflict, Entry, Transcription } from "../types";

/** A one-line formula is set large and centred; a definitional sentence is a
    different kind of object and takes the reading register instead. */
const FORMULA_CHARS = 40;

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

export function Shelf({
  authors,
  entries,
  transcription,
  hrefOf,
  onOpen,
}: {
  authors: Author[];
  entries: Entry[];
  transcription: Record<string, Transcription>;
  hrefOf: (e: Entry) => string;
  onOpen: (iri: string) => void;
}) {
  const byIri = new Map(entries.map((e) => [e.iri, e]));
  return (
    <div className="shelf">
      {authors.map((a) => {
        // The author's entries, in the catalogue's chronological order. ALL of
        // them: an author card that elected a representative definition would
        // hide exactly the finding this catalogue exists to record — that one
        // author defines "system" differently in different works. The build's
        // author-coverage gate guarantees the list is complete; this component
        // owes only the discipline of rendering every element of it.
        const defs = a.entries.map((iri) => byIri.get(iri)).filter((e): e is Entry => Boolean(e));
        if (!defs.length) return null;
        const world = worldOf(defs[0].label);
        return (
          <article key={a.iri} className="shelf-card" data-world={world}>
            <span className="shelf-strip">
              <span className="shelf-head">{a.label}</span>
              <span className="shelf-tail">{armSpan(defs)}</span>
            </span>
            {defs.map((e) => {
              const t = transcription[e.iri];
              const { display, context } = excerptOf(e);
              const formula = (display?.length ?? 0) <= FORMULA_CHARS;
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
              return (
                <a key={e.iri} className="shelf-def" href={hrefOf(e)} onClick={open}>
                  {year && defs.length > 1 && (
                    <span className="shelf-def-year eyebrow">{year}</span>
                  )}
                  <blockquote className={`shelf-display${formula ? "" : " shelf-display-long"}`}>
                    {display ?? "No verbatim recorded."}
                  </blockquote>
                  {context && <span className="shelf-context">{context}</span>}
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
