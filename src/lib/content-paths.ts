import type { CollectionEntry } from 'astro:content';

type ProjectLike = Pick<CollectionEntry<'projects'>, 'slug'>;
type ToolLike = Pick<CollectionEntry<'tools'>, 'slug'>;
type WritingLike = Pick<CollectionEntry<'writing'>, 'slug' | 'data'>;

export const getProjectHref = (entry: ProjectLike) => `/projects/${entry.slug}`;

export const getToolHref = (entry: ToolLike) => `/tools/${entry.slug}`;

export const getWritingHref = (entry: WritingLike) =>
  entry.data.kind === 'case-study'
    ? `/writing/case-studies/${entry.slug}`
    : `/writing/methods/${entry.slug}`;
