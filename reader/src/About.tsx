/**
 * The methods section, one click from everywhere.
 *
 * These sections lived on the front page, where they asked a first-time reader
 * to absorb the epistemology before seeing a single definition. They are the
 * second visit's material — what the catalogue has reached, what its build
 * refuses, what is unsettled, where this build came from — so they moved here
 * intact, and the front page became the invitation.
 *
 * Everything here is counted or read from the catalogue rather than written by
 * hand, so it cannot drift from what the artefact actually contains.
 */
import { Derivation, Editorial, Note, Section, warrantMeaning, type Tier, type Warrant } from "./components";
import type { Atlas, Reasoning } from "./types";

/** The ladder, shared with the reading key inside an entry so the two render
    from one description and cannot drift. */
export const TIERS: Tier[] = [
  { n: 0, name: "Verbatim", of: "the passage as its author wrote it, with its location" },
  { n: 0, name: "Primitives", of: "the terms this encoding reads as primitive" },
  { n: 1, name: "Shape", of: "the dependency quiver, in the Lean development" },
  { n: 2, name: "Mapping", of: "what one definition does to another — the relations between them" },
];

export function AboutView({ atlas, reasoning }: { atlas: Atlas; reasoning: Reasoning }) {
  const entries = atlas.entries;
  const verified = Object.values(atlas.transcription).filter((t) => t.status === "located").length;
  const formalised = Object.values(atlas.shapes).filter((s) => s.status === "resolved").length;
  const withCases = entries.filter((e) => e.admits.length + e.refuses.length > 0).length;
  const cases = Object.values(atlas.cases);
  const casesLocated = cases.filter((c) => c.sourceLocation).length;
  const hvp = entries.filter((e) => (e.evidenceCode ?? "").endsWith("HVP")).length;
  const flipped = reasoning.variants.full.commitments.filter(
    (c) => reasoning.variants.shipped.commitments.find((o) => o.id === c.id)?.verdict !== c.verdict,
  ).length;

  return (
    <>
      <Section title="Where it stands" warrant="derived" note="counted from the catalogue, not written by hand">
        <Derivation
          verdict={verified === entries.length ? "holds" : "bounded"}
          claim={`${verified} of ${entries.length} transcriptions located in their primary text.`}
          because="Every verbatim is searched for in the book it came from, at build time. The verdict travels with the catalogue; the book does not."
        />
        <Derivation
          verdict={hvp === entries.length ? "holds" : "note"}
          claim={`${hvp} of ${entries.length} entries are human-verified against the primary text.`}
          because="An encoding a model produced and nobody checked is marked MDU and must not be cited. The grade is shown on every entry so unverified work never reads as verified."
        />
        <Derivation
          verdict={formalised ? "holds" : "bounded"}
          claim={`${formalised} of ${entries.length} entries link to a shape category in the Lean development.`}
          because="The pointer says a formalisation exists and where. Whether it is faithful to the passage is a mapping claim, and owes its own evidence."
        />
        <Derivation
          verdict={withCases < entries.length ? "note" : "holds"}
          claim={`${withCases} of ${entries.length} entries record the cases their author rules on, ${cases.length} in total.`}
          because="Where two definitions rule differently on the same case, that is a separating instance — the most valuable datum the catalogue can hold."
        />
        <Derivation
          verdict={casesLocated === cases.length ? "holds" : "note"}
          claim={`${casesLocated} of ${cases.length} cases carry their own source location.`}
          because="Cases became individuals so each could be graded and located separately from the entry it hangs off. The ones without a location are Bunge's, which sit in a labelled block outside the location his entry claims — a gap reifying them made visible rather than created."
        />
      </Section>

      <Section title="The ladder" warrant="decided" note="what an entry can carry, and in what order">
        <ul className="m-0 pl-4">
          {TIERS.map((t) => (
            <li key={t.name} className="mb-2">
              <strong>{t.name}</strong> <span className="w-open not-italic">tier {t.n}</span> — {t.of}
            </li>
          ))}
        </ul>
        <p className="mt-4 mb-0">
          Every entry here has reached tier 0. Tier 1 exists in Lean for {formalised} of them and is not
          duplicated into the catalogue: a quiver is trivially storable in RDF, but the question you want to
          ask of it — whether one shape embeds faithfully in another — is a functor question no description
          logic can compute. Tier 2 has one document and no vocabulary yet.
        </p>
      </Section>

      <Section title="How to read the weight" warrant="decided" note="the interface argues; here is its grammar">
        <p className="mt-0">
          Every claim on every page carries a <em>warrant</em>, and the warrant decides its weight. This is
          derived from the data — evidence codes, whether something was computed or chosen, whether a pointer
          is absent — never assigned by eye.
        </p>
        <dl className="m-0 grid gap-x-6 gap-y-2">
          {(Object.keys(warrantMeaning) as Warrant[]).map((w) => (
            <div key={w} className="flex gap-3 items-baseline">
              <dt className="eyebrow">
                {w}
              </dt>
              <dd className="m-0">{warrantMeaning[w]}</dd>
            </div>
          ))}
        </dl>
        <p className="mb-0 mt-4">
          Weight never uses colour. Colour is reserved for three contractual channels — evidence grade, proof
          status, transcription — and every mark on those channels carries a glyph as well, so nothing depends
          on seeing a hue.
        </p>
      </Section>

      <Section title="What the build refuses" warrant="derived" note="four gates, each with something that can fail it">
        <Derivation
          verdict="holds"
          claim="The two import closures must disagree."
          because={
            <>
              The catalogue asserts that no entry claims to be <em>about</em> anything — which keeps it neutral
              between realist and constructivist traditions. That holds only because the shipped extract drops
              an equivalence axiom. The build exits non-zero if both closures ever report the same
              commitments, so the claim cannot go quietly false. Under the full closure it changes {flipped}{" "}
              verdicts today.
            </>
          }
        />
        <Derivation
          verdict="holds"
          claim="A corrupted verbatim must be refused."
          because="The transcription gate is itself tested each run: a just-verified passage is corrupted two ways and the locator must reject both. Its first version substituted words absent from the passage, so it verified an unmodified string — and failed the build."
        />
        <Derivation
          verdict="holds"
          claim="A pointer into the formalisation must resolve."
          because="A broken link into the Lean development is worse than no link: it asserts a formalisation exists and sends the reader nowhere."
        />
        <Derivation
          verdict="holds"
          claim="An entry must satisfy its shape."
          because="SHACL requires a verbatim, a source location, a bearer, exactly one evidence code, a declared primitive — and forbids asserting what the definition is about."
        />
      </Section>

      <Section title="What is unsettled" warrant="open" note="ordered by cost of deferral, not severity">
        {/* The problem and, where one is drafted, the way out. Showing only the
            first of the two made D4 read as "Two defects, both flagged by both
            councils." and nothing else — a heading, a sentence of throat-clearing,
            and no decision. */}
        {/* instrument: a grid of decision cards is not prose and must not
            inherit prose's 44rem measure — two-up inside it was 320px columns. */}
        <div className="unsettled-grid instrument">
          {atlas.openDecisions.map((d) => (
            <div key={d.title}>
              <Note kind={d.blocking ? "finding" : "boundary"} title={d.title}>
                {d.problem}
              </Note>
              {d.fix && (
                <p className="w-open m-0 mt-1.5 pl-4">
                  <Editorial>{d.fix}</Editorial>
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 mb-0">
          <Editorial>
            A three-entry scaffold is not a fifty-entry corpus. The useful question is which problems get more
            expensive to fix later, not which sound worst.
          </Editorial>
        </p>
      </Section>

      <Section title="Provenance" warrant="decided">
        <p className="m-0">
          Built from <code>{atlas.source.repo}</code>
          {atlas.provenance.atlasCommit && <> at commit <code>{atlas.provenance.atlasCommit}</code></>}. Reasoning
          is precomputed; this page runs no reasoner. Transcription verification reads full primary texts held
          outside the repository, so it cannot run on a build server and never should — the verdicts travel,
          the books do not.
        </p>
      </Section>
    </>
  );
}
