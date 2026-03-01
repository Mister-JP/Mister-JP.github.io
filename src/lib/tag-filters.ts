export function toTagFilterValue(tag: string): string {
  const normalized = tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'tag';
}
