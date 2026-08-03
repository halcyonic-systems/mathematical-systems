/**
 * A computed claim, stated in words before any mechanism is shown.
 *
 * The reader is allowed to compute — differences, coverage, entailments — and
 * `derived` outranks `decided` on the warrant scale. That ranking is only
 * defensible if derivations stay legible, which disqualifies what shipped
 * before:
 *
 *     DataPropertyAssertion: unsupported data range — 51
 *
 * True, mechanical, and useless: a raw count outranking human judgement while
 * being harder to read than one. So the shape here is required rather than
 * encouraged — a plain-language claim, then the mechanism behind a disclosure
 * for anyone who wants to check it.
 *
 * The glyph carries the verdict; colour only reinforces it. Three states, never
 * two: a sound under-approximation returning "no" means NOT PROVEN, which is a
 * different claim from REFUTED.
 */
import { useState, type ReactNode } from "react";
import { Editorial } from "./Editorial";

export type Verdict = "holds" | "bounded" | "fails" | "note";

const GLYPH: Record<Verdict, string> = { holds: "✓", bounded: "◐", fails: "✕", note: "⚠" };
const INK: Record<Verdict, string> = {
  holds: "var(--proof-entailed)",
  bounded: "var(--proof-not-proven)",
  fails: "var(--proof-refuted)",
  note: "var(--proof-not-proven)",
};

export function Derivation({
  verdict,
  claim,
  because,
  detail,
}: {
  verdict: Verdict;
  /** One sentence, in the reader's language, not the reasoner's. */
  claim: string;
  /** Why it matters, or what it does to the verdict. Optional but usually wanted. */
  because?: ReactNode;
  /** The mechanism. Axioms, counts, normalisations — anything a checker would want. */
  detail?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-5 last:mb-0">
      <p className="m-0 flex items-baseline gap-2">
        <span aria-hidden style={{ color: INK[verdict] }}>
          {GLYPH[verdict]}
        </span>
        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
          <Editorial>{claim}</Editorial>
        </span>
      </p>
      {because && (
        <p className="m-0 mt-1 pl-6" style={{ color: "var(--text-secondary)" }}>
          {because}
        </p>
      )}
      {detail && (
        <div className="pl-6 mt-1.5">
          <button
            onClick={() => setOpen((v) => !v)}
            className="eyebrow cursor-pointer bg-transparent border-0 p-0"
            style={{ color: "var(--accent)" }}
            aria-expanded={open}
          >
            {open ? "▾ hide the derivation" : "▸ show the derivation"}
          </button>
          {open && <div className="mt-2">{detail}</div>}
        </div>
      )}
    </div>
  );
}
