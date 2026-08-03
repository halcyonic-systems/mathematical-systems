/**
 * An encoder's annotation, classed by the job it is doing.
 *
 * The apparatus previously ran six all-caps headings in identical styling, and
 * they do very different work: "Verified" is a provenance claim, "Deliberately
 * not asserted" is a methodological commitment, "Census note" is an encoding
 * decision, "Adjacent material" is a scope boundary, and on the Bunge entry "The
 * separating instance" is the most substantive finding in the whole catalogue.
 * Only a literal ⚑ in the text distinguished the last of those.
 *
 * Three kinds:
 *   finding    something noticed that changes what the catalogue says
 *   decision   a choice made, with its reason
 *   boundary   the edge of what has been done — scope, next tier, cross-refs
 *
 * `boundary` notes are also open questions. They render here quietly and are
 * collected into the entry's open block, rather than being duplicated by hand.
 */
import { Editorial } from "./Editorial";
import { warrantClass } from "./warrant";

export type NoteKind = "finding" | "decision" | "boundary";

/** Titles that signal an open edge rather than a settled decision. */
const BOUNDARY_TITLES = /ADJACENT MATERIAL|NEXT TIER|NOT YET/;

export function classifyNote(kind: "flag" | "section" | "prose", title: string | null): NoteKind {
  if (kind === "flag") return "finding";
  if (title && BOUNDARY_TITLES.test(title)) return "boundary";
  return "decision";
}

export function Note({
  kind,
  title,
  children,
}: {
  kind: NoteKind;
  title: string | null;
  children: string;
}) {
  const ink =
    kind === "finding" ? "var(--proof-not-proven)" : kind === "boundary" ? "var(--text-muted)" : "var(--text-secondary)";
  return (
    <div
      className="mb-4 last:mb-0"
      style={
        kind === "finding"
          ? { borderLeft: "3px solid var(--proof-not-proven)", paddingLeft: "0.875rem" }
          : undefined
      }
    >
      {title && (
        <h3 className="eyebrow mb-1" style={{ color: ink }}>
          {kind === "finding" ? "⚑ " : ""}
          {title}
        </h3>
      )}
      <p className={`${warrantClass[kind === "boundary" ? "open" : "decided"]} m-0`}>
        <Editorial>{children}</Editorial>
      </p>
    </div>
  );
}
