/**
 * Up to two initials for an avatar/author chip: strip a leading honorific,
 * take the first letter of the first two remaining words, and fall back to the
 * email's first letter (then '?') when there's no usable name.
 */
export function initialsFrom(name?: string | null, email?: string | null): string {
  const cleaned = (name ?? '')
    .replace(/^(Dr|Mr|Mrs|Ms|Nurse|Prof)\.?\s+/i, '')
    .trim();
  if (cleaned) {
    return cleaned
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  const handle = (email ?? '').trim();
  return handle ? handle[0].toUpperCase() : '?';
}
