export type AnnotationBlock = {
  kind: "section" | "flag" | "prose";
  title: string | null;
  body: string;
};

export type Entry = {
  iri: string;
  id: string;
  /** Accession number ("001"), the numbering the catalogue's own prose uses.
      Assigned at build from the declared order — never from render position. */
  number: string;
  label: string | null;
  statedIn: string | null;
  sourceLocation: string | null;
  verbatim: string | null;
  /** Presentation spans marked in the atlas (atlas:displayForm / displayContext).
      The build refuses a span that is not an exact substring of the verbatim. */
  displayForm: string | null;
  displayContext: string | null;
  authorCaveat: string | null;
  /** Case IRIs. Cases are individuals since P4 — look them up in `Atlas.cases`. */
  admits: string[];
  refuses: string[];
  primitives: string[];
  evidenceCode: string | null;
  encodedBy: string | null;
  encodedOn: string | null;
  formalisedAs: string | null;
  annotation: AnnotationBlock[];
};

/** A case an author rules on. Its grade, its location and the author's own words are its
    own, not the entry's — which is the whole point of reifying it. */
export type Case = {
  iri: string;
  id: string;
  label: string | null;
  /** What the case is, in our words. */
  gloss: string | null;
  /** The author's own words licensing the ruling. Absent where the author gives none. */
  verbatim: string | null;
  sourceLocation: string | null;
  evidenceCode: string | null;
  encodedOn: string | null;
  /** The shared test object this case is a case of, if identified. */
  instantiates: string | null;
  note: string | null;
};

export type Bearer = {
  iri: string;
  label: string | null;
  creator: string | null;
  date: string | null;
  identifiers: string[];
  /** Author IRIs (atlas:authoredBy). `creator` is the bibliographic string; this is the node. */
  authoredBy: string[];
};

/** Identity only — a name plus the entries reachable through its bearers.
    Nothing definitional aggregates here: an author with two entries is two
    definitions to be read, never one position to be summarised. The entry
    list is complete by construction (the build's author-coverage gate), and
    chronological, so a revision arc reads in order. */
export type Author = {
  iri: string;
  id: string;
  label: string | null;
  entries: string[];
};

export type Primitive = {
  iri: string;
  label: string | null;
  /** Signature role, once the atlas types primitives via skos:broader. Null until then. */
  role: string | null;
  usedBy: string[];
};

export type EvidenceCode = {
  iri: string;
  id: string;
  label: string | null;
  definition: string | null;
};

export type TestObject = {
  iri: string;
  id: string;
  label: string | null;
  scopeNote: string | null;
  evidenceCode: string | null;
  arguedIn: string | null;
  note: string | null;
};

/** One test object that a definition admits and another refuses. Derived, not asserted. */
export type Conflict = {
  object: string;
  label: string | null;
  /** The grade of the IDENTIFICATION — that both cases are of one object — not of either case. */
  evidenceCode: string | null;
  arguedIn: string | null;
  admittedBy: { entry: string; case: string }[];
  refusedBy: { entry: string; case: string }[];
};

export type Transcription = {
  status:
    | "located" | "partial" | "not-found"
    | "no-source-registered" | "source-missing" | "no-verbatim";
  source?: string;
  /** What the comparison had to ignore. Shown, never hidden — a gate that
      normalises until things match proves nothing. */
  normalisations?: string[];
  matchedChars?: number;
  verbatimChars?: number;
  /** The passage as it sits in the book: what precedes it, the match, what follows. */
  context?: { before: string; match: string; after: string };
};

export type Shape = {
  status: "resolved" | "error" | "none";
  spec?: string;
  file?: string;
  title?: string;
  shape?: string;
  arrowConvention?: string;
  positions?: { name: string; doc: string }[];
  arrows?: { name: string; from: string; to: string; doc: string }[];
  error?: string;
};

export type OpenDecision = { title: string; blocking: boolean; problem: string; fix: string };

export type Atlas = {
  cases: Record<string, Case>;
  testObjects: Record<string, TestObject>;
  openDecisions: OpenDecision[];
  provenance: { atlasCommit: string | null; repoCommit: string | null };
  shapes: Record<string, Shape>;
  transcription: Record<string, Transcription>;
  source: { repo: string; coreLabel: string | null };
  entries: Entry[];
  bearers: Bearer[];
  authors: Author[];
  primitives: Primitive[];
  evidenceCodes: EvidenceCode[];
  conflicts: Conflict[];
  primitiveSchemeScopeNote: string | null;
  profile: { counts: Record<string, number>; verdict: string };
};

export type Commitment = {
  id: string;
  question: string;
  matters: string;
  verdict: "entailed" | "not-proven" | "refuted";
  bounded: boolean;
};

export type Variant = {
  label: string;
  consistent: boolean;
  droppedAxioms: Record<string, number>;
  commitments: Commitment[];
  justifications: { sub: string; sup: string; axioms: string[]; note?: string }[];
  /** Local name -> rdfs:label, for every term the reasoner names. CCO IRIs are
      opaque numerics; a justification without these is unreadable. */
  labels: Record<string, string>;
};

export type Reasoning = { variants: Record<"shipped" | "full", Variant> };
