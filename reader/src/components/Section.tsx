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
import { cardClass, stripClass, warrantClass, type Warrant } from "./warrant";

/** "What it posits" -> "what-it-posits". Stable across builds, so a link keeps working. */
export const slug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

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
  const id = slug(title);
  return (
    <section className={`mb-6 scroll-mt-16 ${cardClass[warrant]}`}>
      <div className={`${stripClass[warrant]} px-5 py-2.5 flex items-baseline gap-3 flex-wrap`}>
        <Heading className="section-title" id={id}>
          {/* A real anchor, so a section can be cited and not merely scrolled to.
              The document previously contained no links at all. */}
          <a href={`#${id}`} className="section-anchor">
            {title}
            <span aria-hidden className="anchor-mark">
              #
            </span>
          </a>
        </Heading>
        {note && <span className="text-xs section-note">{note}</span>}
      </div>
      <div className={`pad-block ${warrantClass[warrant]}`}>{children}</div>
    </section>
  );
}
