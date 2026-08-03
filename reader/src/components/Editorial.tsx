/**
 * Our own prose, typeset.
 *
 * The asymmetry is deliberate and worth stating: **we typeset our own writing;
 * we never typeset the author's.** An encoder's note, a commitment question, a
 * derivation's claim — all written here, so rendering emphasis and inline code in
 * them is our typography. A verbatim passage is a transcription, and running it
 * through any renderer would alter the one thing every downstream encoding is
 * checkable against.
 *
 * Without this, editorial fields showed literal asterisks and backticks, and the
 * encoders had compensated by shouting — "an author uses a WORD as a primitive",
 * "a claim ABOUT this definition". Emphasis should be available so that capitals
 * do not have to do its job.
 *
 * A restricted subset only: *emphasis*, **strong**, `code`. No links, no images,
 * no HTML — this renders untrusted-shaped text from data files and has no reason
 * to accept anything richer.
 */
import type { ReactNode } from "react";

const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

export function Editorial({ children }: { children: string }) {
  const parts: ReactNode[] = [];
  for (const [i, piece] of children.split(TOKEN).entries()) {
    if (!piece) continue;
    if (piece.startsWith("**") && piece.endsWith("**")) parts.push(<strong key={i}>{piece.slice(2, -2)}</strong>);
    else if (piece.startsWith("*") && piece.endsWith("*")) parts.push(<em key={i}>{piece.slice(1, -1)}</em>);
    else if (piece.startsWith("`") && piece.endsWith("`"))
      parts.push(
        <code key={i} className="editorial-code">
          {piece.slice(1, -1)}
        </code>,
      );
    else parts.push(piece);
  }
  return <>{parts}</>;
}
