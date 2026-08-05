/**
 * The component vocabulary.
 *
 * Eight primitives, each named for WHEN to use it rather than what it looks
 * like. A part called Card or Panel describes an appearance, and a vocabulary of
 * appearances is how the previous single Block came to be the only shape a page
 * could take.
 *
 * Views compose these and carry no layout of their own; scripts/check-tokens.mjs
 * enforces that. This directory is the sanctioned home for raw layout, exactly
 * as tokens.ts is the sanctioned home for raw colour.
 */
export { Editorial } from "./Editorial";
export { Section, slug } from "./Section";
export { Passage, InPage } from "./Passage";
export { Field, FieldGrid, FieldHeadings } from "./Field";
export { Matrix, type CellState } from "./Matrix";
export { Note, classifyNote, type NoteKind } from "./Note";
export { EvidenceBadge, ProofBadge, TranscriptBadge } from "./Badge";
export { Derivation, type Verdict } from "./Derivation";
export { Absence, OpenQuestionsBlock } from "./Absence";
export { Register, OpenQuestions, useDensity, useOpenCollector, type Density } from "./context";
export { warrantClass, warrantMeaning, type Warrant } from "./warrant";
export { Masthead, Tabs } from "./Masthead";
export { EntryRail, cite, worldOf } from "./EntryRail";
export { Shelf, ConflictPanel } from "./Foyer";
export { ReadingKey, type Tier } from "./ReadingKey";
export { CaseItem, CaseList } from "./Case";
export { Chip } from "./Chip";
export { Quiver } from "./Quiver";
export const localName = (iri: string | null) => (iri ?? "").split("/").pop() ?? "";
export { Toggle } from "./Chip";
