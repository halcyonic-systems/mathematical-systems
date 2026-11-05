/**
 * The Lean development as a map: one cell per declaration, tiles per module,
 * grouped by folder or by tradition. Select a cell and its edges are drawn —
 * what it uses, what uses it — with the rest dimmed.
 *
 * On the pattern of stacks.axiommath.ai/graph: a squarified treemap (d3-
 * hierarchy for the layout) drawn on a Canvas, sized by declaration count, with
 * edges only for the selection. At ~1,600 nodes the map is the hero; a 3D
 * "city" needs two orders of magnitude more to read and does not transfer.
 *
 * Everything here is `derived`: tile sizes are counts, edges are the
 * environment's own `uses`, and the tradition grouping is the mechanical rule
 * in `traditionOf`, which the legend names as such.
 */
import { hierarchy, treemap, treemapSquarify, type HierarchyRectangularNode } from "d3-hierarchy";
import { useEffect, useMemo, useRef, useState } from "react";
import { kind as kindColor, kindGroup } from "../tokens";
import type { LeanDecl, LeanDump } from "../types";

export const TRADITIONS = [
  "Klir", "Bunge", "Mobus", "Joslyn", "Mesarovic", "Myers", "Wymore",
  "Spivak", "Willems", "Rosen", "Bertalanffy", "CDL",
] as const;

/**
 * Which tradition a declaration belongs to, read mechanically from its module
 * and its name. A name is not a claim of membership: `Systems.Klir.*` and
 * `ShapeKlir` are Klir's because the development's own folders and prefixes
 * say so, and a declaration naming no tradition is "shared", which is most of
 * Core, Principles and Dynamics. The atlas tag (`@[atlas]`) is the narrow,
 * asserted link; this is the wide, derived one, and they are kept apart.
 */
export function traditionOf(d: LeanDecl): string {
  const parts = d.module.split(".");
  const folder = parts[1] ?? "";
  if ((TRADITIONS as readonly string[]).includes(folder)) return folder;
  const tail = parts.slice(2).join(".") + " " + d.name;
  const hit = TRADITIONS.find((t) => new RegExp(`(^|[^A-Za-z])${t}|Shape${t}|${t}(Position|Arrow|Shape|System|Witness)`).test(tail));
  return hit ?? "Shared";
}

type Cell = { d: LeanDecl; x: number; y: number; s: number };
type Leaf = { name: string; short: string; value: number; decls: LeanDecl[] };
type Group = { name: string; children: Leaf[] };

const W = 1600, H = 1000;

function layout(lean: LeanDump, by: "module" | "tradition") {
  const groups = new Map<string, Map<string, Leaf>>();
  for (const d of lean.declarations) {
    const parts = d.module.split(".");
    const g = by === "tradition" ? traditionOf(d) : parts.length >= 3 ? parts[1] : "Root";
    const short = parts.length >= 3 ? parts.slice(2).join(".") : parts[parts.length - 1];
    if (!groups.has(g)) groups.set(g, new Map());
    const mods = groups.get(g)!;
    if (!mods.has(d.module)) mods.set(d.module, { name: d.module, short, value: 0, decls: [] });
    const leaf = mods.get(d.module)!;
    leaf.value++;
    leaf.decls.push(d);
  }
  const root = hierarchy<{ name: string; children?: Group[] | Leaf[] }>({
    name: "root",
    children: [...groups].map(([name, mods]) => ({ name, children: [...mods.values()] })),
  })
    .sum((n) => ("value" in n ? (n as Leaf).value : 0))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  treemap<{ name: string }>().size([W, H]).paddingOuter(6).paddingTop(22).paddingInner(3).tile(treemapSquarify.ratio(1.2)).round(true)(root);
  const cells = new Map<string, Cell>();
  const bands = new Map<string, number>();
  for (const leaf of root.leaves() as unknown as HierarchyRectangularNode<Leaf>[]) {
    const band = leaf.y1 - leaf.y0 > 40 ? 14 : 0;
    bands.set(leaf.data.name, band);
    const w = leaf.x1 - leaf.x0 - 4, h = leaf.y1 - leaf.y0 - 4 - band, n = leaf.data.decls.length;
    if (n === 0 || w <= 0 || h <= 0) continue;
    let cols = Math.max(1, Math.ceil(Math.sqrt((n * w) / h)));
    let rows = Math.ceil(n / cols);
    let s = Math.min(w / cols, h / rows);
    if (rows * s > h) { rows = Math.max(1, Math.floor(h / s)); cols = Math.ceil(n / rows); s = Math.min(w / cols, h / rows); }
    const ds = leaf.data.decls.slice().sort((a, b) => a.line - b.line);
    ds.forEach((d, i) => cells.set(d.name, { d, x: leaf.x0 + 2 + (i % cols) * s, y: leaf.y0 + 2 + band + Math.floor(i / cols) * s, s }));
  }
  return { root: root as unknown as HierarchyRectangularNode<{ name: string }>, cells, bands };
}

