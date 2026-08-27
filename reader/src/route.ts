/**
 * Every view, every comparison, every closure gets a URL.
 *
 * This artefact exists to be sent to someone and cited. A reader who finds a
 * disagreement between two definitions, or watches a commitment appear when the
 * axiom set widens, must be able to hand that exact state to somebody else — and
 * before this, clicking a tab left the address bar untouched, so nothing but a
 * single entry could be linked to.
 *
 * Paths use the names a reader sees, not the identifiers the code uses: the
 * census view lives at /primitives because that is what it is a census of.
 */
import type { View } from "./store";

/** Always ends in "/". "/" on a custom domain, "/mathematical-systems/" on a project page. */
export const BASE = import.meta.env.BASE_URL;

export type Route = {
  view: View;
  /** Entry id (not IRI) for the read view. */
  entry?: string;
  /** Entry ids selected for comparison. */
  entries?: string[];
  closure?: "shipped" | "full";
};

const SEGMENT: Record<View, string> = {
  overview: "",
  read: "entry",
  compare: "compare",
  census: "primitives",
  ledger: "cases",
  commitments: "entailments",
  floor: "floor",
  apparatus: "apparatus",
  about: "about",
};

const VIEW_OF = Object.fromEntries(Object.entries(SEGMENT).map(([v, s]) => [s, v as View])) as Record<string, View>;

/** Strip the deploy base so the same parser serves a root and a project page. */
function relative(pathname: string) {
  return pathname.startsWith(BASE) ? "/" + pathname.slice(BASE.length) : pathname;
}

export function parse(url: URL = new URL(window.location.href)): Route {
  const [, head, tail] = relative(url.pathname).split("/");
  const view = VIEW_OF[head ?? ""] ?? "overview";
  const q = url.searchParams;
  return {
    view,
    entry: view === "read" && tail ? decodeURIComponent(tail) : undefined,
    entries: q.get("entries")?.split(",").filter(Boolean),
    closure: q.get("closure") === "full" ? "full" : q.get("closure") === "shipped" ? "shipped" : undefined,
  };
}

export function href(r: Route): string {
  const seg = SEGMENT[r.view];
  let path = `${BASE}${seg}`;
  if (r.view === "read") path = r.entry ? `${BASE}entry/${encodeURIComponent(r.entry)}` : BASE;
  if (r.view === "overview") path = BASE;

  // Only the parameters a view actually reads, so a shared link carries no noise
  // and two links to the same state are the same string. Built by hand rather
  // than with URLSearchParams because that percent-encodes the separating comma,
  // and these URLs exist to be pasted into documents.
  const q: string[] = [];
  if (r.view === "compare" && r.entries?.length) q.push(`entries=${r.entries.map(encodeURIComponent).join(",")}`);
  if (r.view === "commitments" && r.closure) q.push(`closure=${r.closure}`);
  return q.length ? `${path}?${q.join("&")}` : path;
}

/** Replace rather than push when the state was not chosen by the reader. */
export function go(r: Route, mode: "push" | "replace" = "push") {
  const url = href(r);
  if (url === window.location.pathname + window.location.search) return;
  window.history[mode === "push" ? "pushState" : "replaceState"]({}, "", url);
}
