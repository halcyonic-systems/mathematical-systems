/**
 * A case an author rules on, with what is known about it.
 *
 * Cases were strings on the entry until P4. Reified, each carries its own
 * evidence grade, its own source location, and the author's own words kept
 * separate from our gloss — so the page can show, per case, exactly how well
 * established it is rather than inheriting a grade from the entry it hangs off.
 *
 * The asymmetry this makes visible is real and worth seeing: Klir's cases carry
 * a location and his own justifying clause; Bunge's carry neither, because his
 * examples sit in a labelled block outside the location his entry claims and he
 * justifies structurally rather than in the sentence.
 */
import { EvidenceBadge } from "./Badge";
import type { Case } from "../types";

export function CaseItem({ c, glyph }: { c: Case | undefined; glyph?: string }) {
  if (!c) return <li className="w-open">Unknown case.</li>;
  return (
    <li className="mb-3 last:mb-0">
      {glyph && (
        <span aria-hidden className="ruling-glyph">
          {glyph}
        </span>
      )}
      <span>{c.gloss}</span>
      {c.verbatim && (
        <span className="case-quote"> — “{c.verbatim}”</span>
      )}
      <span className="case-meta">
        <EvidenceBadge code={c.evidenceCode} />
        {c.sourceLocation ? <span>{c.sourceLocation}</span> : <span className="w-open">no location recorded</span>}
      </span>
    </li>
  );
}

/**
 * A ruling is either admission or refusal, and the two were set identically —
 * same bullet, same indent, same everything — so which way an author had ruled
 * was recoverable only from the column header several hundred pixels away, and
 * not at all once a list ran past a screen. Colour cannot carry it (the three
 * channels are contractual), so it is carried by a glyph and by indentation:
 * ⊨ admits, flush; ⊭ refuses, stepped in. The shape of an entry's rulings is
 * legible before a word of it is read.
 */
const RULING = { admits: "⊨", refuses: "⊭" } as const;

export function CaseList({
  iris,
  cases,
  stance,
}: {
  iris: string[];
  cases: Record<string, Case>;
  stance?: "admits" | "refuses";
}) {
  if (iris.length === 0) return <span className="w-open">—</span>;
  return (
    <ul className={`m-0 p-0 list-none case-list${stance ? ` ruling-${stance}` : ""}`}>
      {iris.map((iri) => (
        <CaseItem key={iri} c={cases[iri]} glyph={stance && RULING[stance]} />
      ))}
    </ul>
  );
}
