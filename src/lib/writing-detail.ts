import { getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { getProjectHref } from './content-paths';

type WritingEntry = CollectionEntry<'writing'>;

export async function getWritingDetailPageData(entry: WritingEntry) {
  const relatedProject = entry.data.relatedProject
    ? await getEntry(entry.data.relatedProject)
    : undefined;
  const relatedProjectHref = relatedProject ? getProjectHref(relatedProject) : undefined;
  const { Content, headings } = await entry.render();

  return {
    Content,
    hasBody: Boolean(entry.body?.trim()),
    templateProps: {
      title: entry.data.title,
      summary: entry.data.summary,
      kind: entry.data.kind,
      status: entry.data.status,
      tags: entry.data.tags,
      relatedProject: relatedProject && relatedProjectHref
        ? {
            title: relatedProject.data.title,
            summary: relatedProject.data.summary,
            status: relatedProject.data.status,
            href: relatedProjectHref,
          }
        : undefined,
      headings,
      actions: [
        { label: 'All writing', href: '/writing' },
        relatedProjectHref
          ? { label: 'Related project', href: relatedProjectHref }
          : undefined,
      ].filter((action): action is { label: string; href: string } => Boolean(action)),
    },
  };
}
