/**
 * The five views. Composition only — no layout lives here.
 *
 * Every section declares the WARRANT of what it holds, and the warrant decides
 * its weight. The assignments are not decoration; a few are deliberately
 * uncomfortable and say something true:
 *
 *   "What it posits" is `decided`, not `source`. The primitives were chosen by
 *   an encoder reading the passage, and the primitive scheme's own scope note
 *   says a primitive records that an author uses a WORD. The scale forces the
 *   interface to admit in pixels what the ontology admits in prose.
 *
 *   "As formalised" is `derived` — the quiver is parsed from Lean — while the
 *   pointer to it is `decided`, which is exactly what atlas:formalisedAs
 *   documents about itself.
 */
import {
  Absence,
  CaseList,
  Chip,
  Derivation,
  EvidenceBadge,
  Field,
  FieldGrid,
  FieldHeadings,
  InPage,
  Matrix,
  Note,
  OpenQuestionsBlock,
  Passage,
  ProofBadge,
  Quiver,
  Section,
  Toggle,
  TranscriptBadge,
  classifyNote,
  localName,
  type CellState,
} from "./components";
import { useStore } from "./store";
import type { Atlas, Reasoning } from "./types";

const byIri = <T extends { iri: string }>(xs: T[]) => new Map(xs.map((x) => [x.iri, x]));

/** "Bunge (1979), Definition 1.1: concrete system" -> "Definition 1.1: concrete system". */
const distinguishing = (label: string | null) => (label ?? "").replace(/^[^,]*\(\d{4}\),\s*/, "");

/** Source hard-wraps are an artefact of the .ttl, not the author's line breaks. */
const unwrap = (s: string) => s.replace(/\n(?!\n)/g, " ");



/* ------------------------------------------------------------------ read -- */

export function ReadView({ atlas }: { atlas: Atlas }) {
  const reading = useStore((s) => s.reading);
  const entry = atlas.entries.find((e) => e.iri === reading) ?? atlas.entries[0];
  const bearer = byIri(atlas.bearers).get(entry.statedIn ?? "");
  const prims = byIri(atlas.primitives);
  const t = atlas.transcription[entry.iri];
  const shape = atlas.shapes[entry.iri];
  const untyped = atlas.primitives.every((p) => !p.role);

  return (
    <>
      <Section
        title="The passage"
        warrant="source"
        note={
          <span className="flex items-center gap-2 flex-wrap">
            <TranscriptBadge status={t?.status ?? "no-verbatim"} source={t?.source} />
            {bearer?.label}
          </span>
        }
      >
        <Passage text={entry.verbatim} location={entry.sourceLocation} />
        {entry.authorCaveat && (
          <Note kind="finding" title="The author's own caveat">
            {entry.authorCaveat}
          </Note>
        )}
      </Section>

      {t?.context && (
        <Section
          title="In the source"
          warrant="source"
          note={`${t.source} · ${t.matchedChars}/${t.verbatimChars} characters located`}
        >
          <InPage {...t.context} />
          {t.normalisations?.length ? (
            <p className="w-open mt-4 mb-0">Ignored when matching: {t.normalisations.join("; ")}.</p>
          ) : null}
        </Section>
      )}

      <Section title="What it posits" warrant="decided" note="terms this encoding reads as primitive">
        <div className="flex flex-wrap gap-2">
          {entry.primitives.map((p) => (
            <Chip key={p}>
              {prims.get(p)?.label ?? localName(p)}
              {prims.get(p)?.role ? ` · ${prims.get(p)!.role}` : ""}
            </Chip>
          ))}
        </div>
        {untyped && (
          <Absence
            id={`${entry.id}:untyped-primitives`}
            inline="Untyped — recorded lexically, with no signature role."
            what="The primitives on this entry carry no signature role."
            closes="Typing them via skos:broader onto a model-theoretic vocabulary would turn the census into a comparison of signatures rather than of words."
          />
        )}
      </Section>

      <Section
        title="As formalised"
        warrant="derived"
        note={shape?.status === "resolved" ? `${shape.file} · ${shape.shape}` : undefined}
      >
        {shape?.status === "resolved" ? (
          <Quiver shape={shape} />
        ) : shape?.status === "error" ? (
          <p className="w-open m-0">{shape.error}</p>
        ) : (
          <Absence
            id={`${entry.id}:no-shape`}
            inline="No shape category formalises this entry."
            what="No shape category in the foundations formalises this entry."
            closes="Its formal counterpart there is a structure rather than a quiver, so whether the two encodings agree is unchecked."
          />
        )}
      </Section>

      <Section title="What it admits and refuses" warrant="source">
        <FieldGrid columns={2}>
          <FieldHeadings headings={["Admits", "Refuses"]} />
          <Field
            label="Examples"
            warrant="source"
            cells={[
              <CaseList key="a" iris={entry.admits} cases={atlas.cases} />,
              <CaseList key="r" iris={entry.refuses} cases={atlas.cases} />,
            ]}
          />
        </FieldGrid>
        {entry.admits.length === 0 && entry.refuses.length === 0 && (
          <Absence
            id={`${entry.id}:no-examples`}
            inline="No examples recorded."
            what="This entry records no examples, admitted or refused."
            closes="The source may still contain them; recording them is what would let a conflict with another definition be derived rather than asserted."
          />
        )}
      </Section>

      <Section title="Provenance" warrant="decided">
        <p className="m-0 flex items-center gap-3 flex-wrap">
          <EvidenceBadge code={entry.evidenceCode} />
          <span>
            {entry.encodedBy} · {entry.encodedOn}
          </span>
        </p>
        {bearer && (
          <p className="mt-3 mb-0">
            {bearer.label}
            {bearer.identifiers.length > 0 && <> · {bearer.identifiers.join(" · ")}</>}
          </p>
        )}
      </Section>

      {entry.annotation.length > 0 && (
        <Section title="Encoder's apparatus" warrant="decided" note="written into the entry, not derived">
          {entry.annotation.map((b, i) => (
            <Note key={i} kind={classifyNote(b.kind, b.title)} title={b.title}>
              {unwrap(b.body)}
            </Note>
          ))}
        </Section>
      )}

      <Section title="Open questions" warrant="open" note="what this entry does not yet settle">
        <OpenQuestionsBlock />
      </Section>
    </>
  );
}

