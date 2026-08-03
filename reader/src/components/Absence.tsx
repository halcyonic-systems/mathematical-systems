/**
 * Nothing here, and why — stated once in place and once in the open block.
 *
 * This catalogue has a lot of principled nothings: no shape category for Bunge's
 * Definition 1.1, no derived conflicts, no examples recorded for Klir, no roles
 * on the primitives. Each was hand-written prose in a different voice, and they
 * read like error messages rather than like findings.
 *
 * An absence renders terse where it occurs, so a section does not look broken,
 * and registers itself into the entry's open-questions block where it is stated
 * fully along with what would close it. Footnote marker and footnote text — the
 * reader sees the shape of what is unfinished in one place instead of inferring
 * it from scattered dashes.
 */
import { useEffect } from "react";
import { useOpenCollector } from "./context";
import { warrantClass } from "./warrant";

export function Absence({
  id,
  /** The terse form, shown in place. */
  inline,
  /** The full statement, shown in the open-questions block. Defaults to `inline`. */
  what,
  /** What would close this gap, if that is known. */
  closes,
  origin = "derived",
}: {
  id: string;
  inline: string;
  what?: string;
  closes?: string;
  origin?: "derived" | "authored";
}) {
  const collector = useOpenCollector();
  useEffect(() => {
    collector?.register({ id, what: what ?? inline, closes, origin });
  }, [collector, id, what, inline, closes, origin]);

  return <p className={`${warrantClass.open} m-0`}>{inline}</p>;
}

/** The collected block. Renders nothing when there is nothing open, which is itself a claim. */
export function OpenQuestionsBlock() {
  const collector = useOpenCollector();
  if (!collector || collector.items.length === 0) return null;

  return (
    <ul className="m-0 p-0 list-none">
      {collector.items.map((item) => (
        <li key={item.id} className="mb-4 last:mb-0">
          <p className="m-0 flex items-baseline gap-2">
            <span aria-hidden style={{ color: "var(--proof-not-proven)" }}>
              ◇
            </span>
            <span style={{ color: "var(--text-secondary)" }}>{item.what}</span>
          </p>
          {item.closes && (
            <p className={`${warrantClass.open} m-0 mt-1 pl-6`}>{item.closes}</p>
          )}
          <p className="eyebrow mt-1 pl-6" style={{ color: "var(--text-muted)" }}>
            {item.origin === "derived" ? "found by the build" : "recorded by the encoder"}
          </p>
        </li>
      ))}
    </ul>
  );
}
