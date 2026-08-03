/**
 * Typed mirror of the reserved channels for consumers that cannot read var(--x)
 * (SVG presentation props, numeric props, lookup maps keyed by data value).
 *
 * index.css is the source of truth. scripts/check-tokens.mjs asserts the two
 * agree and fails the build if they drift.
 */

/** Evidence grade — how an encoding was established. Contractual, not decorative. */
export const evidence = {
  HVP: "#1f7351",
  MDHC: "#3d6373",
  MDU: "#8a5c08",
  PROP: "#5d6f7b",
} as const;

/** Proof status — three states. `notProven` is not `refuted`; see index.css. */
export const proof = {
  entailed: "#1f7351",
  notProven: "#8a5c08",
  refuted: "#c2352c",
} as const;

/** Transcription — what the build found when it looked in the primary text. */
export const transcript = {
  located: "#1f7351",
  partial: "#8a5c08",
  absent: "#c2352c",
} as const;

export type TranscriptStatus =
  | "located" | "partial" | "not-found"
  | "no-source-registered" | "source-missing" | "no-verbatim";

export const transcriptColor = (s: TranscriptStatus) =>
  s === "located" ? transcript.located : s === "partial" ? transcript.partial : transcript.absent;

/** Deliberately plain: the badge states what was done, not that all is well. */
export const transcriptLabel: Record<TranscriptStatus, string> = {
  located: "Verified against the source",
  partial: "Partially located in the source",
  "not-found": "Not found in the source",
  "no-source-registered": "No source text registered",
  "source-missing": "Source text unavailable",
  "no-verbatim": "No verbatim recorded",
};

export type EvidenceId = keyof typeof evidence;
export type ProofStatus = "entailed" | "not-proven" | "refuted";

export const proofColor: Record<ProofStatus, string> = {
  entailed: proof.entailed,
  "not-proven": proof.notProven,
  refuted: proof.refuted,
};

/** What each proof status is allowed to say in the interface. */
export const proofLabel: Record<ProofStatus, string> = {
  entailed: "Entailed",
  "not-proven": "Not proven",
  refuted: "Refuted",
};