/* --------------------------------------------------------------- compare -- */

export function CompareView({ atlas }: { atlas: Atlas }) {
  const compared = useStore((s) => s.compared);
  const toggle = useStore((s) => s.toggle);
  const shown = atlas.entries.filter((e) => compared.includes(e.iri));
  const prims = byIri(atlas.primitives);

  const sets = shown.map((e) => new Set(e.primitives));
  const shared = [...(sets[0] ?? [])].filter((p) => sets.every((s) => s.has(p)));
  const isUnique = (p: string) => sets.filter((s) => s.has(p)).length === 1;

  return (
    <>
      <Section title="Definitions in view" warrant="decided">
        <div className="flex flex-wrap gap-2">
          {atlas.entries.map((e) => (
            <Toggle key={e.iri} on={compared.includes(e.iri)} onClick={() => toggle(e.iri)}>
              {e.label}
            </Toggle>
          ))}
        </div>
      </Section>

      {shown.length > 1 && (
        <Section title="What the comparison shows" warrant="derived" note="computed from the entries below">
          <Derivation
            verdict={shared.length ? "holds" : "bounded"}
            claim={
              shared.length
                ? `${shared.length} primitive${shared.length === 1 ? "" : "s"} shared by all ${shown.length}: ${shared
                    .map((p) => prims.get(p)?.label ?? localName(p))
                    .join(", ")}.`
                : "No primitive is shared by all the definitions in view."
            }
            because="Shared vocabulary is lexical, not semantic — two entries using the word “thing” are not thereby claimed to mean the same by it."
          />
        </Section>
      )}

      <Section title="Side by side" warrant="source">
        <FieldGrid columns={Math.max(shown.length, 1)} scrollable>
          <FieldHeadings headings={shown.map((e) => e.label)} />
          <Field label="Passage" warrant="source" cells={shown.map((e) => e.verbatim ?? "—")} />
          <Field
            label="Posits"
            warrant="decided"
            cells={shown.map((e) => (
              <span key={e.iri} className="flex flex-wrap gap-1.5">
                {e.primitives.map((p) => (
                  <Chip key={p} tone={isUnique(p) ? "solid" : "quiet"}>
                    {prims.get(p)?.label ?? localName(p)}
                  </Chip>
                ))}
              </span>
            ))}
          />
          <Field
            label="Admits"
            warrant="source"
            cells={shown.map((e) => <CaseList key={e.iri} iris={e.admits} cases={atlas.cases} />)}
          />
          <Field
            label="Refuses"
            warrant="source"
            cells={shown.map((e) => <CaseList key={e.iri} iris={e.refuses} cases={atlas.cases} />)}
          />
          <Field label="Author's caveat" warrant="source" cells={shown.map((e) => e.authorCaveat ?? "—")} />
          <Field
            label="Evidence"
            warrant="decided"
            cells={shown.map((e) => <EvidenceBadge key={e.iri} code={e.evidenceCode} />)}
          />
        </FieldGrid>
        <p className="w-open mt-4 mb-0 not-italic">
          Filled chips are unique to one definition; quiet chips are shared.
        </p>
      </Section>
    </>
  );
}

