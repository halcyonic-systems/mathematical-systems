/**
 * The identity band, and the view switcher beneath it.
 *
 * The band is the fleet's identity device: any page with a name opens on a
 * filled full-bleed masthead. The switcher is a row of real links, not tabs:
 * every view has a canonical URL that exists to be sent to someone (route.ts),
 * and a <button role="tab"> denies the reader everything an address affords —
 * middle-click, copy-link, a crawler's path. It also announced tabs that
 * controlled no tabpanel, which is worse ARIA than none. aria-current="page"
 * tells assistive technology which view this is; the browser handles the rest.
 */
import type { ReactNode } from "react";

export function Masthead({
  eyebrow,
  title,
  subtitle,
  count,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  count?: ReactNode;
}) {
  return (
    <header
      style={{ background: "var(--accent-strong)", color: "var(--text-on-accent)" }}
      className="px-8 py-6 flex items-baseline justify-between gap-6 flex-wrap"
    >
      <div>
        <p className="eyebrow m-0" style={{ color: "var(--accent-soft)" }}>
          {eyebrow}
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-4xl font-medium mt-1 mb-0">
          {title}
        </h1>
        {subtitle && (
          <p
            style={{ fontFamily: "var(--font-display)", color: "var(--accent-soft)" }}
            className="m-0 mt-1 text-lg italic"
          >
            {subtitle}
          </p>
        )}
      </div>
      {count && (
        <p style={{ fontFamily: "var(--font-display)" }} className="text-3xl tabular-nums opacity-80 m-0">
          {count}
        </p>
      )}
    </header>
  );
}

export function Tabs<T extends string>({
  tabs,
  meta = [],
  active,
  hrefOf,
  onSelect,
}: {
  tabs: { id: T; label: string }[];
  /** Views that are about the catalogue rather than of it. Rendered apart, on
      the right, in the quiet ink — peers for the keyboard, not for the eye. */
  meta?: { id: T; label: string }[];
  active: T;
  /** The canonical URL of a view — the same one route.ts would put in the
      address bar, so a middle-click and a plain click land in the same place. */
  hrefOf: (id: T) => string;
  onSelect: (id: T) => void;
}) {
  const link = (t: { id: T; label: string }, extra = "") => (
    <a
      key={t.id}
      href={hrefOf(t.id)}
      aria-current={active === t.id ? "page" : undefined}
      onClick={(e) => {
        // A modified click is a request to the browser (new tab, new window,
        // download), not to the app. Only a plain left click stays in the SPA.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        onSelect(t.id);
      }}
      className={`tab px-4 py-3 text-sm no-underline${extra}`}
    >
      {t.label}
    </a>
  );
  return (
    <nav
      aria-label="Views"
      style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}
      className="px-8 flex gap-1 sticky top-0 z-10"
    >
      <div className="flex gap-1 flex-1">
        {tabs.map((t) => link(t))}
        {meta.map((t) => link(t, " tab-meta"))}
      </div>
    </nav>
  );
}
