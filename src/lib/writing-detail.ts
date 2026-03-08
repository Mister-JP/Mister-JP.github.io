import type { CollectionEntry } from 'astro:content';
import { getProjectHref } from './content-paths';
import { getWritingFeatureImage } from './feature-images';
import { getRelatedProjectsForEntry } from './content-relations';
import { normalizeWritingCategory } from './writing-categories';

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
      featureImage: getWritingFeatureImage(entry.data.featureImage),
      category: normalizeWritingCategory(entry.data.category),
      series: entry.data.series,
      in_draft: entry.data.in_draft,
      tags: entry.data.tags,
      relatedProjects: relatedProjects.map((project) => ({
        title: project.data.title,
        summary: project.data.summary,
        status: project.data.status,
        href: getProjectHref(project),
      })),
      headings,
    },
  };
}