/* ---------------------------------------------------------------- census -- */

export function CensusView({ atlas }: { atlas: Atlas }) {
  const untyped = atlas.primitives.every((p) => !p.role);
  const rows = atlas.primitives.map((p) => ({
    key: p.iri,
    label: (
      <>
        {p.label}
        {p.role && <span className="w-open"> · {p.role}</span>}
      </>
    ),
    cells: atlas.entries.map((e): CellState =>
      p.usedBy.includes(e.iri) ? "yes" : p.usedBy.length === 0 ? "unknown" : "silent",
    ),
    total: p.usedBy.length,
  }));

  return (
    <>
      <Section
        title="Primitive census"
        warrant="decided"
        note={`${atlas.primitives.length} primitives across ${atlas.entries.length} entries`}
      >
        <Matrix
          columns={atlas.entries.map((e) => distinguishing(e.label))}
          rows={rows}
          caption={atlas.primitiveSchemeScopeNote
            ?.split("\n\n")[0]
            .replace(/^LEXICAL, NOT SEMANTIC\.\s*/, "Lexical, not semantic. ")}
        />
      </Section>

      <Section title="Open questions" warrant="open">
        {untyped && (
          <Absence
            id="census:untyped"
            inline="Untyped."
            what="No primitive in the scheme carries a signature role."
            closes="An external model-theoretic vocabulary attached via skos:broader would also dissolve the charge that the census is self-confirming."
          />
        )}
        <OpenQuestionsBlock />
      </Section>
    </>
  );
}

/* ---------------------------------------------------------------- ledger -- */

export function LedgerView({ atlas }: { atlas: Atlas }) {
  const rows = atlas.entries.flatMap((e) => [
    ...e.admits.map((iri) => ({ entry: e, stance: "admits" as const, iri })),
    ...e.refuses.map((iri) => ({ entry: e, stance: "refuses" as const, iri })),
  ]);

  return (
    <>
      <Section title="Derived conflicts" warrant="derived" note="one test object, ruled on both ways">
        {atlas.conflicts.length === 0 ? (
          <Derivation
            verdict="bounded"
            claim="No conflict can be derived from the recorded cases."
            because="A conflict is one test object that a definition admits and another refuses. None of the cases recorded so far share an identified object."
          />
        ) : (
          atlas.conflicts.map((c) => {
            const grade = (c.evidenceCode ?? "").split("/").pop();
            return (
              <Derivation
                key={c.object}
                verdict={grade === "HVP" ? "holds" : "note"}
                claim={`${c.label} — admitted by ${c.admittedBy.length}, refused by ${c.refusedBy.length}.`}
                because={
                  <>
                    Derived: both rulings point at one test object, so this is found rather than
                    asserted. It is only as strong as that identification, which is graded{" "}
                    <strong>{grade}</strong>
                    {grade === "MDU" && " — model-drafted and unchecked, so this finding is real machinery on an unverified claim"}
                    {c.arguedIn && <> and argued in <code>{c.arguedIn}</code></>}.
                  </>
                }
                detail={
                  <ul className="m-0 pl-4">
                    {c.admittedBy.map((a) => (
                      <li key={a.case}>
                        admits <CaseList iris={[a.case]} cases={atlas.cases} />
                      </li>
                    ))}
                    {c.refusedBy.map((r) => (
                      <li key={r.case}>
                        refuses <CaseList iris={[r.case]} cases={atlas.cases} />
                      </li>
                    ))}
                  </ul>
                }
              />
            );
          })
        )}
      </Section>

      <Section
        title="Examples ledger"
        warrant="source"
        note={`${rows.length} recorded across ${atlas.entries.length} entries`}
      >
        <FieldGrid columns={2}>
          <FieldHeadings headings={["Example", "Entry"]} />
          {rows.map((r, i) => (
            <Field
              key={i}
              label={r.stance}
              warrant="source"
              cells={[
                <CaseList key="c" iris={[r.iri]} cases={atlas.cases} />,
                <span key="e" className="name-column">{distinguishing(r.entry.label)}</span>,
              ]}
            />
          ))}
        </FieldGrid>
      </Section>

      <Section title="Open questions" warrant="open">
        {Object.values(atlas.cases).filter((c) => !c.instantiates).length > 0 && (
          <Absence
            id="ledger:cases-unidentified"
            inline={`${Object.values(atlas.cases).filter((c) => !c.instantiates).length} of ${Object.keys(atlas.cases).length} cases are not identified with a test object.`}
            what="Most cases are not yet identified with a shared test object."
            closes="Until a case names the object it is a case of, no other author's ruling on that object can be matched against it. A test object is added only where the corpus contains at least two rulings, so most cases will stay unidentified until the catalogue grows."
          />
        )}
        <OpenQuestionsBlock />
      </Section>
    </>
  );
}

