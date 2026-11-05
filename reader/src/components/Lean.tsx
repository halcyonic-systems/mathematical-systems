/**
 * One declaration of the Lean development, shown whole: signature, the Lean
 * block itself, what it uses, what uses it, the axioms it rests on, and the
 * atlas entry it formalises when it carries a tag.
 *
 * The governing constraint (Shingai, 2026-11-05): every block must be easy
 * for a mathematician or a systems researcher to attack, understand and
 * inspect without opening the repository. So the source is here, not linked;
 * the link to GitHub at the pinned commit is for the reader who wants the
 * file around it.
 */
import { Fragment, useMemo } from "react";
import { href } from "../route";
import type { LeanDecl, LeanDump } from "../types";

/**
 * Identifiers in a source block are doors. A token is linked when it names a
 * declaration the environment says this one USES (exact name, or the unique
 * last component among them), or any declaration by its full name. Restricting
 * to `uses` is what keeps `things` in one structure from pointing at a field of
 * another: the compiler already resolved the reference, so the page follows
 * the compiler, never a guess.
 */
const TOKEN = /[A-Za-z_][A-Za-z0-9_'.!?\u2080-\u2089\u00C0-\u024F\u0370-\u03FF\u2100-\u214F]*/g;

export function linkTargets(decl: LeanDecl, byName: Map<string, LeanDecl>): Map<string, string> {
  const out = new Map<string, string>();
  const shortCount = new Map<string, number>();
  const candidates = [...decl.uses, decl.name];
  for (const n of candidates) {
    out.set(n, n);
    const short = n.split(".").pop()!;
    shortCount.set(short, (shortCount.get(short) ?? 0) + 1);
  }
  for (const n of candidates) {
    const short = n.split(".").pop()!;
    if (shortCount.get(short) === 1 && !out.has(short)) out.set(short, n);
    // `ConcreteSystem.things` for `Systems.ConcreteSystem.things`: the suffix
    // after the namespace the author opened.
    const parts = n.split(".");
    for (let i = 1; i < parts.length - 1; i++) {
      const suffix = parts.slice(i).join(".");
      if (!out.has(suffix) && byName.has(n)) out.set(suffix, n);
    }
  }
  return out;
}

export function LinkedSource({
  source,
  targets,
  self,
  onOpen,
}: {
  source: string;
  targets: Map<string, string>;
  self: string;
  onOpen: (name: string) => void;
}) {
  const parts = useMemo(() => {
    const out: (string | { tok: string; to: string })[] = [];
    let last = 0;
    for (const m of source.matchAll(TOKEN)) {
      const tok = m[0].replace(/[.!?]+$/, "");
      const to = targets.get(tok);
      const start = m.index!;
      if (to && to !== self) {
        if (start > last) out.push(source.slice(last, start));
        out.push({ tok, to });
        last = start + tok.length;
      }
    }
    if (last < source.length) out.push(source.slice(last));
    return out;
  }, [source, targets, self]);
  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <Fragment key={i}>{p}</Fragment>
        ) : (
          <a
            key={i}
            href={href({ view: "lean", decl: p.to })}
            title={p.to}
            onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; e.preventDefault(); onOpen(p.to); }}
            style={{ color: "var(--accent-strong)", textDecoration: "underline", textDecorationColor: "var(--accent-soft)", textUnderlineOffset: 2 }}
          >
            {p.tok}
          </a>
        ),
      )}
    </>
  );
}

const REPO = "https://github.com/halcyonic-systems/systems-science-foundations";

const mono = { fontFamily: "var(--font-mono)" } as const;

export function DeclCard({
  decl,
  lean,
  usedBy,
  onOpen,
  onEntry,
}: {
  decl: LeanDecl;
  lean: LeanDump;
  usedBy: string[];
  onOpen: (name: string) => void;
  /** Open an atlas entry by id (the tag's target). */
  onEntry: (id: string) => void;
}) {
  const file = decl.module.replace(/\./g, "/") + ".lean";
  const byName = useMemo(() => new Map(lean.declarations.map((d) => [d.name, d])), [lean]);
  const targets = useMemo(() => linkTargets(decl, byName), [decl, byName]);
  const link = (name: string) => (
    <li key={name} className="text-xs py-0.5" style={mono}>
      <a
        href={href({ view: "lean", decl: name })}
        onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; e.preventDefault(); onOpen(name); }}
        style={{ color: "var(--accent-strong)" }}
      >
        {name}
      </a>
    </li>
  );
  const list = (xs: string[]) =>
    xs.length ? <ul className="list-none m-0 p-0">{xs.map(link)}</ul> : <p className="w-open m-0 text-xs">none in the development</p>;
  const head = (t: string) => (
    <h3 className="eyebrow mt-4 mb-1 pb-1" style={{ borderBottom: "1px solid var(--hairline)" }}>{t}</h3>
  );

  return (
    <div className="instrument">
      <div className="text-xs mb-2" style={{ ...mono, color: "var(--text-muted)" }}>
        {decl.kind} ·{" "}
        <a href={`${REPO}/blob/${lean.commit}/${file}#L${decl.line}-L${decl.endLine}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-strong)" }}>
          {file}:{decl.line}
        </a>{" "}
        · commit {lean.commit.slice(0, 12)}
      </div>
      {decl.atlas.length > 0 && (
        <div className="text-xs mb-2" style={{ ...mono, color: "var(--text-muted)" }}>
          formalises{" "}
          {decl.atlas.map((id) => (
            <a key={id} href={href({ view: "read", entry: id })} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; e.preventDefault(); onEntry(id); }} style={{ color: "var(--accent-strong)" }}>
              {id}
            </a>
          ))}
        </div>
      )}
      <pre className="text-xs m-0 p-2" style={{ ...mono, whiteSpace: "pre-wrap", wordBreak: "break-word", background: "var(--bg-primary)", borderLeft: "3px solid var(--accent-soft)" }}>
        {decl.signature}
      </pre>
      {head("Source")}
      <pre className="text-xs m-0 p-2" style={{ ...mono, whiteSpace: "pre-wrap", wordBreak: "break-word", background: "var(--bg-primary)", borderLeft: "3px solid var(--accent)", maxHeight: "60vh", overflow: "auto" }}>
        <LinkedSource source={decl.source} targets={targets} self={decl.name} onOpen={onOpen} />
      </pre>
      {head(`Uses (${decl.uses.length})`)}
      {list(decl.uses)}
      {head(`Used by (${usedBy.length})`)}
      {list(usedBy)}
      {head("Axioms")}
      <p className="text-xs m-0" style={{ ...mono, color: "var(--text-secondary)" }}>{decl.axioms.join(", ") || "none"}</p>
    </div>
  );
}
