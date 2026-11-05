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
import type { Atlas, LeanDecl, LeanDump } from "../types";

export const TRADITIONS = [
  "Klir", "Bunge", "Mobus", "Joslyn", "Mesarovic", "Myers", "Wymore",
  "Spivak", "Willems", "Rosen", "Bertalanffy", "CDL",
] as const;

/**
 * Which tradition a declaration belongs to, read mechanically from its module
 * and its name. A name is not a claim of membership: `Systems.Klir.*` and
 * `ShapeKlir` are Klir's because the development's own folders and prefixes
 * say so, and a declaration naming no tradition is shared: it keeps its own
 * folder as its group (Core, Principles, Category, Dynamics), so the shared
 * development reads as the few parts it has rather than one undivided mass.
 * The atlas tag (`@[atlas]`) is the narrow, asserted link; this is the wide,
 * derived one, and they are kept apart.
 */
export function traditionOf(d: LeanDecl): string {
  const parts = d.module.split(".");
  const folder = parts[1] ?? "";
  if ((TRADITIONS as readonly string[]).includes(folder)) return folder;
  const tail = parts.slice(2).join(".") + " " + d.name;
  const hit = TRADITIONS.find((t) => new RegExp(`(^|[^A-Za-z])${t}|Shape${t}|${t}(Position|Arrow|Shape|System|Witness)`).test(tail));
  return hit ?? (parts.length >= 3 ? folder : "Root");
}

/** A door: an atlas entry's tagged declaration, the way in from the map to the concept. */
export type Door = { entry: string; number: string; label: string; decl: string | null };

/** Short form of an entry's label: its number and the author-and-year head, "003 Bunge (1979)". */
const doorLabel = (number: string, label: string | null) => `${number} ${(label ?? "").split(",")[0]}`;

/**
 * The atlas's entries as doors, in accession order. An entry with no tagged
 * declaration is still a door, with no cell: the legend shows it faded, which
 * is the honest state ("nothing formalises this yet").
 */
export function doorsOf(atlas: Atlas): Door[] {
  return atlas.entries.map((e) => {
    const shape = atlas.shapes[e.iri];
    const tagged = shape && shape.status === "resolved" ? shape.tagged ?? [] : [];
    return { entry: e.id, number: e.number, label: doorLabel(e.number, e.label), decl: tagged[0] ?? null };
  });
}

type Cell = { d: LeanDecl; x: number; y: number; s: number };
type Leaf = { name: string; short: string; value: number; decls: LeanDecl[] };
type Group = { name: string; children: Leaf[] };

const W = 1600;

/** World height for the map's aspect: the full map, the front page's strip, or a given ratio. */
const heightFor = (compact: boolean, aspect?: number) => Math.round(W * (aspect ?? (compact ? 0.36 : 0.625)));

