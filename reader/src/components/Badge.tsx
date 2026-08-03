/**
 * A filled marker on one of the three reserved colour channels.
 *
 * Evidence grade, proof status and transcription status are contractual: each
 * means one thing, always, and none may be reused for decoration. Folding them
 * into one part keeps that contract in a single place instead of three
 * near-identical components that could drift apart.
 *
 * Every badge carries a glyph as well as a colour. Colour alone fails for
 * colour-blind readers, in greyscale print, and in any screenshot that has been
 * through a projector — and this instrument's headline claim is a three-state
 * distinction that a reader must be able to see.
 */
import { evidence, proofColor, proofLabel, transcriptColor, transcriptLabel } from "../tokens";
import type { ProofStatus, TranscriptStatus } from "../tokens";

const EVIDENCE_MEANING: Record<string, string> = {
  HVP: "Human-verified against the primary text",
  MDHC: "Model-drafted, human-checked",
  MDU: "Model-drafted, unchecked — must not be cited",
  PROP: "Propagated from another entry",
};

const PROOF_GLYPH: Record<ProofStatus, string> = {
  entailed: "✓",
  "not-proven": "◐",
  refuted: "✕",
};

function Pill({ fill, glyph, text, title }: { fill: string; glyph?: string; text: string; title?: string }) {
  return (
    <span
      style={{ background: fill, color: "var(--text-on-accent)", borderRadius: "var(--radius-sm)" }}
      className="px-2 py-0.5 text-xs font-semibold whitespace-nowrap"
      title={title}
    >
      {glyph && <span aria-hidden>{glyph} </span>}
      {text}
    </span>
  );
}

export function EvidenceBadge({ code }: { code: string | null }) {
  const id = (code ?? "").split("/").pop() ?? "";
  return (
    <Pill
      fill={evidence[id as keyof typeof evidence] ?? "var(--accent-slate)"}
      text={id || "—"}
      title={EVIDENCE_MEANING[id] ?? id}
    />
  );
}

export function ProofBadge({ status, bounded }: { status: ProofStatus; bounded?: boolean }) {
  return (
    <Pill
      fill={proofColor[status]}
      glyph={PROOF_GLYPH[status]}
      text={proofLabel[status] + (bounded && status !== "entailed" ? " · bounded" : "")}
      title={
        bounded
          ? "A sound under-approximation: no proof was found within the reasoner's budget. Not the same as refuted."
          : undefined
      }
    />
  );
}

export function TranscriptBadge({ status, source }: { status: TranscriptStatus; source?: string }) {
  const short = status === "located" ? "Verified" : status === "partial" ? "Partial" : "Unverified";
  const glyph = status === "located" ? "✓" : status === "partial" ? "◐" : "✕";
  return (
    <Pill
      fill={transcriptColor(status)}
      glyph={glyph}
      text={short}
      title={transcriptLabel[status] + (source ? ` — ${source}` : "")}
    />
  );
}
