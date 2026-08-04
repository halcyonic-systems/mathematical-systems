/**
 * The front page's three instruments: the shelf, the disagreement, the trust line.
 *
 * The foyer's job is invitation, and the invitation is the material itself —
 * so the shelf shows the authors' own words, in the passage register, and each
 * card is a door into its entry. Everything editorial is set smaller than what
 * it introduces.
 *
 * These take data and callbacks; wiring to the store stays in the view, as with
 * EntryRail. Cards render as real anchors so an entry can be opened in a new
 * tab or copied as a citation, not merely clicked.
 */
import type { MouseEvent, ReactNode } from "react";
import { EvidenceBadge, TranscriptBadge } from "./Badge";
import { CaseItem } from "./Case";
import { cite } from "./EntryRail";
import type { Case, Conflict, Entry, Transcription } from "../types";

/** Beyond this, a card clamps and says so. The clamp is visible, never silent:
    the cue names the truncation, because an unmarked ellipsis on a verbatim
    would break the discipline the catalogue exists to keep. */
const CLAMP_CHARS = 300;

export function Shelf({
  entries,
  transcription,
  hrefOf,
  onOpen,
}: {
  entries: Entry[];
  transcription: Record<string, Transcription>;
  hrefOf: (e: Entry) => string;
  onOpen: (iri: string) => void;
}) {
  return (
    <div className="shelf">
      {entries.map((e) => {
        const { head, tail } = cite(e.label);
        const t = transcription[e.iri];
        const clamped = (e.verbatim?.length ?? 0) > CLAMP_CHARS;
        const open = (ev: MouseEvent) => {
          // Plain click navigates in place; modified clicks keep browser behaviour.
          if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
          ev.preventDefault();
          onOpen(e.iri);
        };
        return (
          <a key={e.iri} className="shelf-card" href={hrefOf(e)} onClick={open}>
            <span className="shelf-strip">
              <span className="shelf-head">{head}</span>
              {tail && <span className="shelf-tail">{tail}</span>}
            </span>
            <blockquote className={`shelf-verbatim${clamped ? " is-clamped" : ""}`}>
              {e.verbatim ?? "No verbatim recorded."}
            </blockquote>
            <span className="shelf-cue disclosure" aria-hidden>
              {clamped ? "The passage continues — read the entry →" : "Read the entry →"}
            </span>
            <span className="shelf-meta">
              {e.sourceLocation && <span className="passage-locus">{e.sourceLocation}</span>}
              <TranscriptBadge status={t?.status ?? "no-verbatim"} source={t?.source} />
              <EvidenceBadge code={e.evidenceCode} />
            </span>
          </a>
        );
      })}
    </div>
  );
}

/**
 * One test object, ruled on both ways — rendered as the two rulings side by
 * side, each in its author's own terms via the ledger's CaseList, so the front
 * page and the Cases view can never describe the same finding differently.
 */
export function ConflictPanel({
  conflict,
  cases,
  entries,
  seeCases,
}: {
  conflict: Conflict;
  cases: Record<string, Case>;
  entries: Entry[];
  /** The link into the ledger, rendered by the caller so routing stays in the view. */
  seeCases: ReactNode;
}) {
  const headOf = (iri: string) => cite(entries.find((e) => e.iri === iri)?.label ?? null).head;
  const grade = (conflict.evidenceCode ?? "").split("/").pop();
  return (
    <>
      <p className="m-0 mb-4 font-semibold" style={{ color: "var(--text-primary)" }}>
        {conflict.label} — one test object, two verdicts.
      </p>
      <div className="verdicts">
        <div>
          {conflict.admittedBy.map((a) => (
            <div key={a.case}>
              <p className="verdict-ruling">
                <span aria-hidden className="verdict-glyph">
                  ⊨
                </span>
                {headOf(a.entry)} admits it
              </p>
              {/* CaseItem, not CaseList: the ledger list's hanging indent is for
                  glyph columns, and without one it pulls the meta row off the
                  panel's edge. The case itself renders identically to the ledger. */}
              <ul className="m-0 p-0 list-none">
                <CaseItem c={cases[a.case]} />
              </ul>
            </div>
          ))}
        </div>
        <div>
          {conflict.refusedBy.map((r) => (
            <div key={r.case}>
              <p className="verdict-ruling">
                <span aria-hidden className="verdict-glyph">
                  ⊭
                </span>
                {headOf(r.entry)} refuses it
              </p>
              <ul className="m-0 p-0 list-none">
                <CaseItem c={cases[r.case]} />
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className="w-open mt-4 mb-0 flex items-center gap-3 flex-wrap">
        <EvidenceBadge code={conflict.evidenceCode} />
        <span>
          {grade === "MDU"
            ? "The identification of the two cases as one object is model-drafted and unchecked; the finding inherits that grade."
            : "Derived from the recorded rulings, not asserted."}
        </span>
        {seeCases}
      </p>
    </>
  );
}
