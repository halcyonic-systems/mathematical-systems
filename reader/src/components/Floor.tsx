/**
 * The entry page's floor figure: the shelf glyph, annotated.
 *
 * The front page shows every author over the same abstract arrow; this figure
 * names the nodes with the entry's OWN primitives — which of them plays the
 * dependency role, which the position role — and lists what the entry posits
 * beyond the two. The arrow convention is stated here, at the figure it
 * governs, because the front page no longer renders roles at all.
 *
 * Roles are declared and gated in atlas/mappings/floor.ttl; the additions are
 * computed from the entry's primitives minus the two role-players. This
 * component renders both and claims neither.
 */
import { useState } from "react";
import type { MouseEvent } from "react";
import { Chip } from "./Chip";
import { cite, worldOf } from "./EntryRail";
import type { Entry, Floor, Primitive } from "../types";

const nameOf = (iri: string | null, prims: Map<string, Primitive>) =>
  iri ? (prims.get(iri)?.label ?? iri.split("/").pop() ?? iri) : null;

export function FloorFigure({
  floor,
  primitives,
  primitiveDoor,
}: {
  floor: Floor;
  primitives: Primitive[];
  /** Chip door onto the census row; supplied by the view so routing stays there. */
  primitiveDoor: (iri: string) => { href: string; onOpen: () => void };
}) {
  const prims = new Map(primitives.map((p) => [p.iri, p]));
  const dep = nameOf(floor.dependency, prims);
  const pos = nameOf(floor.position, prims);
  return (
    <figure className="floor-figure">
      <svg viewBox="0 0 360 96" aria-label="this entry's floor roles">
        <circle cx="60" cy="34" r="9" fill="var(--bg-primary)" stroke="var(--world, var(--accent))" strokeWidth="3" />
        <circle cx="300" cy="34" r="9" fill="var(--bg-primary)" stroke="var(--world, var(--accent))" strokeWidth="3" />
        <line x1="73" y1="34" x2="277" y2="34" stroke="var(--world, var(--accent))" strokeWidth="2.5" />
        <polygon points="277,27 289,34 277,41" fill="var(--world, var(--accent))" />
        <text x="60" y="76" textAnchor="middle" className="floor-figure-label">
          {dep ?? "shape-level (Lean)"}
        </text>
        <text x="300" y="76" textAnchor="middle" className="floor-figure-label">
          {pos ?? "—"}
        </text>
        <text x="180" y="22" textAnchor="middle" className="floor-figure-verb">
          is defined over
        </text>
      </svg>
      <figcaption className="floor-figure-legend">
        arrows read &ldquo;is defined over&rdquo;: relation &rarr; thing means
        the relation cannot be stated without the things
      </figcaption>
      {floor.adds.length > 0 && (
        <div className="floor-figure-adds">
          <span className="eyebrow">beyond the floor</span>
          {floor.adds.map((iri) => (
            <Chip
              key={iri}
              tone="quiet"
              {...primitiveDoor(iri)}
              title="A primitive this entry invokes that plays neither floor role. Computed from the entry's own primitives; open its census row."
            >
              +{nameOf(iri, prims)}
            </Chip>
          ))}
        </div>
      )}
    </figure>
  );
}

/** One receipt pointer, set in the mono face: a file, a gate, a declaration.
    Text, not a link — the pointer names where to look, exactly as the trust
    line's clauses do. */
function Receipt({ children, refuted = false }: { children: string; refuted?: boolean }) {
  return <span className={refuted ? "floor-receipt floor-receipt-refuted" : "floor-receipt"}>{children}</span>;
}

/**
 * The floor page's protagonist (brief C, picked 2026-08-26): the walking arrow
 * large, with a selector that cycles every entry's own role-players into the
 * node labels. The convention legend is welded beneath — the figure never
 * appears without it. Shape-level entries render honestly: their dependency
 * label names the Lean warrant, not a word the passage never used.
 *
 * Everything countable is derived from the data (the selector IS the entry
 * list); the only hand-written prose is the claims, each carrying its receipt.
 */
