/**
 * Text an author wrote, rendered exactly as recorded.
 *
 * Never converted, never re-spaced, never run through a formula renderer. The
 * verbatim is the only thing every downstream encoding is checkable against, so
 * a rendering that "improves" it breaks the catalogue's central discipline. The
 * Unicode mathematics came out of the book that way and stays that way.
 *
 * Two kinds. `quoted` is the definition itself — the page's centre of gravity.
 * `context` is the surrounding passage, set smaller so the two are never
 * mistaken for one another, with the located span marked.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { warrantClass } from "./warrant";

/**
 * The citation and the transcription verdict sit BELOW the quotation, as a
 * caption. Above it they are chrome standing between a reader and the one thing
 * on the page that is not ours — and a provenance line means more once you have
 * read what it is the provenance of.
 */
export function Passage({
  text,
  location,
  caption,
}: {
  text: string | null;
  location?: string | null;
  caption?: ReactNode;
}) {
  if (!text)
    return (
      <p className="w-open m-0">No verbatim recorded.</p>
    );
  return (
    <figure className="m-0">
      <blockquote
        className={`${warrantClass.source} passage-quoted m-0 pl-4`}
        style={{ borderLeft: "3px solid var(--accent)", whiteSpace: "pre-wrap" }}
      >
        {text}
      </blockquote>
      {(location || caption) && (
        <figcaption className="passage-caption mt-3 pl-4 flex items-center gap-3 flex-wrap">
          {/* Not .eyebrow: that uppercases, and a source location is data, not
              fixed UI copy — "ch. 1, eq. (1.1), p. 5" is how the book is cited. */}
          {location && <span className="passage-locus">{location}</span>}
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * The passage in its place on the page, with the located span marked.
 *
 * Capped in height rather than collapsed. This block is the transcription gate
 * made visible — it is the evidence that a verbatim is what the book says — and
 * hiding it by default would hide the thing this reader does that others do not.
 * Capping fixes the proportion complaint without conceding the point.
 */
export function InPage({
  before,
  match,
  after,
}: {
  before: string;
  match: string;
  after: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLElement>(null);

  // The located span opened below the fold: a 22rem box over ~37rem of context,
  // with the highlight some 245px down and the box at scrollTop 0. So the one
  // thing this block exists to prove — that the verbatim is on the page in the
  // book — was the one thing you could not see. Centre it instead.
  useEffect(() => {
    const b = box.current;
    const m = mark.current;
    if (!b || !m) return;
    const target = m.offsetTop - b.clientHeight / 2 + m.offsetHeight / 2;
    b.scrollTop = Math.max(0, target);
  }, [before, match, after]);

  return (
    <>
      {/* Focusable and named: a scroll region a keyboard cannot reach and a
          screen reader cannot announce hides 40% of its content from both.
          No edge fade — colour arrives as a filled region with an edge, and
          the caption below already says the page continues both ways. */}
      <div
        ref={box}
        tabIndex={0}
        role="region"
        aria-label="The page around the located span, from the source"
        className="overflow-y-auto pr-2 relative"
        style={{ maxHeight: "22rem", fontFamily: "var(--font-display)", fontSize: "1.05rem", lineHeight: 1.6 }}
      >
        <span style={{ color: "var(--text-muted)" }}>…{before}</span>
        <mark
          ref={mark}
          style={{ background: "var(--accent-soft)", color: "var(--text-primary)" }}
          className="px-0.5"
        >
          {match}
        </mark>
        <span style={{ color: "var(--text-muted)" }}>{after}…</span>
      </div>
      <p className="eyebrow m-0 mt-2">Scrolled to the located span · the surrounding page continues above and below</p>
    </>
  );
}
