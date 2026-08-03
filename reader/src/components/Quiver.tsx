/**
 * A dependency quiver, as the Lean development has it.
 *
 * Positions and arrows read straight out of the shape category. Nothing here
 * claims the encoding is FAITHFUL to the passage beside it — that is a
 * mapping-layer judgement carrying its own evidence, and the gap between what a
 * text says and what a quiver records is the point of showing them together.
 */
import type { Shape } from "../types";

export function Quiver({ shape }: { shape: Shape }) {
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {shape.positions?.map((p) => (
          <span
            key={p.name}
            title={p.doc}
            className="px-2.5 py-1 text-xs"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--accent-slate)",
              borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {p.name}
          </span>
        ))}
      </div>
      <table className="w-full text-sm border-collapse">
        <tbody>
          {shape.arrows?.map((a) => (
            <tr key={a.name}>
              <td
                className="py-2 pr-3 whitespace-nowrap align-top"
                style={{ borderBottom: "1px solid var(--hairline)", fontFamily: "var(--font-mono)" }}
              >
                {a.from}
                <span style={{ color: "var(--accent)" }}> → </span>
                {a.to}
              </td>
              <td className="py-2 align-top" style={{ borderBottom: "1px solid var(--hairline)" }}>
                {a.doc || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {shape.arrowConvention && (
        <p className="w-open mt-3 mb-0">{shape.arrowConvention}</p>
      )}
    </>
  );
}
