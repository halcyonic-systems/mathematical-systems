import { create } from "zustand";
import { BASE, go, parse, type Route } from "./route";
import type { Atlas, Reasoning } from "./types";

export type View = "overview" | "read" | "compare" | "census" | "ledger" | "commitments" | "about";

type State = {
  atlas: Atlas | null;
  reasoning: Reasoning | null;
  error: string | null;
  view: View;
  /** The entry open in Read. Distinct from `compared` — opening one to read
      must not collapse the comparison you had set up. */
  reading: string | null;
  /** An entry id the address bar asked for that the catalogue does not hold.
      Kept so the page can say so: silently rendering the first entry under the
      requested URL would tell the reader they are reading what they asked for. */
  missing: string | null;
  /** The entries shown side by side in Compare. */
  compared: string[];
  /** Which import closure the entailments view is reporting on. */
  variant: "shipped" | "full";
  load: () => Promise<void>;
  setView: (v: View) => void;
  read: (iri: string) => void;
  toggle: (iri: string) => void;
  setVariant: (v: "shipped" | "full") => void;
  /** Re-derive state from the address bar, for back/forward. */
  syncFromPath: () => void;
};

const idOf = (iri: string) => iri.split("/").pop() ?? "";

export const useStore = create<State>((set, get) => {
  /** The URL that describes the current state. */
  const route = (over: Partial<Route> = {}): Route => {
    const s = get();
    return {
      view: s.view,
      entry: s.reading ? idOf(s.reading) : undefined,
      entries: s.compared.map(idOf),
      closure: s.variant,
      ...over,
    };
  };

  /** Apply a parsed route to state, resolving ids against the loaded catalogue. */
  const apply = (r: Route, atlas: Atlas | null) => {
    const entries = atlas?.entries ?? [];
    const byId = (id: string) => entries.find((e) => e.id === id)?.iri;
    // An id that resolves opens that entry; no id at all opens the first. An id
    // that does NOT resolve opens nothing — it is recorded as missing, and the
    // read view says so rather than serving a different entry under this URL.
    const hit = r.entry ? byId(r.entry) : undefined;
    const reading = hit ?? (r.entry ? null : entries[0]?.iri ?? null);
    const compared = r.entries?.map(byId).filter((x): x is string => !!x);
    return {
      view: r.view,
      reading,
      missing: r.entry && !hit ? r.entry : null,
      ...(compared?.length ? { compared } : {}),
      ...(r.closure ? { variant: r.closure } : {}),
    };
  };

  return {
    atlas: null,
    reasoning: null,
    error: null,
    view: "overview",
    reading: null,
    missing: null,
    compared: [],
    variant: "shipped",

    load: async () => {
      try {
        const [a, r] = await Promise.all([
          // Absolute, not relative: from /entry/<id> a relative path resolves to
          // /entry/data/... which the SPA fallback answers with index.html, and
          // the JSON parse then fails on a doctype.
          fetch(`${BASE}data/atlas.json`).then((x) => x.json()),
          fetch(`${BASE}data/reasoning.json`).then((x) => x.json()),
        ]);
        const parsed = parse();
        set({
          atlas: a,
          reasoning: r,
          compared: a.entries.map((e: { iri: string }) => e.iri),
          ...apply(parsed, a),
        });
      } catch (e) {
        set({ error: e instanceof Error ? e.message : String(e) });
      }
    },

    setView: (view) => {
      set({ view });
      go(route({ view }));
    },

    read: (iri) => {
      set({ reading: iri, missing: null, view: "read" });
      go(route({ view: "read", entry: idOf(iri) }));
    },

    toggle: (iri) => {
      const cur = get().compared;
      const compared = cur.includes(iri) ? cur.filter((x) => x !== iri) : [...cur, iri];
      set({ compared });
      go(route({ entries: compared.map(idOf) }), "replace");
    },

    setVariant: (variant) => {
      set({ variant });
      go(route({ closure: variant }));
    },

    syncFromPath: () => set(apply(parse(), get().atlas)),
  };
});
