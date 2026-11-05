/**
 * The foyer.
 *
 * The front page's job is to invite, and the invitation is the material: the
 * definitions in their authors' own words, then the one place two of them rule
 * opposite ways on a single object, then one line of trust. Everything that
 * used to stand here explaining the catalogue — the census, the gates, the open
 * decisions, the reading grammar — moved to About and to the reading key inside
 * an entry, where those questions actually arise.
 *
 * Nothing on this page is written by hand that the catalogue does not hold:
 * the shelf renders the entries, the disagreement renders the derived conflict,
 * and the trust line renders the transcription census.
 */
import { useEffect, useRef } from "react";
import { ConflictLine, DevStats, FloorLede, MapFoyer, Shelf } from "./components";
import { href } from "./route";
import { useStore } from "./store";
import type { Atlas } from "./types";

/**
 * The development on the front page: three counts and the map itself, small.
 * The map needs lean.json (ten times the catalogue), so it is fetched only
 * when this strip scrolls into view; until then the counts, which come from
 * the catalogue, stand alone. On the Stacks pattern: the hero is the graph.
 */
function DevelopmentStrip({ atlas }: { atlas: Atlas }) {
  const { lean, loadLean, setView, openAt, read, openDecl } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || lean) return;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { void loadLean(); io.disconnect(); } }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [lean, loadLean]);
  const theorems = lean ? lean.declarations.filter((d) => d.kind === "theorem").length : null;
  return (
    <div ref={ref} className="development-strip">
      <DevStats
        stats={[
          { value: atlas.entries.length, label: "definitions, verbatim", href: href({ view: "read", entry: atlas.entries[0]?.id }), open: () => setView("read") },
          { value: atlas.lean.declarations, label: "Lean declarations", href: href({ view: "library" }), open: () => setView("library") },
          { value: theorems ?? atlas.lean.tagged, label: theorems === null ? "entries formalised" : "machine-checked theorems", href: href({ view: "graph" }), open: () => setView("graph") },
        ]}
      />
      {lean && (
        <MapFoyer
          atlas={atlas}
          lean={lean}
          onRead={read}
          onDecl={openDecl}
          onMap={(name) => openAt({ view: "graph", decl: name })}
          onFocus={(name) => openAt({ view: "graph", by: "tradition", focus: name ?? undefined })}
          onMappings={() => setView("mappings")}
          onLibrary={() => setView("library")}
        />
      )}
    </div>
  );
}

export function FrontMatter({ atlas }: { atlas: Atlas }) {
  const read = useStore((s) => s.read);
  const setView = useStore((s) => s.setView);
  const entries = atlas.entries;
  const verified = Object.values(atlas.transcription).filter((t) => t.status === "located").length;
  const allLocated = verified === entries.length;
  const caseCount = Object.keys(atlas.cases).length;

  const openGraph = (ev: React.MouseEvent) => {
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    ev.preventDefault();
    setView("graph");
  };
  const openCases = (ev: React.MouseEvent) => {
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    ev.preventDefault();
    setView("ledger");
  };

  return (
    <>
      <p className="thesis">
        Formal definitions of “system,” and the maps between them.
      </p>

      <DevelopmentStrip atlas={atlas} />

      <FloorLede href={href({ view: "floor" })} onOpen={() => setView("floor")} />

      <Shelf
        authors={atlas.authors}
        entries={entries}
        floor={atlas.floor}
        transcription={atlas.transcription}
        hrefOf={(e) => href({ view: "read", entry: e.id })}
        onOpen={read}
      />

      {atlas.conflicts.map((c) => (
        <ConflictLine
          key={c.object}
          conflict={c}
          entries={entries}
          seeCases={
            <a className="disclosure" href={href({ view: "ledger" })} onClick={openCases}>
              See the case in the ledger →
            </a>
          }
        />
      ))}

      <p className="trust-line">
        <span aria-hidden className={allLocated ? "trust-glyph-ok" : "trust-glyph-partial"}>
          {allLocated ? "✓" : "◐"}
        </span>{" "}
        {allLocated
          ? "Every passage located in its primary text at build time."
          : `${verified} of ${entries.length} passages located in their primary text at build time.`}{" "}
        Floor shape machine-checked (Lean).{" "}
        <span className="trust-counts">
          {atlas.authors.length} authors · {entries.length} entries · {caseCount} cases ·{" "}
          {atlas.lean.declarations.toLocaleString()} Lean declarations · {atlas.lean.tagged} formalised entries ·
        </span>{" "}
        <a className="disclosure" href={href({ view: "graph" })} onClick={openGraph}>
          the development →
        </a>{" "}
        <button
          onClick={() => setView("about")}
          className="disclosure cursor-pointer bg-transparent border-0 p-0 text-sm"
        >
          about this catalogue →
        </button>
      </p>
    </>
  );
}
