import { create } from "zustand";
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
  /** Which import closure the commitments panel is reporting on. */
  variant: "shipped" | "full";
  load: () => Promise<void>;
  setView: (v: View) => void;
  read: (iri: string) => void;
  syncFromPath: () => void;
  _fromPath: (entries: { iri: string; id: string }[]) => string | null;
  toggle: (iri: string) => void;
  setVariant: (v: "shipped" | "full") => void;
};

export const useStore = create<State>((set, get) => ({
  atlas: null,
  reasoning: null,
  error: null,
  view: "read",
  reading: null,
  compared: [],
  variant: "shipped",

  /** `/entry/klir-2001-eq-1-1` -> that entry's IRI, if it exists. */
  _fromPath: (entries: { iri: string; id: string }[]) => {
    const m = /^\/entry\/(.+?)\/?$/.exec(window.location.pathname);
    return m ? (entries.find((e) => e.id === decodeURIComponent(m[1]))?.iri ?? null) : null;
  },

  load: async () => {
    try {
      const [a, r] = await Promise.all([
        // Absolute, not relative: from /entry/<id> a relative path resolves to
        // /entry/data/... which the SPA fallback answers with index.html, and
        // the JSON parse then fails on a doctype.
        fetch("/data/atlas.json").then((x) => x.json()),
        fetch("/data/reasoning.json").then((x) => x.json()),
      ]);
      const iris = a.entries.map((e: { iri: string }) => e.iri);
      const deep = get()._fromPath(a.entries);
      set({ atlas: a, reasoning: r, reading: deep ?? iris[0] ?? null, compared: iris });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  setView: (view) => set({ view }),
  read: (iri) => {
    // Entries get their own URL so a citation can point at one. This is what an
    // IRI resolves THROUGH: w3id → math.systems/entry/<id> → this entry.
    const id = iri.split("/").pop() ?? "";
    window.history.pushState({}, "", `/entry/${encodeURIComponent(id)}`);
    set({ reading: iri, view: "read" });
  },
  syncFromPath: () => {
    const a = get().atlas;
    if (a) set({ reading: get()._fromPath(a.entries) ?? a.entries[0]?.iri ?? null, view: "read" });
  },
  toggle: (iri) => {
    const cur = get().compared;
    set({ compared: cur.includes(iri) ? cur.filter((x) => x !== iri) : [...cur, iri] });
  },
  setVariant: (variant) => set({ variant }),
}));
