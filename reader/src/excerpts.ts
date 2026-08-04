/**
 * The shelf's split of a verbatim: the formal statement that faces, and the
 * author's own reading of it that follows.
 *
 * Both spans come from the atlas (atlas:displayForm, atlas:displayContext),
 * where the build refuses any span that is not an exact substring of the
 * verbatim. The check is repeated here only as a last line: if this bundle is
 * ever paired with data the gate did not see, the card falls back to the full
 * verbatim rather than showing words an author did not write.
 */
import type { Entry } from "./types";

export function excerptOf(e: Entry): { display: string | null; context: string | null } {
  const v = e.verbatim;
  if (!v) return { display: null, context: null };
  return {
    display: e.displayForm && v.includes(e.displayForm) ? e.displayForm : v,
    context: e.displayContext && v.includes(e.displayContext) ? e.displayContext : null,
  };
}