function layout(lean: LeanDump, by: "module" | "tradition", H: number) {
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
  treemap<{ name: string }>().size([W, H]).paddingOuter(8).paddingTop(24).paddingInner(4).tile(treemapSquarify.ratio(1.2)).round(true)(root);
  const cells = new Map<string, Cell>();
  const bands = new Map<string, number>();
  // Rects a click can focus: every group and every module, by name.
  const rects = new Map<string, { x0: number; y0: number; x1: number; y1: number; group?: string }>();
  const laid = root as unknown as HierarchyRectangularNode<{ name: string }>;
  for (const g of laid.children ?? []) {
    rects.set(g.data.name, { x0: g.x0, y0: g.y0, x1: g.x1, y1: g.y1 });
    for (const m of g.children ?? []) rects.set((m.data as Leaf).name, { x0: m.x0, y0: m.y0, x1: m.x1, y1: m.y1, group: g.data.name });
  }
  for (const leaf of root.leaves() as unknown as HierarchyRectangularNode<Leaf>[]) {
    const band = leaf.y1 - leaf.y0 > 44 ? 17 : 0;
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
  return { root: root as unknown as HierarchyRectangularNode<{ name: string }>, cells, bands, rects };
}

export function Treemap({
  lean,
  by,
  selected,
  onSelect,
  onBy,
  focus,
  onFocus,
  doors = [],
  compact = false,
  aspect,
}: {
  lean: LeanDump;
  /** The atlas entries, drawn as rings on their tagged cells and listed as a legend. */
  doors?: Door[];
  by: "module" | "tradition";
  selected: string | null;
  onSelect: (name: string | null) => void;
  onBy: (by: "module" | "tradition") => void;
  /** A group or module name the map is zoomed to; null for the whole. */
  focus: string | null;
  onFocus: (name: string | null) => void;
  /** The front page's version: no toolbar, a shorter canvas, a door to /graph. */
  compact?: boolean;
  /** Height as a fraction of width; overrides the compact and full defaults. */
  aspect?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const view = useRef({ tx: 0, ty: 0, k: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  // Filters, local to the map: which edge directions are drawn, which kinds
  // are shown. A hidden kind stays on the map, faint, so the tiles keep their
  // shape; filtering never re-lays the map out from under the reader.
  const [showUses, setShowUses] = useState(true);
  const [showUsedBy, setShowUsedBy] = useState(true);
  const [hidden, setHidden] = useState<Set<keyof typeof kindColor>>(new Set());
  // Motion. Edges grow out from a selection over GROW_MS and a ring pulses
  // once; while nothing is selected or hovered, an idle tour draws one random
  // theorem's edges faintly every few seconds, the way Stacks' graph does.
  // Both are off under prefers-reduced-motion: the map is complete without them.
  const GROW_MS = 420, PULSE_MS = 700, TOUR_EVERY_MS = 3200;
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const anim = useRef<{ start: number; name: string } | null>(null);
  const tour = useRef<{ start: number; name: string } | null>(null);
  const raf = useRef<number | null>(null);
  const H = heightFor(compact, aspect);
  const { root, cells, bands, rects } = useMemo(() => layout(lean, by, H), [lean, by, H]);
  const byName = useMemo(() => new Map(lean.declarations.map((d) => [d.name, d])), [lean]);
  const usedBy = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const d of lean.declarations) for (const u of d.uses) m.set(u, [...(m.get(u) ?? []), d.name]);
    return m;
  }, [lean]);

  const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  /** Fit the whole, or the focused rect with a margin. */
  const fit = () => {
    const c = canvasRef.current; if (!c) return;
    const cw = c.width / devicePixelRatio, ch = c.height / devicePixelRatio;
    const r = (focus && rects.get(focus)) || { x0: 0, y0: 0, x1: W, y1: H };
    const rw = r.x1 - r.x0, rh = r.y1 - r.y0;
    const k = Math.min(cw / rw, ch / rh) * (focus ? 0.94 : 0.98);
    view.current = { k, tx: (cw - rw * k) / 2 - r.x0 * k, ty: (ch - rh * k) / 2 - r.y0 * k };
  };
  // A new focus refits; the user's own pan and zoom are kept otherwise.
  useEffect(() => { fit(); draw(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [focus, rects]);

  const draw = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const { tx, ty, k } = view.current;
    // Clear in device pixels, before any scaling: with the page zoomed out the
    // ratio is below 1 and a scaled fill would leave the old frame at the edges.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = css("--bg-primary"); ctx.fillRect(0, 0, c.width, c.height);
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.translate(tx, ty); ctx.scale(k, k);
    const body = css("--font-body") || "Inter, sans-serif";
    // A group is a title on open ground; a module is a pale box with a hairline.
    // Boxes inside boxes, each filled a little darker, was what made the first
    // version heavy: here the ground is the page and only the module has an edge.
    const fs = (px: number) => px / Math.max(k, 0.6);
    for (const g of root.children ?? []) {
      ctx.fillStyle = css("--text-primary"); ctx.font = `600 ${fs(13)}px ${body}`; ctx.textBaseline = "top";
      ctx.fillText(g.data.name, g.x0 + 2, g.y0 + 4);
      for (const m of g.children ?? []) {
        ctx.fillStyle = css("--bg-secondary"); ctx.fillRect(m.x0, m.y0, m.x1 - m.x0, m.y1 - m.y0);
        ctx.strokeStyle = css("--border"); ctx.lineWidth = 1 / k; ctx.strokeRect(m.x0 + 0.5 / k, m.y0 + 0.5 / k, m.x1 - m.x0 - 1 / k, m.y1 - m.y0 - 1 / k);
        const leaf = m.data as Leaf;
        if (bands.get(leaf.name) && (m.x1 - m.x0) * k > 56) {
          ctx.fillStyle = css("--text-primary"); ctx.font = `600 ${fs(10)}px ${body}`;
          const name = leaf.short, count = String(leaf.decls.length);
          const cw = (m.x1 - m.x0) * k > 110 ? ctx.measureText(count).width + fs(6) : 0;
          ctx.fillText(name, m.x0 + 4, m.y0 + 4, m.x1 - m.x0 - 8 - cw);
          if (cw) { ctx.fillStyle = css("--text-muted"); ctx.font = `500 ${fs(8.5)}px ${body}`; ctx.fillText(count, m.x1 - 4 - ctx.measureText(count).width, m.y0 + 5); }
        }
      }
    }
    const related = new Set<string>();
    if (selected && byName.has(selected)) {
      related.add(selected);
      if (showUses) for (const u of byName.get(selected)!.uses) related.add(u);
      if (showUsedBy) for (const u of usedBy.get(selected) ?? []) related.add(u);
    }
    for (const [name, cell] of cells) {
      const kg = kindGroup(cell.d.kind);
      // The hero dims less on a selection: it is the page's picture, and a
      // picture that goes pale on every click reads as broken rather than focused.
      ctx.globalAlpha = hidden.has(kg) ? 0.08 : selected && !related.has(name) ? (compact ? 0.45 : 0.22) : 1;
      ctx.fillStyle = kindColor[kg];
      // A dot in its slot, not a block filling it: the gaps are what let a
      // thousand cells read as a texture rather than a wall.
      const dsz = cell.s * 0.6, off = (cell.s - dsz) / 2;
      ctx.fillRect(cell.x + off, cell.y + off, dsz, dsz);
    }
    ctx.globalAlpha = 1;
    // Doors: a ring on every entry's tagged cell, sized so it reads at any
    // zoom, and the entry's short label once the cell is big enough on screen.
    /** A small label on a pale pad, centred above (cx, top), in world units. */
    const labelAbove = (text: string, cx: number, top: number, col: string) => {
      const fs = 10 / Math.max(k, 0.6); ctx.font = `600 ${fs}px ${body}`; ctx.textBaseline = "bottom";
      const tw = ctx.measureText(text).width;
      ctx.fillStyle = css("--bg-primary"); ctx.globalAlpha = 0.92; ctx.fillRect(cx - tw / 2 - 3 / k, top - fs - 4 / k, tw + 6 / k, fs + 3 / k); ctx.globalAlpha = 1;
      ctx.fillStyle = col; ctx.fillText(text, cx - tw / 2, top - 1.5 / k);
      ctx.textBaseline = "top";
    };
    for (const door of doors) {
      const c = door.decl ? cells.get(door.decl) : undefined; if (!c) continue;
      const cx = c.x + c.s / 2, cy = c.y + c.s / 2, r = Math.max(c.s * 0.85, 7 / k);
      // A pale halo under the ring so it reads on every tile colour.
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = css("--bg-primary"); ctx.lineWidth = 4 / k; ctx.stroke();
      ctx.strokeStyle = css("--accent-strong"); ctx.lineWidth = 1.8 / k; ctx.stroke();
      // Labels only once a cell is big enough on screen: on the hero the doors
      // cluster and their labels would collide, so the ring alone marks them.
      if (c.s * k >= 14 && !compact) labelAbove(door.label, cx, cy - r, css("--accent-strong"));
    }
    // The pointer's cell names itself on the canvas: no native tooltip,
    // nothing that moves the page.
    if (hover && cells.has(hover) && hover !== selected) {
      const c = cells.get(hover)!; const door = doors.find((d) => d.decl === hover);
      const text = door ? door.label : hover.split(".").slice(-2).join(".");
      labelAbove(text, c.x + c.s / 2, c.y - 2 / k, door ? css("--accent-strong") : css("--text-primary"));
    }
    const now = performance.now();
    const visible = (n: string) => { const c = cells.get(n); return c && !hidden.has(kindGroup(c.d.kind)) ? c : undefined; };
    /** Edges of `name`, grown to fraction `p` from their origin, at `alpha`. */
    const edgesOf = (name: string, p: number, alpha: number) => {
      const a = cells.get(name); if (!a) return;
      const ac: [number, number] = [a.x + a.s / 2, a.y + a.s / 2];
      ctx.globalAlpha = alpha; ctx.lineWidth = 1.5 / k;
      const grow = (from: [number, number], to: [number, number], col: string) => {
        const ex = from[0] + (to[0] - from[0]) * p, ey = from[1] + (to[1] - from[1]) * p;
        ctx.strokeStyle = col; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(...from); ctx.lineTo(ex, ey); ctx.stroke();
        if (p >= 1) {
          // A small head at the target: direction is the whole content of an edge.
          const ang = Math.atan2(to[1] - from[1], to[0] - from[0]), hl = 5 / k;
          ctx.beginPath(); ctx.moveTo(ex, ey);
          ctx.lineTo(ex - hl * Math.cos(ang - 0.45), ey - hl * Math.sin(ang - 0.45));
          ctx.lineTo(ex - hl * Math.cos(ang + 0.45), ey - hl * Math.sin(ang + 0.45));
          ctx.closePath(); ctx.fill();
        }
      };
      if (showUses) for (const u of byName.get(name)!.uses) { const b = visible(u); if (b) grow(ac, [b.x + b.s / 2, b.y + b.s / 2], css("--accent-strong")); }
      if (showUsedBy) for (const u of usedBy.get(name) ?? []) { const b = visible(u); if (b) grow([b.x + b.s / 2, b.y + b.s / 2], ac, css("--kind-def")); }
      ctx.globalAlpha = 1;
    };
    let again = false;
    if (selected && cells.has(selected)) {
      const a = cells.get(selected)!;
      const t = anim.current && anim.current.name === selected && !reduced ? Math.min(1, (now - anim.current.start) / GROW_MS) : 1;
      edgesOf(selected, t, 1);
      ctx.strokeStyle = css("--text-primary"); ctx.lineWidth = 2 / k; ctx.strokeRect(a.x - 1, a.y - 1, a.s + 2, a.s + 2);
      // One ring, widening and fading: the eye finds the cell before the edges arrive.
      const pt = anim.current && anim.current.name === selected && !reduced ? (now - anim.current.start) / PULSE_MS : 1;
      if (pt < 1) {
        ctx.globalAlpha = 1 - pt; ctx.strokeStyle = css("--accent-strong"); ctx.lineWidth = 1.5 / k;
        const r = a.s * (0.8 + pt * 2.2);
        ctx.beginPath(); ctx.arc(a.x + a.s / 2, a.y + a.s / 2, r, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      }
      if (t < 1 || pt < 1) again = true;
    } else if (tour.current && !reduced && !hover) {
      const t = Math.min(1, (now - tour.current.start) / GROW_MS);
      edgesOf(tour.current.name, t, 0.45);
      const c = cells.get(tour.current.name);
      if (c) { ctx.globalAlpha = 0.6; ctx.strokeStyle = css("--text-secondary"); ctx.lineWidth = 1.5 / k; ctx.strokeRect(c.x - 1, c.y - 1, c.s + 2, c.s + 2); ctx.globalAlpha = 1; }
      if (t < 1) again = true;
    }
    if (again) { if (raf.current) cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(draw); }
    if (hover && cells.has(hover) && hover !== selected) {
      const h = cells.get(hover)!; ctx.strokeStyle = css("--accent-strong"); ctx.lineWidth = 1.5 / k; ctx.strokeRect(h.x - 0.5, h.y - 0.5, h.s + 1, h.s + 1);
    }
  };

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const resize = () => {
      const r = c.parentElement!.getBoundingClientRect();
      const h = Math.max(compact ? 220 : 420, Math.round(r.width * (H / W)));
      c.width = r.width * devicePixelRatio; c.height = h * devicePixelRatio;
      c.style.width = `${r.width}px`; c.style.height = `${h}px`;
      fit(); draw();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c.parentElement!);
    // Browser zoom changes the pixel ratio without always changing the box.
    let mq = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
    const onRatio = () => { mq.removeEventListener("change", onRatio); mq = matchMedia(`(resolution: ${devicePixelRatio}dppx)`); mq.addEventListener("change", onRatio); resize(); };
    mq.addEventListener("change", onRatio);
    return () => { ro.disconnect(); mq.removeEventListener("change", onRatio); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root]);
  useEffect(draw);
  // A new selection starts the growth and the pulse.
  useEffect(() => { if (selected) { anim.current = { start: performance.now(), name: selected }; tour.current = null; } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [selected]);
  // The idle tour: a random theorem with a few edges, every few seconds, while nothing is selected.
  useEffect(() => {
    // The front page's hero holds still: the tour belongs to the full map.
    if (reduced || compact) return;
    const candidates = lean.declarations.filter((d) => d.kind === "theorem" && d.uses.length >= 3);
    const tick = () => {
      if (selected || hover || drag.current || candidates.length === 0) return;
      tour.current = { start: performance.now(), name: candidates[Math.floor(Math.random() * candidates.length)].name };
      draw();
    };
    const id = window.setInterval(tick, TOUR_EVERY_MS);
    const first = window.setTimeout(tick, 900);
    return () => { window.clearInterval(id); window.clearTimeout(first); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lean, selected, hover, reduced]);
  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);
  // Filters change what is drawn, never the layout.
  useEffect(() => { draw(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [showUses, showUsedBy, hidden, doors]);
  const doorOf = useMemo(() => new Map(doors.filter((d) => d.decl).map((d) => [d.decl!, d])), [doors]);

  const toWorld = (e: { clientX: number; clientY: number }): [number, number] => {
    const r = canvasRef.current!.getBoundingClientRect(); const { tx, ty, k } = view.current;
    return [(e.clientX - r.left - tx) / k, (e.clientY - r.top - ty) / k];
  };
  const hit = ([x, y]: [number, number]) => {
    for (const [name, c] of cells) if (x >= c.x && x < c.x + c.s && y >= c.y && y < c.y + c.s) return name;
    return null;
  };
  /** The tile under a point that missed every cell: a module first, else its group. */
  const tileAt = ([x, y]: [number, number]) => {
    let group: string | null = null;
    for (const [name, r] of rects) {
      if (x < r.x0 || x >= r.x1 || y < r.y0 || y >= r.y1) continue;
      if (r.group) return name;
      group = name;
    }
    return group;
  };
  const trail = (() => {
    if (!focus) return [];
    const r = rects.get(focus);
    if (!r) return [];
    return r.group ? [r.group, focus] : [focus];
  })();
  const shortOf = (name: string) => (rects.get(name)?.group ? name.split(".").slice(2).join(".") || name : name);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);

  const search = (v: string) => {
    const q = v.trim(); if (!q) return;
    const exact = byName.has(q) ? q : lean.declarations.find((d) => d.name.toLowerCase().includes(q.toLowerCase()))?.name;
    if (exact) onSelect(exact);
  };

  const toggleKind = (k: keyof typeof kindColor) => setHidden((h) => { const n = new Set(h); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  // The legend is the kind filter: press a kind to fade it, press again to restore.
  const legend = (Object.keys(kindColor) as (keyof typeof kindColor)[]).map((k) => (
    <button
      key={k}
      type="button"
      aria-pressed={!hidden.has(k)}
      onClick={() => toggleKind(k)}
      className="text-xs bg-transparent border-0 p-0"
      style={{ color: "var(--text-secondary)", cursor: "pointer", opacity: hidden.has(k) ? 0.4 : 1, textDecoration: hidden.has(k) ? "line-through" : "none" }}
      title={hidden.has(k) ? `show ${k}` : `fade ${k}`}
    >
      <i aria-hidden style={{ display: "inline-block", width: 8, height: 8, marginRight: 5, verticalAlign: -1, background: kindColor[k], borderRadius: "50%" }} />
      {k}
    </button>
  ));
  /** Zoom about the canvas centre by a factor; 0 refits the whole or the focus. */
  const zoomBy = (f: number) => {
    const c = canvasRef.current; if (!c) return;
    if (f === 0) { fit(); draw(); return; }
    const cw = c.width / devicePixelRatio, ch = c.height / devicePixelRatio; const { tx, ty, k } = view.current;
    const nk = Math.max(0.2, Math.min(40, k * f));
    view.current = { k: nk, tx: cw / 2 - ((cw / 2 - tx) / k) * nk, ty: ch / 2 - ((ch / 2 - ty) / k) * nk }; draw();
  };
  const zoomButton = (label: string, f: number, title: string) => (
    <button type="button" onClick={() => zoomBy(f)} title={title} aria-label={title} className="text-xs px-2 py-1"
      style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", background: "var(--bg-secondary)", color: "var(--text-secondary)", minWidth: "1.9rem" }}>
      {label}
    </button>
  );
  const edgeToggle = (on: boolean, set: (v: boolean) => void, label: string, col: string) => (
    <label className="text-xs flex items-center gap-1" style={{ color: "var(--text-secondary)", cursor: "pointer" }}>
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} />
      <i aria-hidden style={{ display: "inline-block", width: 14, height: 2, background: col, verticalAlign: 2 }} />
      {label}
    </label>
  );

  return (
    <div className="instrument">
      {!compact && <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
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
        <nav aria-label="Focus" className="flex items-center gap-1 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
          {[null, ...trail].map((name, i) => (
            <span key={name ?? "all"} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden style={{ color: "var(--text-muted)" }}>›</span>}
              <button
                type="button"
                onClick={() => { onFocus(name); }}
                aria-current={name === focus ? "location" : undefined}
                className="px-2 py-1"
                style={{
                  border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer",
                  background: name === focus ? "var(--accent-soft)" : "var(--bg-secondary)", color: name === focus ? "var(--accent-strong)" : "var(--text-secondary)",
                }}
              >
                {name === null ? "All" : shortOf(name)}
              </button>
            </span>
          ))}
        </nav>
        <span role="group" aria-label="Zoom" className="flex gap-1">
          {zoomButton("−", 1 / 1.4, "zoom out")}{zoomButton("Fit", 0, "fit")}{zoomButton("+", 1.4, "zoom in")}
        </span>
        <span className="flex gap-3">{legend}</span>
        <span className="flex gap-3">
          {edgeToggle(showUses, setShowUses, "uses", "var(--accent-strong)")}
          {edgeToggle(showUsedBy, setShowUsedBy, "used by", "var(--kind-def)")}
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {hover ? `${hover} · ${byName.get(hover)?.kind}${doorOf.has(hover) ? ` · entry ${doorOf.get(hover)!.label}` : ""}` : "click a cell · click a tile to zoom in · drag to pan · wheel to zoom"}
        </span>
      </div>}
      {!compact && by === "tradition" && (
        <p className="text-xs m-0 mb-2" style={{ color: "var(--text-muted)" }}>
          Grouped by a mechanical reading of folder and name prefixes; Core, Principles, Category and Dynamics are the shared development, naming no tradition. The asserted link is the atlas tag on a declaration's page.
        </p>
      )}
      {!compact && doors.length > 0 && (
        <nav aria-label="Entries on the map" className="flex flex-wrap gap-x-3 gap-y-1 mb-2 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
          <span style={{ color: "var(--text-muted)" }}>doors</span>
          {doors.map((d) => (
            <button
              key={d.entry}
              type="button"
              disabled={!d.decl}
              aria-pressed={!!d.decl && d.decl === selected}
              onClick={() => d.decl && onSelect(d.decl)}
              title={d.decl ? `${d.decl} · select on the map` : "no Lean counterpart yet"}
              className="bg-transparent border-0 p-0"
              style={{ color: d.decl ? (d.decl === selected ? "var(--accent-strong)" : "var(--text-secondary)") : "var(--text-muted)", cursor: d.decl ? "pointer" : "default", opacity: d.decl ? 1 : 0.55 }}
            >
              <i aria-hidden style={{ display: "inline-block", width: 8, height: 8, marginRight: 4, verticalAlign: -1, border: `1.5px solid ${d.decl ? "var(--accent-strong)" : "var(--text-muted)"}`, borderRadius: "50%" }} />
              {d.label}
            </button>
          ))}
        </nav>
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
          onMouseUp={(e) => {
            const d = drag.current; drag.current = null;
            if (!d || d.moved) return;
            const p = toWorld(e);
            const cell = hit(p);
            if (cell) { onSelect(cell); return; }
            // A click on a tile, not a cell, focuses that tile; the same tile again clears.
            const tile = tileAt(p);
            if (tile) onFocus(tile === focus ? (rects.get(tile)?.group ?? null) : tile);
            else onSelect(null);
          }}
          onMouseLeave={() => { drag.current = null; setHover(null); }}

          onWheel={(e) => {
            if (compact) return;
            const [wx, wy] = toWorld(e); const r = canvasRef.current!.getBoundingClientRect();
            const k = Math.max(0.2, Math.min(40, view.current.k * Math.exp(-e.deltaY * 0.0015)));
            view.current = { k, tx: e.clientX - r.left - wx * k, ty: e.clientY - r.top - wy * k }; draw();
          }}
        />
      </div>
    </div>
  );
}