export function FloorInstrument({
  entries,
  floor,
  primitives,
  hrefOf,
  onOpen,
}: {
  entries: Entry[];
  floor: Record<string, Floor>;
  primitives: Primitive[];
  hrefOf: (e: Entry) => string;
  onOpen: (iri: string) => void;
}) {
  const prims = new Map(primitives.map((p) => [p.iri, p]));
  const placed = entries.filter((e) => floor[e.iri]?.position);
  const [selected, setSelected] = useState(placed[0]?.iri ?? null);
  const current = placed.find((e) => e.iri === selected) ?? placed[0];
  if (!current) return null;
  const f = floor[current.iri];
  const dep = nameOf(f.dependency, prims);
  const pos = nameOf(f.position, prims);
  const open = (e: Entry) => (ev: MouseEvent) => {
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    ev.preventDefault();
    onOpen(e.iri);
  };
  return (
    <section className="floor-instrument">
      <div className="floor-selector" role="tablist" aria-label="Choose a definition">
        {placed.map((e) => {
          // Two entries can share a citation head (Bunge 1979 twice); the
          // accession number — the catalogue's own numbering — disambiguates.
          const head = cite(e.label).head;
          const dup = placed.filter((x) => cite(x.label).head === head).length > 1;
          return (
            <button
              key={e.iri}
              role="tab"
              aria-selected={e.iri === current.iri}
              data-world={worldOf(e.label)}
              className={`floor-chip${e.iri === current.iri ? " is-current" : ""}`}
              onClick={() => setSelected(e.iri)}
            >
              {head}
              {dup && <span className="floor-chip-note"> · {e.number}</span>}
              {floor[e.iri].dependencyShapeLevel && <span className="floor-chip-note"> · shape-level</span>}
            </button>
          );
        })}
      </div>
      <div data-world={worldOf(current.label)}>
        <svg viewBox="0 0 720 170" className="floor-instrument-svg" aria-label="this definition's floor roles">
          <text x="360" y="26" textAnchor="middle" className="floor-instrument-verb">
            is defined over
          </text>
          <circle cx="130" cy="72" r="14" fill="var(--bg-primary)" stroke="var(--world, var(--accent))" strokeWidth="4.5" />
          <circle cx="590" cy="72" r="14" fill="var(--bg-primary)" stroke="var(--world, var(--accent))" strokeWidth="4.5" />
          <line x1="150" y1="72" x2="562" y2="72" stroke="var(--world, var(--accent))" strokeWidth="3.5" />
          <polygon points="562,61 583,72 562,83" fill="var(--world, var(--accent))" />
          <text x="130" y="122" textAnchor="middle" className="floor-instrument-label">
            {dep ?? "shape-level (Lean)"}
          </text>
          <text x="590" y="122" textAnchor="middle" className="floor-instrument-label">
            {pos ?? "—"}
          </text>
        </svg>
        <p className="floor-instrument-cite">
          <a href={hrefOf(current)} onClick={open(current)} className="disclosure">
            {current.label} →
          </a>
        </p>
      </div>
      <p className="floor-figure-legend floor-instrument-legend">
        arrows read &ldquo;is defined over&rdquo;: relation &rarr; thing means the relation
        cannot be stated without the things &middot; a declared convention, never assumed
      </p>
    </section>
  );
}

/** The failing fork: the counterexample drawn, refuted-red, the IS-NOT column's
    one graphic. Three objects, two arrows out of one — the shape that enters
    only through composites no tradition asserts. */
export function FloorFork() {
  return (
    <svg viewBox="0 0 130 84" className="floor-fork" aria-label="the fork no tradition asserts">
      <circle cx="20" cy="40" r="7" fill="var(--bg-primary)" stroke="var(--proof-refuted)" strokeWidth="2.5" />
      <circle cx="108" cy="14" r="7" fill="var(--bg-primary)" stroke="var(--proof-refuted)" strokeWidth="2.5" />
      <circle cx="108" cy="66" r="7" fill="var(--bg-primary)" stroke="var(--proof-refuted)" strokeWidth="2.5" />
      <line x1="29" y1="36" x2="98" y2="17" stroke="var(--proof-refuted)" strokeWidth="2" />
      <line x1="29" y1="44" x2="98" y2="62" stroke="var(--proof-refuted)" strokeWidth="2" />
      <text x="65" y="82" textAnchor="middle" className="floor-fork-caption">
        the fork no tradition asserts
      </text>
    </svg>
  );
}

/** The twin columns: WHAT IT IS and WHAT IT IS NOT at identical weight — the
    brief's parity mechanism. Claims are hand-written prose; every one carries
    a receipt naming where to look, and the refusals hold the column with the
    page's only red. */
export function FloorColumns() {
  return (
    <div className="floor-columns">
      <div className="floor-col floor-col-is">
        <p className="eyebrow floor-col-head">What it is</p>
        <p>
          <strong>The whole shared core.</strong> Compared at shape level, the encoded
          traditions share exactly this arrow — one position depending on another — and
          nothing more. <Receipt>Systems/Challenge.lean</Receipt>
        </p>
        <p>
          <strong>Declared per entry, in its own words.</strong> Each definition names which
          of its primitives plays each end; whatever else it invokes is computed as its
          additions, never hand-written. <Receipt>floor.ttl · check_floor (can fail: proven)</Receipt>
        </p>
        <p>
          <strong>Definitional, not causal.</strong> The dependency is type-level — the
          relation cannot be stated without the things — not flow, not time, not influence.
        </p>
      </div>
      <div className="floor-col floor-col-not">
        <p className="eyebrow floor-col-head floor-col-head-not">What it is not</p>
        <div className="floor-col-fork-row">
          <FloorFork />
          <p>
            <strong>Not closed under composition.</strong> Freely compose the arrows and a
            fork embeds into every tradition through composites nobody asserts; the
            maximality claim fails there, machine-checked, so the floor is stated at
            quiver level. <Receipt refuted>free_category_maximality_fails</Receipt>
          </p>
        </div>
        <p>
          <strong>Blind below shape.</strong> Bunge&rsquo;s nonempty bondage and
          Bertalanffy&rsquo;s difference-making clause separate definitions the shape layer
          provably cannot — a recorded separating instance, not a hypothesis.{" "}
          <Receipt>common-core-theorem.md · separating instance</Receipt>
        </p>
        <p>
          <strong>Not a theory of any particular system.</strong> The floor claims the
          shared basis and pointedly nothing more; every definition is that basis plus
          commitments, and the commitments are the content.
        </p>
      </div>
    </div>
  );
}
