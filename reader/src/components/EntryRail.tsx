/**
 * The list of entries, as a numbered ledger.
 *
 * Discrete rows separated by real rules with a continuous tinted gutter and a
 * numeral — the treatment that won the fleet's bake-off, where the runner-up
 * failed because its rows blended into one another. Sticky and independently
 * scrollable, because an entry runs to nearly three thousand pixels and
 * navigation that scrolls away is navigation you do not have.
 */
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
          className="w-full text-left flex cursor-pointer bg-transparent"
          style={{
            borderBottom: "1px solid var(--border)",
            background: active === e.iri ? "var(--bg-primary)" : "transparent",
          }}
        >
          <span
            className="px-3 py-3 tabular-nums text-xs shrink-0"
            style={{ background: "var(--accent-soft)", color: "var(--text-muted)" }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="px-3 py-3">
            <span className="name-column text-sm block" style={{ color: "var(--text-primary)" }}>
              {e.label}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {e.sourceLocation}
            </span>
          </span>
        </button>
      ))}
    </nav>
  );
}
