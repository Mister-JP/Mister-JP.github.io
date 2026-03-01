import type { CollectionEntry } from 'astro:content';
import { getProjectHref } from './content-paths';
import { getRelatedProjectsForEntry } from './content-relations';

type WritingEntry = CollectionEntry<'writing'>;

export async function getWritingDetailPageData(entry: WritingEntry) {
  const relatedProjects = await getRelatedProjectsForEntry(entry);
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
      relatedProjects: relatedProjects.map((project) => ({
        title: project.data.title,
        summary: project.data.summary,
        status: project.data.status,
        href: getProjectHref(project),
      })),
      headings,
      actions: [{ label: 'All writing', href: '/writing' }],
    },
  };
}
