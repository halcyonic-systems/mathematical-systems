/**
 * The mapping layer, as rows: one claim per row with its two ends, its
 * relation, how it was established (evidence grade), and how it is warranted
 * (argued in prose, machine-checked in Lean, or both); then the documents.
 *
 * Edge typing follows stacks.axiommath.ai: a claim argued only in prose, one
 * confirmed by a Lean path, or both. The reserved evidence channel is used for
 * the grade; the warrant kind is said in words, not colour, so nothing
 * collides with the three reserved channels.
 */
import { href } from "../route";
import type { Entry, MappingClaim, MappingDoc } from "../types";
import { Chip } from "./Chip";
import { EvidenceBadge } from "./Badge";

const ATLAS_REPO = "https://github.com/halcyonic-systems/mathematical-systems/blob/main/atlas";

const plain = (e: React.MouseEvent) => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

export function ClaimRows({
  claims,
  entries,
  onEntry,
  onDecl,
}: {
  claims: MappingClaim[];
  entries: Entry[];
  onEntry: (id: string) => void;
  onDecl: (name: string) => void;
}) {
  const byIri = new Map(entries.map((e) => [e.iri, e]));
  const end = (iri: string) => {
    const e = byIri.get(iri);
    const id = iri.split("/").pop() ?? iri;
    return (
      <a href={href({ view: "read", entry: id })} onClick={(ev) => { if (plain(ev)) return; ev.preventDefault(); onEntry(id); }} style={{ color: "var(--accent-strong)" }}>
        {e?.label ?? id}
      </a>
    );
  };
  if (!claims.length) return <p className="w-open m-0">No claims recorded yet.</p>;
  return (
    <div className="instrument">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-xs" style={{ color: "var(--text-muted)" }}>
            {["From", "Relation", "To", "Established", "Warrant", "Argued in"].map((h) => (
              <th key={h} className="text-left font-medium pb-2 pr-3" style={{ borderBottom: "1px solid var(--border)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {claims.map((c) => (
            <tr key={c.id} className="align-top">
              <td className="py-2 pr-3" style={{ borderBottom: "1px solid var(--hairline)" }}>{end(c.source)}</td>
              <td className="py-2 pr-3" style={{ borderBottom: "1px solid var(--hairline)", color: "var(--text-secondary)" }} title={c.relationNote ?? undefined}>
                {c.relationLabel ?? c.relation?.split("/").pop()}
              </td>
              <td className="py-2 pr-3" style={{ borderBottom: "1px solid var(--hairline)" }}>{end(c.target)}</td>
              <td className="py-2 pr-3" style={{ borderBottom: "1px solid var(--hairline)" }}><EvidenceBadge code={c.evidenceCode} /></td>
              <td className="py-2 pr-3" style={{ borderBottom: "1px solid var(--hairline)" }}>
                <span className="flex flex-wrap gap-1">
                  <Chip tone="quiet">prose</Chip>
                  {c.theorem ? (
                    <Chip tone="solid" href={href({ view: "lean", decl: c.theorem })} onOpen={() => onDecl(c.theorem!)} title="A Lean declaration backs this claim">
                      Lean · {c.theorem.split(".").pop()}
                    </Chip>
                  ) : c.owes ? (
                    <Chip tone="outline" title="A claim of loss owes a theorem or a witness; none is named yet">theorem owed</Chip>
                  ) : null}
                </span>
              </td>
              <td className="py-2" style={{ borderBottom: "1px solid var(--hairline)", fontFamily: "var(--font-mono)" }}>
                {c.arguedIn ? (
                  <a href={`${ATLAS_REPO}/${c.arguedIn}`} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: "var(--accent-strong)" }}>{c.arguedIn.replace("mappings/", "")}</a>
                ) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DocRows({ docs, onDecl }: { docs: MappingDoc[]; onDecl: (name: string) => void }) {
  return (
    <div className="instrument">
      <ul className="list-none m-0 p-0">
        {docs.map((d) => (
          <li key={d.file} className="py-3" style={{ borderBottom: "1px solid var(--hairline)" }}>
            <a href={`${ATLAS_REPO}/${d.file}`} target="_blank" rel="noopener noreferrer" className="font-medium" style={{ color: "var(--text-primary)" }}>{d.title}</a>
            {d.verdict && <p className="m-0 mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{d.verdict.replace(/\*\*/g, "")}</p>}
            <p className="m-0 mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              {d.cites.length ? "Cites, and the development has: " : "Cites no declaration the development has."}
              {d.cites.map((n, i) => (
                <span key={n}>
                  {i > 0 && ", "}
                  <a href={href({ view: "lean", decl: n })} onClick={(ev) => { if (plain(ev)) return; ev.preventDefault(); onDecl(n); }} style={{ color: "var(--accent-strong)", fontFamily: "var(--font-mono)" }}>{n}</a>
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
