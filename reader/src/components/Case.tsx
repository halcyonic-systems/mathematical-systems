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

export function CaseItem({ c }: { c: Case | undefined }) {
  if (!c) return <li className="w-open">Unknown case.</li>;
  return (
    <li className="mb-3 last:mb-0">
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

export function CaseList({ iris, cases }: { iris: string[]; cases: Record<string, Case> }) {
  if (iris.length === 0) return <span className="w-open">—</span>;
  return (
    <ul className="m-0 pl-4">
      {iris.map((iri) => (
        <CaseItem key={iri} c={cases[iri]} />
      ))}
    </ul>
  );
}
