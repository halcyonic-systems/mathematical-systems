/**
 * The front door: the map with a panel beside it.
 *
 * A visitor arrives at the map, not at a list. Every atlas entry is a ring on
 * the map (a door, see Treemap.doorsOf); a click on a ring opens that entry
 * in the panel, with its passage, its Lean counterpart and its mappings, and
 * the ways onward. A click on any other cell shows that declaration. The
 * panel is the one place on the front page where the two repositories meet:
 * the atlas's verbatim on the left of the rule, the development's declaration
 * on the right.
 */
import { useMemo, useState } from "react";
import { href } from "../route";
import type { Atlas, LeanDecl, LeanDump } from "../types";
import { TranscriptBadge } from "./Badge";
import { Passage } from "./Passage";
import { Treemap, doorsOf, type Door } from "./Treemap";

const mono = { fontFamily: "var(--font-mono)" } as const;
const heading = { fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 500, lineHeight: 1.25, color: "var(--text-primary)" } as const;

/** A link that is a real anchor and an SPA transition both. */
function Go({ to, onGo, children }: { to: string; onGo: () => void; children: React.ReactNode }) {
  return (
    <a
      className="disclosure"
      href={to}
      onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; e.preventDefault(); onGo(); }}
    >
      {children}
    </a>
  );
}

