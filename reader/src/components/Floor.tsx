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
import { Chip } from "./Chip";
import type { Floor, Primitive } from "../types";

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
