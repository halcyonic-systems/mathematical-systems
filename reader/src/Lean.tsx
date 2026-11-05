/**
 * The development views: the map (/graph) and one declaration (/lean/<name>).
 * Both read lean.json, loaded on first need. Views compose primitives and
 * carry no layout of their own (scripts/check-tokens.mjs).
 */
import { useEffect, useMemo } from "react";
import { Absence, DeclCard, Section, Treemap } from "./components";
import { href } from "./route";
import { useStore } from "./store";
import type { Atlas } from "./types";

function useUsedBy() {
  const lean = useStore((s) => s.lean);
  return useMemo(() => {
    const m = new Map<string, string[]>();
    for (const d of lean?.declarations ?? []) for (const u of d.uses) m.set(u, [...(m.get(u) ?? []), d.name]);
    return m;
  }, [lean]);
}

function Loading() {
  const { lean, leanError, loadLean } = useStore();
  useEffect(() => { void loadLean(); }, [loadLean]);
  if (leanError) return <p className="w-derived">Could not load the development: {leanError}. Run <code>npm run data</code> first.</p>;
  if (!lean) return <p className="w-open">Loading the development…</p>;
  return null;
}

export function GraphView({ atlas }: { atlas: Atlas }) {
  const { lean, decl, by, focus, selectDecl, setBy, setFocus, openDecl, openAt } = useStore();
  const usedBy = useUsedBy();
  const loading = <Loading />;
  if (!lean) return loading;
  const selected = decl && lean.declarations.find((d) => d.name === decl);
  const tagged = lean.declarations.filter((d) => d.atlas.length).length;
  return (
    <>
      <Section
        title="The development as a map"
        warrant="derived"
        note={`${lean.declarations.length.toLocaleString()} declarations · ${lean.modules.length} modules · ${tagged} tagged · commit ${lean.commit.slice(0, 12)} · ${lean.toolchain.replace("leanprover/", "")}`}
      >
        <Treemap lean={lean} by={by} selected={decl} onSelect={selectDecl} onBy={setBy} focus={focus} onFocus={setFocus} />
      </Section>
      {selected ? (
        <Section
          title={selected.name}
          warrant="derived"
          note={
            <a href={href({ view: "lean", decl: selected.name })} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; e.preventDefault(); openDecl(selected.name); }}>
              open its page
            </a>
          }
        >
          <DeclCard
            decl={selected}
            lean={lean}
            usedBy={usedBy.get(selected.name) ?? []}
            onOpen={openDecl}
            onEntry={(id) => openAt({ view: "read", entry: id })}
          />
        </Section>
      ) : (
        <p className="w-open">Select a cell for its source, what it uses and what uses it. {atlas.entries.length} atlas entries, {tagged} of them formalised by a tagged declaration.</p>
      )}
    </>
  );
}

export function DeclView() {
  const { lean, decl, openDecl, openAt } = useStore();
  const usedBy = useUsedBy();
  const loading = <Loading />;
  if (!lean) return loading;
  const d = decl ? lean.declarations.find((x) => x.name === decl) : undefined;
  if (!d)
    return (
      <Absence
        id="lean:no-such-declaration"
        inline={`No declaration named ${decl ?? "(none)"} in the development at this commit.`}
        what={`The development at commit ${lean.commit.slice(0, 12)} has no declaration named ${decl ?? "(none)"}.`}
        closes="A renamed or removed declaration changes this address; the map lists what exists."
      />
    );
  return (
    <Section
      title={d.name}
      warrant="derived"
      note={
        <a href={href({ view: "graph", decl: d.name })} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; e.preventDefault(); openAt({ view: "graph", decl: d.name }); }}>
          see it on the map
        </a>
      }
    >
      <DeclCard decl={d} lean={lean} usedBy={usedBy.get(d.name) ?? []} onOpen={openDecl} onEntry={(id) => openAt({ view: "read", entry: id })} />
    </Section>
  );
}
