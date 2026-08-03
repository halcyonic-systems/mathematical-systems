/**
 * Shared chrome for the instrument register (docs/design/visual-language.md).
 *
 * Every region opens on a header strip and closes on a rule. A block that ends
 * nowhere is not a block. Colour arrives as a filled region with an edge.
 */
import type { ReactNode } from "react";
import { evidence, proofColor, proofLabel, transcriptColor, transcriptLabel, type ProofStatus } from "./tokens";
import type { Shape, Transcription } from "./types";

export function Masthead({
  eyebrow,
  title,
  subtitle,
  count,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  count?: string;
}) {
  return (
    <header
      style={{ background: "var(--accent-strong)", color: "var(--text-on-accent)" }}
      className="px-8 py-6 flex items-baseline justify-between"
    >
      <div>
        <div className="eyebrow" style={{ color: "var(--accent-soft)" }}>
          {eyebrow}
        </div>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-4xl font-medium mt-1">
          {title}
        </h1>
        {subtitle && (
          <p
            style={{ fontFamily: "var(--font-display)", color: "var(--accent-soft)" }}
            className="m-0 mt-1 text-lg italic"
          >
            {subtitle}
          </p>
        )}
      </div>
      {count && (
        <div style={{ fontFamily: "var(--font-display)" }} className="text-3xl tabular-nums opacity-80">
          {count}
        </div>
      )}
    </header>
  );
}

