import { useEffect } from "react";
import { EntryRail, Masthead, OpenQuestions, Register, Tabs } from "./components";
import { href } from "./route";
import { useStore, type View } from "./store";
import { FrontMatter } from "./FrontMatter";
import { AboutView } from "./About";
import { CensusView, CommitmentsView, CompareView, LedgerView, ReadView } from "./views";

/**
 * Labels name what a view holds, not what you do to it. "Read" and "Census"
 * assume you already know what is being read and what is being counted; a
 * stranger arriving from a citation does not. Each view also carries one line
 * of orientation, because a tab bar is the only place a cold reader can learn
 * what this catalogue contains.
 */
const TABS: { id: View; label: string; about: string }[] = [
  {
    id: "overview",
    label: "Overview",
    // Empty on purpose: the masthead one inch above already says what the
    // catalogue is, and the strip repeating it was the first thing a reader
    // had to scroll past. Other views keep their line — there, it is the only
    // orientation a cold reader gets.
    about: "",
  },
  {
    id: "read",
    label: "Definitions",
    about: "One definition of “system” in full — the passage as its author wrote it, what it posits, and how it has been formalised.",
  },
  {
    id: "compare",
    label: "Compare",
    about: "Definitions side by side, aligned row by row, with the vocabulary they share and the vocabulary unique to each.",
  },
  {
    id: "census",
    label: "Primitives",
    about: "Which terms each definition takes as primitive. A lexical count: two authors using the word “thing” are not thereby claimed to mean the same by it.",
  },
  {
    id: "ledger",
    label: "Cases",
    about: "What each author says is a system and what they say is not — their own examples, in their own words. Where two definitions rule differently on one case, that is a finding.",
  },
  {
    id: "commitments",
    label: "Entailments",
    about: "What the entries are logically committed to by the ontology they are aligned with — and how that changes when the imported axiom set widens.",
  },
];

/** About the catalogue rather than of it: the methods, set apart on the right. */
const META_TABS: { id: View; label: string; about: string }[] = [
  {
    id: "about",
    label: "About",
    about: "The methods: what the catalogue has reached, what its build refuses, what is unsettled, and where this build came from.",
  },
];

/**
 * Entries are documents; comparisons are instruments. Same eight primitives,
 * different density, set once here rather than threaded through every part.
 */
const DENSITY = { overview: "generous", read: "generous", compare: "dense", census: "dense", ledger: "dense", commitments: "generous", about: "generous" } as const;

export default function App() {
  const { atlas, reasoning, error, view, setView, load, syncFromPath, reading, read } = useStore();

  useEffect(() => {
    void load();
    // Back/forward should move between entries, not out of the app.
    const onPop = () => syncFromPath();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [load, syncFromPath]);

  // A cold load with a fragment lands before the sections exist, so the browser
  // finds nothing to scroll to. Once the catalogue is in, honour it — this is
  // what makes /entry/<id>#apparatus a citable address rather than a near miss.
  useEffect(() => {
    if (!atlas) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
  }, [atlas, view, reading]);

  // Switching view carried the previous view's scroll position with it, so
  // arriving at Primitives from halfway down a three-thousand-pixel entry
  // started you halfway down a table. A fragment is an explicit request to land
  // somewhere else, so it wins.
  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0 });
  }, [view]);

  // Every view titles its own tab. One <title> across seven routes made
  // history unreadable and every shared link preview identical — on an
  // artefact whose URLs exist to be sent to someone. An open entry names
  // itself; a missing one says so.
  useEffect(() => {
    const base = "Atlas — Mathematical Systems";
    const label = [...TABS, ...META_TABS].find((t) => t.id === view)?.label;
    const entry = view === "read" ? atlas?.entries.find((e) => e.iri === reading)?.label : null;
    document.title =
      view === "overview" ? base
      : view === "read" ? `${entry ?? "No such entry"} · ${base}`
      : `${label} · ${base}`;
  }, [view, reading, atlas]);

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
      <a href="#catalogue" className="skip-link">
        Skip to the catalogue
      </a>
      <Masthead
        eyebrow="Mathematical Systems"
        title="Atlas"
        subtitle="Formal definitions of “system,” and the maps between them"
        count={`${atlas.entries.length} entries`}
      />
      {/* The Definitions link must name an entry: href({view:"read"}) with no
          entry falls back to the root, so a middle-click on Definitions would
          have opened the Overview. It carries the entry being read, or the
          first entry for a reader who has not opened one yet. */}
      <Tabs
        tabs={TABS}
        meta={META_TABS}
        active={view}
        hrefOf={(v) =>
          href({ view: v, entry: v === "read" ? (reading ?? atlas.entries[0]?.iri ?? "").split("/").pop() : undefined })
        }
        onSelect={setView}
      />
      {(() => {
        const about = [...TABS, ...META_TABS].find((t) => t.id === view)?.about;
        return about ? <p className="view-about">{about}</p> : null;
      })()}

      <div className="flex">
        {view === "read" && (
          <EntryRail
            entries={atlas.entries}
            active={reading}
            onSelect={read}
          />
        )}
        <main
          id="catalogue"
          tabIndex={-1}
          className={`flex-1 px-8 py-6 min-w-0 ${view === "read" || view === "overview" || view === "about" ? "measure" : "measure-wide"}`}
        >
          {/* The collector is keyed per entry so opening another one starts a fresh
              set of open questions rather than accumulating the previous entry's. */}
          <Register density={DENSITY[view]}>
            <OpenQuestions key={`${view}:${reading}`}>
              {view === "overview" && <FrontMatter atlas={atlas} />}
              {view === "about" && <AboutView atlas={atlas} reasoning={reasoning} />}
              {view === "read" && <ReadView atlas={atlas} />}
              {view === "compare" && <CompareView atlas={atlas} />}
              {view === "census" && <CensusView atlas={atlas} />}
              {view === "ledger" && <LedgerView atlas={atlas} />}
              {view === "commitments" && <CommitmentsView reasoning={reasoning} />}
            </OpenQuestions>
          </Register>
        </main>
      </div>

      {/* The rule spans the page; the text sits in the same column as the
          content above it. The footer used to wear `w-open` directly, whose
          44rem cap left it flushed to the left edge with its rule stopping
          mid-column — the page appeared to end in the wrong place, twice. */}
      <footer className="rule-top">
        <p className="footer-line w-open m-0 px-8 py-4">
          Reads <code>{atlas.source.repo}</code>
          {atlas.provenance.atlasCommit && <> at <code>{atlas.provenance.atlasCommit}</code></>}. Reasoning
          precomputed at build time; this page runs no reasoner.{" "}
          <button
            onClick={() => setView("about")}
            className="disclosure cursor-pointer bg-transparent border-0 p-0"
          >
            About this catalogue →
          </button>
        </p>
      </footer>
    </div>
  );
}
