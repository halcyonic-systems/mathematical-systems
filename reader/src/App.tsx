import { useEffect } from "react";
import { EntryRail, Masthead, OpenQuestions, Register, Tabs } from "./components";
import { useStore, type View } from "./store";
import { CensusView, CommitmentsView, CompareView, LedgerView, ReadView } from "./views";

const TABS: { id: View; label: string }[] = [
  { id: "read", label: "Read" },
  { id: "compare", label: "Compare" },
  { id: "census", label: "Census" },
  { id: "ledger", label: "Admits / Refuses" },
  { id: "commitments", label: "Commitments" },
];

/**
 * Entries are documents; comparisons are instruments. Same eight primitives,
 * different density, set once here rather than threaded through every part.
 */
const DENSITY = { read: "generous", compare: "dense", census: "dense", ledger: "dense", commitments: "generous" } as const;

export default function App() {
  const { atlas, reasoning, error, view, setView, load, syncFromPath, reading, read } = useStore();

  useEffect(() => {
    void load();
    // Back/forward should move between entries, not out of the app.
    const onPop = () => syncFromPath();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [load, syncFromPath]);

  if (error)
    return (
      <main className="p-10">
        <p className="w-derived">
          Could not load the catalogue: {error}. Run <code>npm run data</code> first.
        </p>
      </main>
    );
  if (!atlas || !reasoning)
    return (
      <main className="p-10">
        <p className="w-open">Loading…</p>
      </main>
    );

  return (
    <div className="min-h-screen">
      <Masthead
        eyebrow="Mathematical Systems"
        title="Atlas"
        subtitle="Formal definitions of “system,” and the maps between them"
        count={`${atlas.entries.length} entries`}
      />
      <Tabs tabs={TABS} active={view} onSelect={setView} />

      <div className="flex">
        {view === "read" && (
          <EntryRail
            entries={atlas.entries}
            active={reading}
            onSelect={read}
          />
        )}
        <main className={`flex-1 px-8 py-6 min-w-0 ${view === "read" ? "measure" : "measure-wide"}`}>
          {/* The collector is keyed per entry so opening another one starts a fresh
              set of open questions rather than accumulating the previous entry's. */}
          <Register density={DENSITY[view]}>
            <OpenQuestions key={`${view}:${reading}`}>
              {view === "read" && <ReadView atlas={atlas} />}
              {view === "compare" && <CompareView atlas={atlas} />}
              {view === "census" && <CensusView atlas={atlas} />}
              {view === "ledger" && <LedgerView atlas={atlas} />}
              {view === "commitments" && <CommitmentsView reasoning={reasoning} />}
            </OpenQuestions>
          </Register>
        </main>
      </div>

      <footer className="px-8 py-4 w-open not-italic rule-top">
        Reads <code>{atlas.source.repo}</code>. Reasoning precomputed at build time; this page runs no reasoner.
      </footer>
    </div>
  );
}
