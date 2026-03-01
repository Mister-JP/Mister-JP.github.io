import { getCollection, getEntries } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { sortCollectionEntriesBySortOrderThenTitle } from './collection-utils';

type ProjectEntry = CollectionEntry<'projects'>;
type ToolEntry = CollectionEntry<'tools'>;
type WritingEntry = CollectionEntry<'writing'>;
type EntryReferenceLike = Pick<ProjectEntry, 'collection' | 'id'>;
type ProjectReference = WritingEntry['data']['relatedProjects'][number];
type HasRelatedProjects = {
  data: {
    relatedProjects: ProjectReference[];
  };
};

const matchesEntryReference = (
  references: ProjectReference[],
  entry: Pick<ProjectEntry, 'collection' | 'id'>,
) =>
  references.some(
    (reference) =>
      reference.collection === entry.collection && reference.id === entry.id,
  );

const toReferenceKey = (reference: EntryReferenceLike) =>
  `${reference.collection}:${reference.id}`;

export async function getRelatedProjectsForEntry(
  entry: HasRelatedProjects,
): Promise<ProjectEntry[]> {
  return (await getEntries(entry.data.relatedProjects))
    .filter((project): project is ProjectEntry => Boolean(project))
    .sort(sortCollectionEntriesBySortOrderThenTitle);
}

export async function getWritingEntriesForProject(
  project: ProjectEntry,
): Promise<WritingEntry[]> {
  return (
    await getCollection('writing', ({ data }) =>
      matchesEntryReference(data.relatedProjects, project),
    )
  ).sort(sortCollectionEntriesBySortOrderThenTitle);
}

export async function getToolEntriesForProject(
  project: ProjectEntry,
): Promise<ToolEntry[]> {
  return (
    await getCollection('tools', ({ data }) =>
      matchesEntryReference(data.relatedProjects, project),
    )
  ).sort(sortCollectionEntriesBySortOrderThenTitle);
}

export async function getWritingEntriesForProjectSet(
  projects: ProjectEntry[],
): Promise<WritingEntry[]> {
  if (projects.length === 0) {
    return [];
  }

  const projectKeys = new Set(
    projects.map((project) =>
      toReferenceKey({ collection: project.collection, id: project.id }),
    ),
  );

  return (
    await getCollection('writing', ({ data }) =>
      data.relatedProjects.some((reference) => projectKeys.has(toReferenceKey(reference))),
    )
  ).sort(sortCollectionEntriesBySortOrderThenTitle);
}
