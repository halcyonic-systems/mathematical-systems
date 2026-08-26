/**
 * A section of an entry's own material, set on open paper rather than boxed.
 *
 * Section earns its card chrome for an instrument — a grid, a diagram — where
 * a boundary is doing real work holding a comparison or a shape together. Most
 * of what an entry carries is not that: a quotation, a list of chips, an
 * encoder's note. Boxing each of those in its own card is how the page ended
 * up as a stack of half-empty cards with a heading and three lines of text.
 * Structure here is carried by a rule and by warrant typography instead — the
 * same discipline Section uses, without the frame around it.
 */
import type { ReactNode } from "react";
import { slug } from "./Section";
import { warrantClass, type Warrant } from "./warrant";

export function Leaf({
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
    <section className="leaf mb-8 scroll-mt-16">
      <div className="leaf-head flex items-baseline gap-3 flex-wrap">
        <Heading className="section-title" id={id}>
          <a href={`#${id}`} className="section-anchor">
            {title}
            <span aria-hidden className="anchor-mark">
              #
            </span>
          </a>
        </Heading>
        {note && <span className="text-xs section-note">{note}</span>}
      </div>
      <div className={warrantClass[warrant]}>{children}</div>
    </section>
  );
}
