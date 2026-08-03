/**
 * Two ambient concerns the primitives share.
 *
 * DENSITY. Entries are documents and comparisons are instruments, but they use
 * the same eight primitives. Rather than a `dense` prop on every component (and
 * sixteen variants to keep in step), density is set once by whoever wraps a view
 * and read wherever it matters.
 *
 * THE OPEN COLLECTOR. Gaps render terse where they occur — a section showing
 * "none" should not look broken — and register themselves into a single
 * per-entry block where they are stated fully. Footnote marker and footnote
 * text. Collecting them means a reader sees the shape of what is unfinished in
 * one place instead of inferring it from scattered dashes.
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

export type Density = "generous" | "dense";

const DensityContext = createContext<Density>("generous");
export const useDensity = () => useContext(DensityContext);

export function Register({ density, children }: { density: Density; children: ReactNode }) {
  return (
    <DensityContext.Provider value={density}>
      <div data-density={density}>{children}</div>
    </DensityContext.Provider>
  );
}

/** A recorded gap. `derived` ones are computed from absence; `authored` ones were written. */
export type OpenItem = {
  id: string;
  /** What is missing, in one line. */
  what: string;
  /** What would close it. Omitted when that is genuinely not yet known. */
  closes?: string;
  origin: "derived" | "authored";
};

type Collector = {
  items: OpenItem[];
  register: (item: OpenItem) => void;
  reset: () => void;
};

const OpenContext = createContext<Collector | null>(null);

export function OpenQuestions({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<OpenItem[]>([]);
  // Registration happens during render of the children, so the same id must be
  // idempotent — a re-render would otherwise pile duplicates into the block.
  const seen = useRef(new Set<string>());

  const register = useCallback((item: OpenItem) => {
    if (seen.current.has(item.id)) return;
    seen.current.add(item.id);
    setItems((prev) => [...prev, item]);
  }, []);

  const reset = useCallback(() => {
    seen.current.clear();
    setItems([]);
  }, []);

  const value = useMemo(() => ({ items, register, reset }), [items, register, reset]);
  return <OpenContext.Provider value={value}>{children}</OpenContext.Provider>;
}

/** Null outside a collector, so a primitive can be used anywhere without exploding. */
export const useOpenCollector = () => useContext(OpenContext);
