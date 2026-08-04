/**
 * A folded legend at the top of an entry.
 *
 * The ladder and the warrant grammar used to be doctrine cards on the front
 * page, which asked a reader to memorise the notation before seeing anything
 * written in it. Here they sit where the notation is actually met, folded until
 * the moment a tier or a typeface shift first puzzles someone. The full methods
 * prose lives in About; this is the pocket version, rendered from the same data
 * so the two cannot drift.
 */
import { useState } from "react";
import { warrantMeaning, type Warrant } from "./warrant";

export type Tier = { n: number; name: string; of: string };

export function ReadingKey({ tiers }: { tiers: Tier[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="reading-key">
      <button
        onClick={() => setOpen((v) => !v)}
        className="disclosure eyebrow cursor-pointer bg-transparent border-0 p-0"
        aria-expanded={open}
      >
        <span aria-hidden className="chevron">
          ▸
        </span>{" "}
        How to read an entry
      </button>
      {open && (
        <div className="reading-key-body">
          <p className="w-decided mt-0 mb-2 font-semibold">What an entry can carry, in order:</p>
          <ul className="m-0 pl-4 w-decided">
            {tiers.map((t) => (
              <li key={t.name} className="mb-1">
                <strong>{t.name}</strong> <span className="w-open not-italic">tier {t.n}</span> — {t.of}
              </li>
            ))}
          </ul>
          <p className="w-decided mt-4 mb-2 font-semibold">
            Weight is warrant. Type, not colour, says how well established a claim is:
          </p>
          <dl className="m-0 grid gap-x-6 gap-y-1">
            {(Object.keys(warrantMeaning) as Warrant[]).map((w) => (
              <div key={w} className="flex gap-3 items-baseline">
                <dt className="eyebrow">{w}</dt>
                <dd className="m-0 w-decided">{warrantMeaning[w]}</dd>
              </div>
            ))}
          </dl>
          <p className="w-open mt-4 mb-0">
            The full methods — what the build refuses, and what is unsettled — are in About.
          </p>
        </div>
      )}
    </div>
  );
}
