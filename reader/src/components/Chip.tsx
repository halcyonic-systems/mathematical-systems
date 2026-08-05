/** A short token — a primitive, a filter, a selectable entry. */
import type { MouseEvent, ReactNode } from "react";

export function Chip({
  children,
  tone = "solid",
  title,
  href,
  onOpen,
}: {
  children: ReactNode;
  /** `solid` for content, `quiet` for shared/background, `outline` for structure. */
  tone?: "solid" | "quiet" | "outline";
  title?: string;
  /** With `href`, the chip is a door: a real anchor to the canonical address,
      so middle-click and copy-link work. A plain click calls `onOpen` for the
      SPA transition instead. The component stays dumb — the caller supplies
      both, so a chip never reaches into the router itself. */
  href?: string;
  onOpen?: () => void;
}) {
  const style =
    tone === "solid"
      ? { background: "var(--accent)", color: "var(--text-on-accent)", border: "1px solid transparent" }
      : tone === "quiet"
        ? { background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid transparent" }
        : { background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--accent-slate)" };
  const className = `px-2 py-0.5 text-xs whitespace-nowrap${title ? " chip-explained" : ""}`;
  if (href)
    return (
      <a
        href={href}
        title={title}
        className={`${className} chip-link`}
        style={{ ...style, borderRadius: "var(--radius-sm)" }}
        onClick={(e: MouseEvent) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          onOpen?.();
        }}
      >
        {children}
      </a>
    );
  return (
    <span
      title={title}
      className={className}
      style={{ ...style, borderRadius: "var(--radius-sm)" }}
    >
      {children}
    </span>
  );
}

export function Toggle({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="toggle px-3 py-1 text-sm cursor-pointer"
      style={{
        background: on ? "var(--accent)" : "var(--bg-surface)",
        color: on ? "var(--text-on-accent)" : "var(--text-secondary)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
      }}
    >
      <span aria-hidden>{on ? "✓ " : "  "}</span>
      {children}
    </button>
  );
}
