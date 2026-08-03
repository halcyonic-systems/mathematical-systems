import { useEffect } from "react";
import { Masthead } from "./chrome";
import { useStore, type View } from "./store";
import { CensusView, CommitmentsView, CompareView, EntryRail, LedgerView, ReadView } from "./views";

const TABS: { id: View; label: string }[] = [
  { id: "read", label: "Read" },
  { id: "compare", label: "Compare" },
  { id: "census", label: "Census" },
  { id: "ledger", label: "Admits / Refuses" },
  { id: "commitments", label: "Commitments" },
];

export default function App() {
  const { atlas, reasoning, error, view, setView, load } = useStore();

  useEffect(() => {
    void load();
  }, [load]);

  if (error)
    return (
      <main className="p-10">
        <p style={{ color: "var(--proof-refuted)" }}>
          Could not load the catalogue: {error}. Run <code>npm run data</code> first.
        </p>
      </main>
    );
  if (!atlas || !reasoning) return <main className="p-10" style={{ color: "var(--text-muted)" }}>Loading…</main>;

  return (
    <div className="min-h-screen">
      <Masthead
        eyebrow="Mathematical Systems"
        title="Atlas"
        subtitle="Formal definitions of “system,” and the maps between them"
        count={`${atlas.entries.length} entries`}
      />

      <nav
        style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}
        className="px-8 flex gap-1"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className="px-4 py-3 text-sm cursor-pointer"
            style={{
              color: view === t.id ? "var(--text-primary)" : "var(--text-muted)",
              borderBottom: view === t.id ? "2px solid var(--accent)" : "2px solid transparent",
              fontWeight: view === t.id ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="flex">
        {view === "read" && <EntryRail entries={atlas.entries} />}
        <main className="flex-1 px-8 py-6" style={{ maxWidth: view === "compare" ? "none" : "68rem" }}>
          {view === "read" && <ReadView atlas={atlas} />}
          {view === "compare" && <CompareView atlas={atlas} />}
          {view === "census" && <CensusView atlas={atlas} />}
          {view === "ledger" && <LedgerView atlas={atlas} />}
          {view === "commitments" && <CommitmentsView reasoning={reasoning} />}
        </main>
      </div>

      <footer className="px-8 py-4 text-xs" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}>
        Reads <code>{atlas.source.repo}</code>. Reasoning precomputed at build time; this page runs no reasoner.
      </footer>
    </div>
  );
}
