/**
 * The identity band, and the view switcher beneath it.
 *
 * The band is the fleet's identity device: any page with a name opens on a
 * filled full-bleed masthead. The switcher is a real tablist rather than a row
 * of buttons, so arrow keys work and assistive technology is told which view is
 * current — this is a comparison instrument, and moving between views is the
 * main thing a reader does.
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
  active,
  onSelect,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onSelect: (id: T) => void;
}) {
  const move = (delta: number) => {
    const i = tabs.findIndex((t) => t.id === active);
    onSelect(tabs[(i + delta + tabs.length) % tabs.length].id);
  };
  return (
    <nav
      aria-label="Views"
      style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}
      className="px-8 flex gap-1 sticky top-0 z-10"
    >
      <div role="tablist" className="flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => onSelect(t.id)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") move(1);
              if (e.key === "ArrowLeft") move(-1);
            }}
            className="tab px-4 py-3 text-sm cursor-pointer bg-transparent"
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
