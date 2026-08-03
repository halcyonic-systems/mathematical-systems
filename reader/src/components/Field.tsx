/**
 * A labelled row whose cells align with the same row in every other column.
 *
 * This is the Compare fix. Compare previously rendered each definition as an
 * independent flow container, so a field landed wherever the preceding content
 * happened to end — the Posits row of one definition sat roughly 200px above the
 * next, because one passage is four times longer than another. Comparison by eye
 * was impossible; a reader had to scroll and remember.
 *
 * One label, N cells, laid on a shared grid: the label column is common and
 * every row's top edge is the same across all columns, which is the entire
 * reason a comparison view exists. With one cell it serves the Read view too, so
 * an entry and a comparison of entries are built from the same part.
 */
import type { ReactNode } from "react";
import { warrantClass, type Warrant } from "./warrant";

export function Field({
  label,
  cells,
  warrant = "decided",
}: {
  label: string;
  cells: ReactNode[];
  warrant?: Warrant;
}) {
  return (
    <>
      <dt className="eyebrow py-3 pr-4" style={{ borderTop: "1px solid var(--hairline)" }}>
        {label}
      </dt>
      {cells.map((cell, i) => (
        <dd
          key={i}
          className={`${warrantClass[warrant]} m-0 py-3`}
          style={{ borderTop: "1px solid var(--hairline)", maxWidth: "none" }}
        >
          {cell}
        </dd>
      ))}
    </>
  );
}

/** The shared grid. `columns` must match the length of every row's `cells`. */
export function FieldGrid({
  columns,
  scrollable,
  children,
}: {
  columns: number;
  /** Scroll sideways rather than reflow: a comparison that stacks is no longer one. */
  scrollable?: boolean;
  children: ReactNode;
}) {
  return (
    <dl
      className={`m-0 grid items-start ${scrollable ? "scroll-x" : ""}`}
      style={{
        gridTemplateColumns: `max-content repeat(${columns}, minmax(0, 1fr))`,
        columnGap: "1.5rem",
      }}
    >
      {children}
    </dl>
  );
}

/** Column headings for a FieldGrid, sitting above the first row. */
export function FieldHeadings({ headings }: { headings: ReactNode[] }) {
  return (
    <>
      <div aria-hidden />
      {headings.map((h, i) => (
        <div key={i} className="name-column text-sm font-semibold pb-2" style={{ color: "var(--text-primary)" }}>
          {h}
        </div>
      ))}
    </>
  );
}