export function Treemap({
  lean,
  by,
  selected,
  onSelect,
  onBy,
}: {
  lean: LeanDump;
  by: "module" | "tradition";
  selected: string | null;
  onSelect: (name: string | null) => void;
  onBy: (by: "module" | "tradition") => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const view = useRef({ tx: 0, ty: 0, k: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const { root, cells, bands } = useMemo(() => layout(lean, by), [lean, by]);
  const byName = useMemo(() => new Map(lean.declarations.map((d) => [d.name, d])), [lean]);
  const usedBy = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const d of lean.declarations) for (const u of d.uses) m.set(u, [...(m.get(u) ?? []), d.name]);
    return m;
  }, [lean]);

  const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  const fit = () => {
    const c = canvasRef.current; if (!c) return;
    const cw = c.width / devicePixelRatio, ch = c.height / devicePixelRatio;
    const k = Math.min(cw / W, ch / H) * 0.98;
    view.current = { k, tx: (cw - W * k) / 2, ty: (ch - H * k) / 2 };
  };

  const draw = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const { tx, ty, k } = view.current;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.fillStyle = css("--bg-primary"); ctx.fillRect(0, 0, c.width, c.height);
    ctx.translate(tx, ty); ctx.scale(k, k);
    const body = css("--font-body") || "Inter, sans-serif";
    for (const g of root.children ?? []) {
      ctx.fillStyle = css("--bg-surface"); ctx.fillRect(g.x0, g.y0, g.x1 - g.x0, g.y1 - g.y0);
      ctx.fillStyle = css("--text-secondary"); ctx.font = `600 ${13 / Math.max(k, 0.6)}px ${body}`; ctx.textBaseline = "top";
      ctx.fillText(g.data.name, g.x0 + 6, g.y0 + 5);
      for (const m of g.children ?? []) {
        ctx.fillStyle = css("--bg-secondary"); ctx.fillRect(m.x0, m.y0, m.x1 - m.x0, m.y1 - m.y0);
        const leaf = m.data as Leaf;
        if (bands.get(leaf.name) && (m.x1 - m.x0) * k > 60) {
          ctx.fillStyle = css("--text-muted"); ctx.font = `500 ${10 / Math.max(k, 0.6)}px ${body}`;
          ctx.fillText(leaf.short, m.x0 + 4, m.y0 + 3, m.x1 - m.x0 - 8);
        }
      }
    }
    const related = new Set<string>();
    if (selected && byName.has(selected)) {
      related.add(selected);
      for (const u of byName.get(selected)!.uses) related.add(u);
      for (const u of usedBy.get(selected) ?? []) related.add(u);
    }
    for (const [name, cell] of cells) {
      ctx.globalAlpha = selected && !related.has(name) ? 0.22 : 1;
      ctx.fillStyle = kindColor[kindGroup(cell.d.kind)];
      ctx.fillRect(cell.x + 0.5, cell.y + 0.5, cell.s - 1, cell.s - 1);
    }
    ctx.globalAlpha = 1;
    if (selected && cells.has(selected)) {
      const a = cells.get(selected)!; const ac: [number, number] = [a.x + a.s / 2, a.y + a.s / 2];
      ctx.lineWidth = 1.2 / k;
      const line = (p: [number, number], q: [number, number], col: string) => { ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...q); ctx.stroke(); };
      for (const u of byName.get(selected)!.uses) { const b = cells.get(u); if (b) line(ac, [b.x + b.s / 2, b.y + b.s / 2], css("--accent-strong")); }
      for (const u of usedBy.get(selected) ?? []) { const b = cells.get(u); if (b) line([b.x + b.s / 2, b.y + b.s / 2], ac, css("--accent-slate")); }
      ctx.strokeStyle = css("--text-primary"); ctx.lineWidth = 2 / k; ctx.strokeRect(a.x - 1, a.y - 1, a.s + 2, a.s + 2);
    }
    if (hover && cells.has(hover) && hover !== selected) {
      const h = cells.get(hover)!; ctx.strokeStyle = css("--accent-strong"); ctx.lineWidth = 1.5 / k; ctx.strokeRect(h.x - 0.5, h.y - 0.5, h.s + 1, h.s + 1);
    }
  };

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const resize = () => {
      const r = c.parentElement!.getBoundingClientRect();
      const h = Math.max(420, Math.round(r.width * (H / W)));
      c.width = r.width * devicePixelRatio; c.height = h * devicePixelRatio;
      c.style.width = `${r.width}px`; c.style.height = `${h}px`;
      fit(); draw();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c.parentElement!);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root]);
  useEffect(draw);

  const toWorld = (e: { clientX: number; clientY: number }): [number, number] => {
    const r = canvasRef.current!.getBoundingClientRect(); const { tx, ty, k } = view.current;
    return [(e.clientX - r.left - tx) / k, (e.clientY - r.top - ty) / k];
  };
  const hit = ([x, y]: [number, number]) => {
    for (const [name, c] of cells) if (x >= c.x && x < c.x + c.s && y >= c.y && y < c.y + c.s) return name;
    return null;
  };
  const drag = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);

  const search = (v: string) => {
    const q = v.trim(); if (!q) return;
    const exact = byName.has(q) ? q : lean.declarations.find((d) => d.name.toLowerCase().includes(q.toLowerCase()))?.name;
    if (exact) onSelect(exact);
  };

  const legend = (Object.keys(kindColor) as (keyof typeof kindColor)[]).map((k) => (
    <span key={k} className="text-xs" style={{ color: "var(--text-secondary)" }}>
      <i aria-hidden style={{ display: "inline-block", width: 9, height: 9, marginRight: 5, verticalAlign: -1, background: kindColor[k], borderRadius: 2 }} />
      {k}
    </span>
  ));

  return (
    <div className="instrument">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
        <input
          type="search"
          placeholder="Find a declaration"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") search(query); }}
          aria-label="Find a declaration"
          className="text-sm px-2 py-1"
          style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontFamily: "var(--font-mono)", width: "18rem" }}
        />
        <span role="group" aria-label="Group by" className="flex gap-1">
          {(["module", "tradition"] as const).map((g) => (
            <button
              key={g}
              type="button"
              aria-pressed={by === g}
              onClick={() => onBy(g)}
              className="text-xs px-2 py-1"
              style={{
                border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer",
                background: by === g ? "var(--accent-soft)" : "var(--bg-secondary)", color: by === g ? "var(--accent-strong)" : "var(--text-secondary)",
              }}
            >
              by {g}
            </button>
          ))}
        </span>
        <button type="button" onClick={() => { fit(); draw(); }} className="text-xs px-2 py-1" style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", color: "var(--text-secondary)", cursor: "pointer" }}>
          Fit
        </button>
        <span className="flex gap-3">{legend}</span>
        <span className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {hover ? `${hover} · ${byName.get(hover)?.kind}` : "click a cell · drag to pan · wheel to zoom"}
        </span>
      </div>
      {by === "tradition" && (
        <p className="text-xs m-0 mb-2" style={{ color: "var(--text-muted)" }}>
          Grouped by a mechanical reading of folder and name prefixes; “Shared” is every declaration naming no tradition. The asserted link is the atlas tag on a declaration's page.
        </p>
      )}
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
        <canvas
          ref={canvasRef}
          style={{ display: "block", cursor: "crosshair" }}
          onMouseDown={(e) => { drag.current = { x: e.clientX, y: e.clientY, tx: view.current.tx, ty: view.current.ty, moved: false }; }}
          onMouseMove={(e) => {
            const d = drag.current;
            if (d) {
              const dx = e.clientX - d.x, dy = e.clientY - d.y;
              if (Math.hypot(dx, dy) > 3) d.moved = true;
              view.current = { ...view.current, tx: d.tx + dx, ty: d.ty + dy }; draw(); return;
            }
            const h = hit(toWorld(e)); if (h !== hover) setHover(h);
          }}
          onMouseUp={(e) => { const d = drag.current; drag.current = null; if (d && !d.moved) onSelect(hit(toWorld(e))); }}
          onMouseLeave={() => { drag.current = null; setHover(null); }}
          onWheel={(e) => {
            const [wx, wy] = toWorld(e); const r = canvasRef.current!.getBoundingClientRect();
            const k = Math.max(0.2, Math.min(40, view.current.k * Math.exp(-e.deltaY * 0.0015)));
            view.current = { k, tx: e.clientX - r.left - wx * k, ty: e.clientY - r.top - wy * k }; draw();
          }}
        />
      </div>
    </div>
  );
}
