/**
 * How well established a claim is — the spine of the design system.
 *
 * Every piece of content on a page carries exactly one warrant, and the warrant
 * decides its visual weight. The scale is DERIVED from data the catalogue
 * already holds (evidence codes, derived-vs-authored, absent pointers), never
 * assigned by eye, so "how prominent should this be" is a fact about the content
 * rather than a taste question that gets re-argued every time.
 *
 * Warrant is expressed in size, ink and typeface — never colour. The three
 * colour channels (evidence grade, proof status, transcription) are contractual
 * and a fourth would collide with them.
 *
 * A consequence worth stating: `source` is the only warrant that gets the
 * display face, so "the author wrote this" and "we say this" cannot be set alike
 * by accident. The doctrine stops being something to remember.
 */
export type Warrant =
  /** The author wrote this. Verbatim, context, the author's own caveat and examples. */
  | "source"
  /** A machine computed it and can show its work. Entailments, verdicts, differences. */
  | "derived"
  /** A human chose it and said why. Apparatus, evidence codes, deliberate omissions. */
  | "decided"
  /** Not done, and we say so. Rendered terse in place, collected into one block. */
  | "open";

export const warrantClass: Record<Warrant, string> = {
  source: "w-source",
  derived: "w-derived",
  decided: "w-decided",
  open: "w-open",
};

/**
 * The whole card: border, ground, lift, and a left edge reinforcing the strip.
 * A background tint alone is too quiet to separate one section from the next.
 */
export const cardClass: Record<Warrant, string> = {
  source: "card-source",
  derived: "card-derived",
  decided: "card-decided",
  open: "card-open",
};

export const stripClass: Record<Warrant, string> = {
  source: "strip-source",
  derived: "strip-derived",
  decided: "strip-decided",
  open: "strip-open",
};

/**
 * What each warrant means, for the legend and the colophon.
 *
 * `derived` outranks `decided` only because derivations are held to being
 * legible — see Derivation, which requires a plain-language claim before any
 * mechanism. A raw axiom count outranking human judgement would be indefensible.
 */
export const warrantMeaning: Record<Warrant, string> = {
  source: "The author wrote this.",
  derived: "Computed, and it can show its work.",
  decided: "An encoder chose this, and said why.",
  open: "Not done. Recorded so the gap is visible.",
};