/** One atlas entry, as the panel shows it: passage, counterpart, mappings, ways onward. */
export function EntryPanel({
  atlas,
  door,
  lean,
  onRead,
  onDecl,
  onMap,
  onMappings,
  before = false,
}: {
  atlas: Atlas;
  door: Door;
  lean: LeanDump | null;
  /** Set when a declaration card follows: a rule separates the two. */
  before?: boolean;
  onRead: (iri: string) => void;
  onDecl: (name: string) => void;
  onMap: (name: string) => void;
  onMappings: () => void;
}) {
  const entry = atlas.entries.find((e) => e.id === door.entry);
  if (!entry) return null;
  const t = atlas.transcription[entry.iri];
  const shape = atlas.shapes[entry.iri];
  const decl = door.decl && lean ? lean.declarations.find((d) => d.name === door.decl) : undefined;
  const author = atlas.authors.find((a) => a.entries.includes(entry.iri));
  const claims = atlas.mappings.claims.filter((c) => c.source === entry.iri || c.target === entry.iri);
  return (
    <div className={before ? "mb-5 pb-5" : undefined} style={before ? { borderBottom: "1px solid var(--hairline)" } : undefined}>
      <p className="eyebrow m-0 mb-1">Entry {entry.number}{author?.label ? ` · ${author.label}` : ""}</p>
      <h3 className="m-0 mb-3" style={heading}>{entry.label}</h3>
      <Passage
        text={entry.displayForm ?? entry.verbatim}
        location={entry.sourceLocation}
        caption={<TranscriptBadge status={t?.status ?? "no-verbatim"} source={t?.source} />}
      />
      <h4 className="eyebrow mt-4 mb-1 pb-1" style={{ borderBottom: "1px solid var(--hairline)" }}>As formalised</h4>
      {door.decl ? (
        <p className="m-0 text-xs" style={mono}>
          <Go to={href({ view: "lean", decl: door.decl })} onGo={() => onDecl(door.decl!)}>{door.decl}</Go>
          {decl && <span style={{ color: "var(--text-muted)" }}> · {decl.kind} · {decl.module.split(".").slice(1).join("/")}.lean:{decl.line}</span>}
          {shape && shape.status === "resolved" && shape.title && <><br /><span style={{ color: "var(--text-secondary)" }}>{shape.title.replace(/^#+\s*/, "")}</span></>}
        </p>
      ) : (
        <p className="w-open m-0 text-xs">No Lean counterpart yet. The entry is read and compared in prose only.</p>
      )}
      <h4 className="eyebrow mt-4 mb-1 pb-1" style={{ borderBottom: "1px solid var(--hairline)" }}>Mappings</h4>
      {claims.length ? (
        <ul className="list-none m-0 p-0 text-xs">
          {claims.map((c) => {
            const other = c.source === entry.iri ? c.target : c.source;
            const otherEntry = atlas.entries.find((e) => e.iri === other);
            const dir = c.source === entry.iri ? "→" : "←";
            return (
              <li key={c.iri} className="py-0.5">
                <span style={{ color: "var(--text-muted)" }}>{dir}</span> {c.relationLabel ?? c.relation}{" "}
                <span style={{ color: "var(--text-secondary)" }}>{otherEntry ? `${otherEntry.number} ${(otherEntry.label ?? "").split(",")[0]}` : other}</span>
                {c.theorem ? <span style={{ color: "var(--text-muted)" }}> · machine-checked</span> : <span style={{ color: "var(--text-muted)" }}> · argued in prose</span>}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="w-open m-0 text-xs">No mapping claim names this entry yet.</p>
      )}
      <p className="m-0 mt-4 text-sm flex flex-wrap gap-x-4 gap-y-1">
        <Go to={href({ view: "read", entry: entry.id })} onGo={() => onRead(entry.iri)}>Read the entry →</Go>
        {door.decl && <Go to={href({ view: "graph", decl: door.decl })} onGo={() => onMap(door.decl!)}>On the full map →</Go>}
        {claims.length > 0 && <Go to={href({ view: "mappings" })} onGo={onMappings}>All mappings →</Go>}
      </p>
    </div>
  );
}

/** A declaration that is not a door: what it is and where it lives, and the ways onward. */
function DeclPanel({ decl, onDecl, onMap }: { decl: LeanDecl; onDecl: (name: string) => void; onMap: (name: string) => void }) {
  const firstPara = (decl.doc ?? "").split(/\n\s*\n/)[0]?.trim();
  return (
    <div>
      <p className="eyebrow m-0 mb-1">{decl.kind} · {decl.module.split(".").slice(1).join("/")}.lean:{decl.line}</p>
      <h3 className="m-0 mb-3" style={{ ...heading, ...mono, fontSize: "0.95rem", wordBreak: "break-all" }}>{decl.name}</h3>
      {decl.signature && (
        <pre className="m-0 text-xs p-2" style={{ ...mono, whiteSpace: "pre-wrap", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)" }}>{decl.signature}</pre>
      )}
      {firstPara && <p className="mt-3 mb-0 text-sm" style={{ color: "var(--text-secondary)" }}>{firstPara}</p>}
      <p className="m-0 mt-4 text-sm flex flex-wrap gap-x-4 gap-y-1">
        <Go to={href({ view: "lean", decl: decl.name })} onGo={() => onDecl(decl.name)}>Its page: source, uses, used by →</Go>
        <Go to={href({ view: "graph", decl: decl.name })} onGo={() => onMap(decl.name)}>On the full map →</Go>
      </p>
    </div>
  );
}

/**
 * The map with its panel. The map keeps its own selection here, so the front
 * page's address does not change with every click; the panel's links are the
 * addresses.
 */
export function MapFoyer({
  atlas,
  lean,
  onRead,
  onDecl,
  onMap,
  onFocus,
  onMappings,
  onLibrary,
}: {
  atlas: Atlas;
  lean: LeanDump;
  onRead: (iri: string) => void;
  onDecl: (name: string) => void;
  onMap: (name: string) => void;
  /** Open the full map, zoomed to a tile, or whole for null. */
  onFocus: (name: string | null) => void;
  onMappings: () => void;
  onLibrary: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const doors = useMemo(() => doorsOf(atlas), [atlas]);
  const doorOf = useMemo(() => new Map(doors.filter((d) => d.decl).map((d) => [d.decl!, d])), [doors]);
  const decl = selected ? lean.declarations.find((d) => d.name === selected) : undefined;
  const door = selected ? doorOf.get(selected) : undefined;
  const formalised = doors.filter((d) => d.decl).length;
  return (
    <div className="map-foyer">
      <div className="map-foyer-map">
        <Treemap
          lean={lean}
          by="tradition"
          selected={selected}
          onSelect={setSelected}
          onBy={() => undefined}
          focus={null}
          onFocus={onFocus}
          doors={doors}
          compact
          legend
          aspect={0.56}
        />
      </div>
      <aside className="map-foyer-panel" aria-live="polite">
        {door ? (
          <EntryPanel atlas={atlas} door={door} lean={lean} onRead={onRead} onDecl={onDecl} onMap={onMap} onMappings={onMappings} />
        ) : decl ? (
          <DeclPanel decl={decl} onDecl={onDecl} onMap={onMap} />
        ) : (
          <div>
            <p className="eyebrow m-0 mb-1">The development</p>
            <h3 className="m-0 mb-3" style={heading}>{atlas.entries.length} definitions of “system”, one Lean development</h3>
            <p className="m-0 text-sm" style={{ color: "var(--text-secondary)" }}>
              Every cell is a declaration, {lean.declarations.length.toLocaleString()} of them in {lean.modules.length} files, grouped by the tradition its folder and name place it in.
              A ring marks an entry's own definition, as the author wrote it and as it is formalised: {formalised} of the {doors.length} entries have one.
            </p>
            <p className="m-0 mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              Click a ring to read that definition here. Click any cell for its declaration. Click a tile to open it on the full map.
            </p>
            <p className="m-0 mt-4 text-sm flex flex-wrap gap-x-4 gap-y-1">
              <Go to={href({ view: "graph" })} onGo={() => onFocus(null)}>The full map →</Go>
              <Go to={href({ view: "library" })} onGo={onLibrary}>Every declaration →</Go>
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