export function Block({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
      className="mb-6"
    >
      <div
        style={{ background: "var(--accent-soft)", borderBottom: "1px solid var(--border)" }}
        className="px-5 py-2 flex items-baseline gap-3"
      >
        <span className="eyebrow" style={{ color: "var(--text-secondary)" }}>
          {title}
        </span>
        {note && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {note}
          </span>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

/** Local name of an IRI — the part after the last slash. */
export const localName = (iri: string | null) => (iri ?? "").split("/").pop() ?? "";

/** Evidence grade. Filled, because the grade must never read as neutral chrome. */
export function EvidenceBadge({ code }: { code: string | null }) {
  const id = localName(code);
  const fill = evidence[id as keyof typeof evidence] ?? "var(--accent-slate)";
  return (
    <span
      style={{ background: fill, color: "var(--text-on-accent)", borderRadius: "var(--radius-sm)" }}
      className="px-2 py-0.5 text-xs font-semibold tracking-wide"
      title={EVIDENCE_TITLE[id] ?? id}
    >
      {id || "—"}
    </span>
  );
}

const EVIDENCE_TITLE: Record<string, string> = {
  HVP: "Human-verified against primary text",
  MDHC: "Model-drafted, human-checked",
  MDU: "Model-drafted, unchecked — must not be cited",
  PROP: "Propagated from another entry",
};

/** Three states, never two. See index.css on why `not-proven` is not `refuted`. */
export function ProofBadge({ status, bounded }: { status: ProofStatus; bounded?: boolean }) {
  return (
    <span
      style={{ background: proofColor[status], color: "var(--text-on-accent)", borderRadius: "var(--radius-sm)" }}
      className="px-2 py-0.5 text-xs font-semibold"
      title={bounded ? "Sound under-approximation: no proof found within the reasoner's budget" : undefined}
    >
      {proofLabel[status]}
      {bounded && status !== "entailed" ? " ·  bounded" : ""}
    </span>
  );
}

/**
 * A transcribed source passage, rendered EXACTLY as recorded.
 *
 * Never converted to LaTeX, never re-spaced, never "cleaned up". The verbatim is
 * the only thing every downstream encoding is checkable against; a rendering
 * that alters it breaks the atlas's central discipline. The Unicode mathematics
 * came out of the book that way and stays that way.
 */
export function Verbatim({ text, location }: { text: string | null; location?: string | null }) {
  if (!text) return <em style={{ color: "var(--text-muted)" }}>No verbatim recorded.</em>;
  return (
    <figure className="m-0">
      {location && (
        <figcaption className="eyebrow mb-2" style={{ color: "var(--text-muted)" }}>
          {location}
        </figcaption>
      )}
      <blockquote
        className="verbatim m-0 pl-4"
        style={{ borderLeft: "3px solid var(--accent)", whiteSpace: "pre-wrap" }}
      >
        {text}
      </blockquote>
    </figure>
  );
}

/** What the build found when it went looking in the primary text. */
export function TranscriptBadge({ t }: { t: Transcription | undefined }) {
  if (!t) return null;
  const short =
    t.status === "located" ? "Verified" : t.status === "partial" ? "Partial" : "Unverified";
  return (
    <span
      style={{
        background: transcriptColor(t.status),
        color: "var(--text-on-accent)",
        borderRadius: "var(--radius-sm)",
      }}
      className="px-2 py-0.5 text-xs font-semibold"
      title={
        transcriptLabel[t.status] +
        (t.source ? ` — ${t.source}` : "") +
        (t.normalisations?.length ? `\nIgnored: ${t.normalisations.join("; ")}` : "")
      }
    >
      {short}
    </span>
  );
}

/**
 * The passage in its place in the book.
 *
 * The entry records one sentence; the page around it holds the author's own
 * examples, hedges and self-assessments. Klir's ordered-books example — the
 * separating instance against Bunge — sits four sentences after eq. (1.1) and is
 * invisible from the entry alone. Showing the surround turns "adjacent material,
 * not yet entered" from a note the encoder wrote into something you can see.
 */
export function InContext({ t }: { t: Transcription | undefined }) {
  if (!t?.context) return null;
  const { before, match, after } = t.context;
  return (
    <div style={{ fontFamily: "var(--font-display)" }} className="text-lg leading-relaxed">
      <span style={{ color: "var(--text-muted)" }}>…{before}</span>
      <mark
        style={{ background: "var(--accent-soft)", color: "var(--text-primary)" }}
        className="px-0.5"
      >
        {match}
      </mark>
      <span style={{ color: "var(--text-muted)" }}>{after}…</span>
    </div>
  );
}

export function Chip({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return (
    <span
      style={{
        background: muted ? "var(--bg-surface)" : "var(--accent)",
        color: muted ? "var(--text-secondary)" : "var(--text-on-accent)",
        borderRadius: "var(--radius-sm)",
      }}
      className="px-2 py-0.5 text-xs"
    >
      {children}
    </span>
  );
}

/**
 * The shape category, as Lean has it.
 *
 * The quiver is the formal counterpart of the passage: which positions the
 * definition posits, and which depends on which. Read out of the source file —
 * nothing here claims the encoding is FAITHFUL to the text. That judgement is a
 * mapping-layer claim with an evidence code, and the gap between what the text
 * says and what the quiver records is the point of showing them together.
 */
export function Quiver({ shape }: { shape: Shape | undefined }) {
  if (!shape || shape.status === "none")
    return (
      <p className="m-0 text-sm italic" style={{ color: "var(--text-muted)" }}>
        No shape category formalises this entry. Its formal counterpart in the foundations is a
        structure rather than a quiver, so there is nothing to bridge to yet.
      </p>
    );
  if (shape.status === "error")
    return (
      <p className="m-0 text-sm" style={{ color: "var(--proof-refuted)" }}>
        {shape.error}
      </p>
    );

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {shape.positions?.map((p) => (
          <span
            key={p.name}
            title={p.doc}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--accent-slate)",
              borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-mono)",
            }}
            className="px-2.5 py-1 text-xs"
          >
            {p.name}
          </span>
        ))}
      </div>

      <table className="w-full text-sm border-collapse">
        <tbody>
          {shape.arrows?.map((a) => (
            <tr key={a.name}>
              <td
                className="py-2 pr-3 whitespace-nowrap align-top"
                style={{ borderBottom: "1px solid var(--hairline)", fontFamily: "var(--font-mono)" }}
              >
                <span style={{ color: "var(--text-primary)" }}>{a.from}</span>
                <span style={{ color: "var(--accent)" }}> → </span>
                <span style={{ color: "var(--text-primary)" }}>{a.to}</span>
              </td>
              <td
                className="py-2 align-top"
                style={{ borderBottom: "1px solid var(--hairline)", color: "var(--text-secondary)" }}
              >
                {a.doc || <span style={{ color: "var(--text-muted)" }}>—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {shape.arrowConvention && (
        <p className="mt-3 mb-0 text-xs" style={{ color: "var(--text-muted)" }}>
          {shape.arrowConvention}
        </p>
      )}
    </>
  );
}
