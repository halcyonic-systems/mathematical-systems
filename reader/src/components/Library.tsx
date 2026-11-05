/**
 * Every declaration of the development as a list: searchable, filtered by
 * kind, group, tradition, and whether it carries an atlas tag. The map shows
 * the shape of the development; the list is for finding one thing in it.
 * Stacks has a Library beside its Graph for the same reason.
 */
import { useMemo, useState } from "react";
import { href } from "../route";
import { kind as kindColor, kindGroup } from "../tokens";
import type { LeanDecl, LeanDump } from "../types";
import { traditionOf } from "./Treemap";

const plain = (e: React.MouseEvent) => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

const control = {
  border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", color: "var(--text-primary)",
} as const;

/** Map · Library: the two doors into the development, one lit. */
export function DevNav({ active, onOpen }: { active: "graph" | "library"; onOpen: (v: "graph" | "library") => void }) {
  return (
    <nav aria-label="Development views" className="flex gap-1 mb-4">
      {(["graph", "library"] as const).map((v) => (
        <a
          key={v}
          href={href({ view: v })}
          aria-current={active === v ? "page" : undefined}
          onClick={(e) => { if (plain(e)) return; e.preventDefault(); onOpen(v); }}
          className="text-xs px-3 py-1 no-underline"
          style={{ ...control, background: active === v ? "var(--accent-soft)" : "var(--bg-secondary)", color: active === v ? "var(--accent-strong)" : "var(--text-secondary)" }}
        >
          {v === "graph" ? "Map" : "Library"}
        </a>
      ))}
    </nav>
  );
}

const groupOf = (d: LeanDecl) => { const p = d.module.split("."); return p.length >= 3 ? p[1] : "Root"; };
const shortModule = (d: LeanDecl) => { const p = d.module.split("."); return p.length >= 3 ? p.slice(2).join(".") : p[p.length - 1]; };

export function DeclList({ lean, onOpen }: { lean: LeanDump; onOpen: (name: string) => void }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [group, setGroup] = useState("");
  const [tradition, setTradition] = useState("");
  const [tagged, setTagged] = useState(false);
  const [limit, setLimit] = useState(200);

  const rows = useMemo(() => lean.declarations.map((d) => ({ d, group: groupOf(d), tradition: traditionOf(d), kg: kindGroup(d.kind) })), [lean]);
  const groups = useMemo(() => [...new Set(rows.map((r) => r.group))].sort(), [rows]);
  const traditions = useMemo(() => [...new Set(rows.map((r) => r.tradition))].sort(), [rows]);
  const needle = q.trim().toLowerCase();
  const hits = rows.filter((r) =>
    (!needle || r.d.name.toLowerCase().includes(needle) || (r.d.doc ?? "").toLowerCase().includes(needle))
    && (!kind || r.kg === kind) && (!group || r.group === group) && (!tradition || r.tradition === tradition) && (!tagged || r.d.atlas.length > 0));
  const shown = hits.slice(0, limit);

  const select = (value: string, set: (v: string) => void, options: string[], all: string, label: string) => (
    <select aria-label={label} value={value} onChange={(e) => set(e.target.value)} className="text-xs px-2 py-1" style={control}>
      <option value="">{all}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div className="instrument">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setLimit(200); }} placeholder="Name or docstring" aria-label="Search declarations" className="text-sm px-2 py-1" style={{ ...control, fontFamily: "var(--font-mono)", width: "18rem" }} />
        {select(kind, setKind, Object.keys(kindColor), "every kind", "Kind")}
        {select(group, setGroup, groups, "every group", "Group")}
        {select(tradition, setTradition, traditions, "every tradition", "Tradition")}
        <label className="text-xs flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
          <input type="checkbox" checked={tagged} onChange={(e) => setTagged(e.target.checked)} /> tagged only
        </label>
        <span className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{hits.length.toLocaleString()} of {rows.length.toLocaleString()}</span>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-xs" style={{ color: "var(--text-muted)" }}>
            {["Declaration", "Kind", "Module", "Line", "Tradition", "Atlas"].map((h) => (
              <th key={h} className="text-left font-medium pb-2 pr-3" style={{ borderBottom: "1px solid var(--border)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map(({ d, group: g, tradition: t, kg }) => (
            <tr key={d.name}>
              <td className="py-1 pr-3" style={{ borderBottom: "1px solid var(--hairline)", fontFamily: "var(--font-mono)", fontSize: "var(--step--2)", wordBreak: "break-all" }}>
                <a href={href({ view: "lean", decl: d.name })} onClick={(e) => { if (plain(e)) return; e.preventDefault(); onOpen(d.name); }} style={{ color: "var(--accent-strong)" }}>{d.name}</a>
              </td>
              <td className="py-1 pr-3 text-xs whitespace-nowrap" style={{ borderBottom: "1px solid var(--hairline)", color: "var(--text-secondary)" }}>
                <i aria-hidden style={{ display: "inline-block", width: 8, height: 8, marginRight: 5, background: kindColor[kg], borderRadius: 2 }} />{d.kind}
              </td>
              <td className="py-1 pr-3 text-xs" style={{ borderBottom: "1px solid var(--hairline)", color: "var(--text-secondary)" }}>{g} · {shortModule(d)}</td>
              <td className="py-1 pr-3 text-xs" style={{ borderBottom: "1px solid var(--hairline)", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{d.line}</td>
              <td className="py-1 pr-3 text-xs" style={{ borderBottom: "1px solid var(--hairline)", color: "var(--text-secondary)" }}>{t}</td>
              <td className="py-1 text-xs" style={{ borderBottom: "1px solid var(--hairline)", fontFamily: "var(--font-mono)" }}>
                {d.atlas.map((id) => (
                  <a key={id} href={href({ view: "read", entry: id })} style={{ color: "var(--accent-strong)" }}>{id}</a>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {hits.length > shown.length && (
        <button type="button" onClick={() => setLimit(limit + 400)} className="text-xs px-3 py-1 mt-3" style={{ ...control, cursor: "pointer", color: "var(--text-secondary)" }}>
          Show {Math.min(400, hits.length - shown.length)} more
        </button>
      )}
    </div>
  );
}
