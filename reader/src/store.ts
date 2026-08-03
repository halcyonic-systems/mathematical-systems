import { create } from "zustand";
import { BASE, go, parse, type Route } from "./route";
import type { Atlas, Reasoning } from "./types";

export type View = "read" | "compare" | "census" | "ledger" | "commitments";

type State = {
  atlas: Atlas | null;
  reasoning: Reasoning | null;
  error: string | null;
  view: View;
  /** The entry open in Read. Distinct from `compared` — opening one to read
      must not collapse the comparison you had set up. */
  reading: string | null;
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
    const reading = (r.entry && byId(r.entry)) || entries[0]?.iri || null;
    const compared = r.entries?.map(byId).filter((x): x is string => !!x);
    return {
      view: r.view,
      reading,
      ...(compared?.length ? { compared } : {}),
      ...(r.closure ? { variant: r.closure } : {}),
    };
  };

  return {
    atlas: null,
    reasoning: null,
    error: null,
    view: "read",
    reading: null,
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
      set({ reading: iri, view: "read" });
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
