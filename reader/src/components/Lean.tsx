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
import { href } from "../route";
import type { LeanDecl, LeanDump } from "../types";

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
        {decl.source}
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
