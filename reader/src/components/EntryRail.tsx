/**
 * The list of entries, as a numbered ledger.
 *
 * Discrete rows separated by real rules with a continuous tinted gutter and a
 * numeral — the treatment that won the fleet's bake-off, where the runner-up
 * failed because its rows blended into one another. Sticky and independently
 * scrollable, because an entry runs to nearly three thousand pixels and
 * navigation that scrolls away is navigation you do not have.
 */
/**
 * Split "Klir (2001), Facets of Systems Science, eq. (1.1)" into the part that
 * identifies the entry at a glance and the part that does not. Degrades to the
 * whole label as the head when there is no comma, so a label written in another
 * shape still renders — it just does not get the second line.
 */
export function cite(label: string | null) {
  if (!label) return { head: "—", tail: null };
  const i = label.indexOf(", ");
  return i === -1
    ? { head: label, tail: null }
    : { head: label.slice(0, i), tail: label.slice(i + 2) };
}

export function EntryRail({
  entries,
  active,
  onSelect,
}: {
  entries: { iri: string; label: string | null; sourceLocation: string | null }[];
  active: string | null;
  onSelect: (iri: string) => void;
}) {
  return (
    <nav
      aria-label="Entries"
      style={{ borderRight: "1px solid var(--border)", background: "var(--bg-secondary)" }}
      className="w-72 shrink-0 self-start rail"
    >
      <p
        className="eyebrow px-4 py-2 m-0"
        style={{ background: "var(--accent-soft)", borderBottom: "1px solid var(--border)" }}
      >
        Entries
      </p>
      {entries.map((e, i) => (
        <button
          key={e.iri}
          onClick={() => onSelect(e.iri)}
          aria-current={active === e.iri ? "true" : undefined}
          className={`rail-row w-full text-left flex cursor-pointer${
            active === e.iri ? " is-current" : ""
          }`}
        >
          <span className="rail-numeral px-3 py-3 tabular-nums text-xs shrink-0">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="px-3 py-3">
            {/* Author and year lead, roman and bold; the work and the locus fall
                back. The whole label was previously one small-caps run, which
                wrapped to three lines and made the rail unscannable — small
                caps is for an even column of NAMES, and this is a citation. */}
            <span className="rail-title text-sm block">{cite(e.label).head}</span>
            {cite(e.label).tail && (
              <span className="rail-work text-xs block">{cite(e.label).tail}</span>
            )}
            <span className="rail-locus text-xs block">{e.sourceLocation}</span>
          </span>
        </button>
      ))}
    </nav>
  );
}
