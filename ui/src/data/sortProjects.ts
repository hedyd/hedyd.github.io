import type { CollectionEntry } from "astro:content";

// Sorts projects by year (most recent first). Entries without a year are
// placed last, ordered by their explicit `order` field (e.g. teaching). Ties
// fall back to the file name (A to Z), so the order doesn't depend on how
// the content loader happens to list files.
export function sortProjects(
  a: CollectionEntry<"projects">,
  b: CollectionEntry<"projects">,
) {
  const aYear = a.data.year;
  const bYear = b.data.year;
  if (aYear != null && bYear != null)
    return bYear - aYear || a.id.localeCompare(b.id);
  if (aYear != null) return -1;
  if (bYear != null) return 1;
  return (a.data.order ?? 0) - (b.data.order ?? 0);
}
