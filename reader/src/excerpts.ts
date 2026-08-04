/**
 * Editorial split points for the shelf: which span of a verbatim is the
 * mathematical statement, and which span is the author's own plain-language
 * reading of it.
 *
 * The catalogue does not (yet) mark these spans, so the split is decided here —
 * but only the split is ours. Both spans must be exact substrings of the
 * verbatim, and excerptOf falls back to showing the full verbatim when they are
 * not, so an atlas edit can never leave the front page showing words an author
 * did not write. When the atlas grows a display-form annotation, this file is
 * what it replaces.
 */
import type { Entry } from "./types";

const SPLITS: Record<string, { display: string; context?: string }> = {
  "klir-2001-eq-1-1": {
    display: "S = (T, R)",
    context:
      "where S, T, R denote, respectively, a system, a set of things distinguished within S, and a relation (or, possibly, a set of relations) defined on T.",
  },
  "bunge-1979-ces-triple": {
    display: "σ = ⟨C, E, S⟩",
    context:
      "C and E are mutually disjoint subsets of T (i.e. C ∩ E = ∅), and S is a nonempty set of relations on the union of C and E.",
  },
  "bunge-1979-def-1-1": {
    display:
      "An object is a concrete system iff it is composed of at least two different connected things.",
  },
};

export function excerptOf(e: Entry): { display: string | null; context: string | null } {
  const s = SPLITS[e.id];
  const v = e.verbatim;
  if (!s || !v) return { display: v, context: null };
  return {
    display: v.includes(s.display) ? s.display : v,
    context: s.context && v.includes(s.context) ? s.context : null,
  };
}
