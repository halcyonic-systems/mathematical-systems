/**
 * The methods section, and the on-ramp.
 *
 * Two jobs at once. For a stranger arriving from a citation this is what the
 * catalogue is and how to read it. For an advisor it is the methods section —
 * what is claimed, on what warrant, what the build refuses, and what is
 * unsettled. Previously the landing state was entry 01's Read view, so a reader
 * had to reverse-engineer the epistemology from tab labels.
 *
 * Everything here is counted or read from the catalogue rather than written by
 * hand, so it cannot drift from what the artefact actually contains.
 */
import { Derivation, Editorial, Note, Section, warrantMeaning, type Warrant } from "./components";
import type { Atlas, Reasoning } from "./types";

const TIERS = [
  { n: 0, name: "Verbatim", of: "the passage as its author wrote it, with its location" },
  { n: 0, name: "Primitives", of: "the terms this encoding reads as primitive" },
  { n: 1, name: "Shape", of: "the dependency quiver, in the Lean development" },
  { n: 2, name: "Mapping", of: "what one definition does to another — the relations between them" },
];

export function FrontMatter({ atlas, reasoning }: { atlas: Atlas; reasoning: Reasoning }) {
  const entries = atlas.entries;
  const verified = Object.values(atlas.transcription).filter((t) => t.status === "located").length;
  const formalised = Object.values(atlas.shapes).filter((s) => s.status === "resolved").length;
  const withExamples = entries.filter((e) => e.includedExamples.length + e.excludedExamples.length > 0).length;
  const hvp = entries.filter((e) => (e.evidenceCode ?? "").endsWith("HVP")).length;
  const flipped = reasoning.variants.full.commitments.filter(
    (c) => reasoning.variants.shipped.commitments.find((o) => o.id === c.id)?.verdict !== c.verdict,
  ).length;

  return (
    <>
      <Section title="What this is" warrant="source">
        <p className="m-0">
          A catalogue of formal mathematical definitions of <em>“system”</em> from the systems theory and
          systems science traditions. Each entry records a definition transcribed verbatim from its primary
          source, where it was taken from, the terms it uses as primitives, the examples its author admits and
          refuses, and how the encoding was established. Relations <em>between</em> definitions — what one
          encompasses, what survives translation into another, and what is lost — are the point; the entries
          are the substrate.
        </p>
      </Section>

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
          verdict={withExamples < entries.length ? "note" : "holds"}
          claim={`${withExamples} of ${entries.length} entries record the examples their author gives.`}
          because="Where two definitions rule differently on the same case, that is a separating instance — the most valuable datum the catalogue can hold."
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
        {atlas.openDecisions.map((d) => (
          <Note key={d.title} kind={d.blocking ? "finding" : "boundary"} title={d.title}>
            {d.problem || d.fix}
          </Note>
        ))}
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
