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
import { warrantClass } from "./warrant";

export function Passage({ text, location }: { text: string | null; location?: string | null }) {
  if (!text)
    return (
      <p className="w-open m-0">No verbatim recorded.</p>
    );
  return (
    <figure className="m-0">
      {location && (
        <figcaption className="eyebrow mb-2" style={{ color: "var(--text-muted)" }}>
          {location}
        </figcaption>
      )}
      <blockquote
        className={`${warrantClass.source} m-0 pl-4`}
        style={{ borderLeft: "3px solid var(--accent)", whiteSpace: "pre-wrap" }}
      >
        {text}
      </blockquote>
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
  return (
    <div
      className="overflow-y-auto pr-2"
      style={{ maxHeight: "22rem", fontFamily: "var(--font-display)", fontSize: "1.05rem", lineHeight: 1.6 }}
    >
      <span style={{ color: "var(--text-muted)" }}>…{before}</span>
      <mark style={{ background: "var(--accent-soft)", color: "var(--text-primary)" }} className="px-0.5">
        {match}
      </mark>
      <span style={{ color: "var(--text-muted)" }}>{after}…</span>
    </div>
  );
}
