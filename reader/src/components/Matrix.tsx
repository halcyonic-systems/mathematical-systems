/**
 * Rows against columns, with four cell states rather than two.
 *
 * The census, the coverage of formalisations, and the cases matrix that will
 * hold the Bunge–Klir clash are all the same shape, so they are one part.
 *
 * FOUR STATES, DELIBERATELY. A present/absent dot collapses two very different
 * epistemic situations, and this is a catalogue whose entire personality is
 * refusing to collapse such things:
 *
 *   yes      recorded, and it holds
 *   no       recorded, and it does not hold
 *   silent   the entry does not speak to this at all
 *   unknown  not yet recorded — an absence in our work, not in the source
 *
 * `silent` and `unknown` are the pair that matters. Bunge refuses ordered
 * collections; Klir is currently `unknown` on the same case because his side of
 * it lives in Bunge's annotation rather than his own entry. Rendering both as a
 * blank would hide exactly the situation worth showing.
 */
import type { ReactNode } from "react";

export type CellState = "yes" | "no" | "silent" | "unknown";

const GLYPH: Record<CellState, string> = { yes: "●", no: "✕", silent: "·", unknown: "?" };
const INK: Record<CellState, string> = {
  yes: "var(--accent)",
  no: "var(--proof-refuted)",
  // Was --hairline, which is the rule colour: the mark was invisible, in the
  // table and in its own legend entry. So `silent` and a cell we had simply
  // failed to render looked identical — and `silent` versus `unknown` is the
  // distinction this matrix exists to draw. Quiet, but present.
  silent: "var(--text-muted)",
  unknown: "var(--proof-not-proven)",
};
const TITLE: Record<CellState, string> = {
  yes: "Recorded, and it holds",
  no: "Recorded, and it does not hold",
  silent: "This entry does not speak to it",
  unknown: "Not yet recorded — a gap in the catalogue, not in the source",
};

export function Matrix({
  columns,
  rows,
  caption,
}: {
  columns: ReactNode[];
  rows: { key: string; label: ReactNode; cells: CellState[]; total?: number; id?: string }[];
  caption?: ReactNode;
}) {
  return (
    <div className="instrument">
      {/* The legend comes BEFORE the glyphs it explains. It was underneath, so
          the first thing a reader met was a column of dots and question marks
          with no key — and `silent` versus `unknown` is the distinction this
          matrix exists to draw. */}
      {caption && <p className="w-open mt-0 mb-2">{caption}</p>}
      <MatrixLegend />
      {/* The scroll container is a div, not the table: a table ignores
          overflow-x, so .scroll-x on it never scrolled and the census pushed
          the page wide on a phone. */}
      <div className="scroll-x">
        <table className="w-full text-sm border-collapse mt-3">
        <thead>
          <tr>
            <th className="eyebrow text-left py-2 pr-4" style={{ borderBottom: "2px solid var(--border)" }}>
              &nbsp;
            </th>
            {columns.map((c, i) => (
              <th
                key={i}
                scope="col"
                className="eyebrow text-left py-2 px-2 align-bottom"
                style={{ borderBottom: "2px solid var(--border)", width: "9rem" }}
              >
                {c}
              </th>
            ))}
            {/* "n" rendered 23px wide and clipped, and asked the reader to
                guess what was being counted. */}
            <th
              className="eyebrow text-right py-2 pl-3 whitespace-nowrap"
              style={{ borderBottom: "2px solid var(--border)" }}
              title="How many entries in view posit this"
            >
              entries
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.key} style={{ background: i % 2 ? "var(--bg-primary)" : "transparent" }}>
              {/* The id makes a row citable and landable — a primitive chip on
                  an entry page points here. scroll-mt keeps the sticky bar off
                  the landing. */}
              <th
                scope="row"
                id={r.id}
                className="py-1.5 pr-4 name-column text-left font-normal scroll-mt-16"
                style={{ borderBottom: "1px solid var(--hairline)" }}
              >
                {r.label}
              </th>
              {r.cells.map((c, j) => (
                <td
                  key={j}
                  className="py-1.5 px-2"
                  style={{ borderBottom: "1px solid var(--hairline)", color: INK[c] }}
                  title={TITLE[c]}
                >
                  <span aria-label={TITLE[c]}>{GLYPH[c]}</span>
                </td>
              ))}
              <td
                className="py-1.5 text-right tabular-nums"
                style={{ borderBottom: "1px solid var(--hairline)", color: "var(--text-muted)" }}
              >
                {r.total ?? r.cells.filter((c) => c === "yes").length}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

/** Glyphs carry the meaning; colour only reinforces it. Never colour alone. */
function MatrixLegend() {
  return (
    <p className="w-open m-0 flex gap-4 flex-wrap">
      {(Object.keys(GLYPH) as CellState[]).map((s) => (
        <span key={s}>
          <span style={{ color: INK[s] }}>{GLYPH[s]}</span> {TITLE[s].toLowerCase()}
        </span>
      ))}
    </p>
  );
}
