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

  load: async () => {
    try {
      const [a, r] = await Promise.all([
        fetch("data/atlas.json").then((x) => x.json()),
        fetch("data/reasoning.json").then((x) => x.json()),
      ]);
      const iris = a.entries.map((e: { iri: string }) => e.iri);
      set({ atlas: a, reasoning: r, reading: iris[0] ?? null, compared: iris });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  setView: (view) => set({ view }),
  read: (iri) => set({ reading: iri, view: "read" }),
  toggle: (iri) => {
    const cur = get().compared;
    set({ compared: cur.includes(iri) ? cur.filter((x) => x !== iri) : [...cur, iri] });
  },
  setVariant: (variant) => set({ variant }),
}));
