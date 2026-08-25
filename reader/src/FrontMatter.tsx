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
import { ConflictLine, FloorLede, Shelf } from "./components";
import { href } from "./route";
import { useStore } from "./store";
import type { Atlas } from "./types";

export function FrontMatter({ atlas }: { atlas: Atlas }) {
  const read = useStore((s) => s.read);
  const setView = useStore((s) => s.setView);
  const entries = atlas.entries;
  const verified = Object.values(atlas.transcription).filter((t) => t.status === "located").length;
  const allLocated = verified === entries.length;
  const caseCount = Object.keys(atlas.cases).length;

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

      <FloorLede />

      <Shelf
        authors={atlas.authors}
        entries={entries}
        floor={atlas.floor}
        primitives={atlas.primitives}
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
          {atlas.authors.length} authors · {entries.length} entries · {caseCount} cases ·
        </span>{" "}
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