/* ----------------------------------------------------------- commitments -- */

export function CommitmentsView({ reasoning }: { reasoning: Reasoning }) {
  const variant = useStore((s) => s.variant);
  const setVariant = useStore((s) => s.setVariant);
  const v = reasoning.variants[variant];
  const other = reasoning.variants[variant === "shipped" ? "full" : "shipped"];
  const flipped = v.commitments.filter((c) => other.commitments.find((o) => o.id === c.id)?.verdict !== c.verdict);

  const readable = (axiom: string) =>
    axiom.replace(/<([^>]+)>/g, (_, iri: string) => {
      const ln = iri.split(/[/#]/).pop() ?? iri;
      return v.labels[ln] ?? ln;
    });

  return (
    <>
      <Section
        title="Import closure"
        warrant="decided"
        note="the same entries, read against two different sets of imported axioms"
      >
        <div className="flex gap-2 flex-wrap">
          {(["shipped", "full"] as const).map((k) => (
            <Toggle key={k} on={variant === k} onClick={() => setVariant(k)}>
              {reasoning.variants[k].label}
            </Toggle>
          ))}
        </div>
        {flipped.length > 0 && (
          <p className="mt-4 mb-0">
            Widening the import set changes {flipped.length} verdict{flipped.length === 1 ? "" : "s"}, both
            concerning aboutness. The neutrality invariant survives only under the minimal extract — and the
            two axioms responsible sit in different files, one of them a property axiom. Not findable by
            reading.
          </p>
        )}
      </Section>

      <Section title="What the entries are committed to" warrant="derived" note={v.label}>
        {v.commitments.map((c) => (
          <Derivation
            key={c.id}
            verdict={c.verdict === "entailed" ? "holds" : c.verdict === "refuted" ? "fails" : "bounded"}
            claim={c.question}
            because={
              <>
                {c.matters}
                {c.bounded && c.verdict !== "entailed" && (
                  <> No proof was found within the reasoner's budget — which is not the same claim as refuted.</>
                )}
              </>
            }
            detail={
              <p className="m-0">
                <ProofBadge status={c.verdict} bounded={c.bounded} />
              </p>
            }
          />
        ))}
      </Section>

      <Section title="Why" warrant="derived" note="one minimal justification per entailment, from the reasoner">
        {v.justifications.map((j, i) => (
          <Derivation
            key={i}
            verdict={j.axioms.length ? "holds" : "bounded"}
            claim={(() => {
              const sup = v.labels[localName(j.sup)] ?? localName(j.sup);
              // The label is data, so the article has to agree with it at render time.
              return `${v.labels[localName(j.sub)] ?? localName(j.sub)} is ${
                /^[aeiou]/i.test(sup) ? "an" : "a"
              } ${sup}.`;
            })()}
            because={j.axioms.length ? undefined : `Not entailed under this closure${j.note ? ` (${j.note})` : ""}.`}
            detail={
              j.axioms.length ? (
                <ul className="m-0 pl-4 font-mono text-xs">
                  {j.axioms.map((a, k) => (
                    <li key={k} className="mb-1">
                      {readable(a)}
                    </li>
                  ))}
                </ul>
              ) : undefined
            }
          />
        ))}
      </Section>

      <Section title="What the reasoner could not represent" warrant="derived">
        {Object.keys(v.droppedAxioms).length === 0 ? (
          <Derivation verdict="holds" claim="Every axiom was represented." because={`Consistent: ${v.consistent}.`} />
        ) : (
          <Derivation
            verdict="note"
            claim={`${Object.values(v.droppedAxioms).reduce((a, b) => a + b, 0)} axioms could not be represented.`}
            because="A sound under-approximation: verdicts here may be too weak, never too strong. Nothing above rests on an axiom that was dropped."
            detail={
              <ul className="m-0 pl-4 text-xs">
                {Object.entries(v.droppedAxioms).map(([k, n]) => (
                  <li key={k}>
                    {k} — {n}
                  </li>
                ))}
              </ul>
            }
          />
        )}
      </Section>
    </>
  );
}
