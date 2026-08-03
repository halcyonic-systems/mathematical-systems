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
