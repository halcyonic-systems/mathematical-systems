/**
 * /mappings: what one definition does to another. Claims first (the graph's
 * addresses), then the documents (the arguments). Nothing here is written by
 * hand: claims come from claims.ttl, verdicts from the mappings README, and
 * "Lean" means the named theorem exists in the development at the pinned
 * commit, checked at build time.
 */
import { ClaimRows, DocRows, Section } from "./components";
import { useStore } from "./store";
import type { Atlas } from "./types";

export function MappingsView({ atlas }: { atlas: Atlas }) {
  const { openAt, openDecl } = useStore();
  const { claims, documents } = atlas.mappings;
  const checked = claims.filter((c) => c.theorem).length;
  const owed = claims.filter((c) => c.owes).length;
  return (
    <>
      <Section
        title="Claims between entries"
        warrant="derived"
        note={`${claims.length} claims · ${checked} machine-checked · ${owed} owing a theorem · from claims.ttl`}
      >
        <ClaimRows claims={claims} entries={atlas.entries} onEntry={(id) => openAt({ view: "read", entry: id })} onDecl={openDecl} />
      </Section>
      <Section
        title="The arguments"
        warrant="decided"
        note={`${documents.length} mapping documents · verdicts as the mappings README states them`}
      >
        <DocRows docs={documents} onDecl={openDecl} />
      </Section>
    </>
  );
}
