import type { CollectionEntry } from "astro:content";

// Sorts projects by year (most recent first). Entries without a year are
// placed last, ordered by their explicit `order` field (e.g. teaching, then
// conclusion).
export function sortProjects(
  a: CollectionEntry<"projects">,
  b: CollectionEntry<"projects">,
) {
  const aYear = a.data.year;
  const bYear = b.data.year;
  if (aYear != null && bYear != null) return bYear - aYear;
  if (aYear != null) return -1;
  if (bYear != null) return 1;
  return (a.data.order ?? 0) - (b.data.order ?? 0);
}
