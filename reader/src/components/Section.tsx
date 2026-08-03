/**
 * A region of a page, weighted by the warrant of what it holds.
 *
 * Replaces the old Block, whose single appearance was the reason a page could
 * only ever be a list of identical boxes. Every region opens on a header strip
 * and closes on a rule (the instrument register); what changes with warrant is
 * the weight of that strip and of the body inside it.
 *
 * The title is a real heading element. The document previously had exactly one
 * heading in it, which left screen readers, reader mode and PDF export with no
 * outline at all.
 */
import type { ReactNode } from "react";
import { stripClass, warrantClass, type Warrant } from "./warrant";

export function Section({
  title,
  warrant,
  note,
  level = 2,
  children,
}: {
  title: string;
  warrant: Warrant;
  note?: ReactNode;
  level?: 2 | 3;
  children: ReactNode;
}) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <section
      className="mb-6 border"
      style={{
        background: warrant === "open" ? "transparent" : "var(--bg-secondary)",
        borderColor: "var(--border)",
        boxShadow: warrant === "open" ? "none" : "var(--shadow-card)",
      }}
    >
      <div className={`${stripClass[warrant]} px-5 py-2 flex items-baseline gap-3 flex-wrap`}>
        <Heading className="section-title">{title}</Heading>
        {note && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {note}
          </span>
        )}
      </div>
      <div className={`pad-block ${warrantClass[warrant]}`}>{children}</div>
    </section>
  );
}
