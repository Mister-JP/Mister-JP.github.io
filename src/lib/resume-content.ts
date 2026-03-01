import { getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

type ResumePageData = Extract<CollectionEntry<'pages'>['data'], { template: 'resume' }>;

export interface ResumePageContent {
  page: Pick<ResumePageData, 'title' | 'description'>;
  pdf: ResumePageData['pdf'];
  highlights: ResumePageData['highlights'];
  fileName: string;
}

export async function getResumePageContent(): Promise<ResumePageContent> {
  const resumeEntry = await getEntry('pages', 'resume');

  if (!resumeEntry) {
    throw new Error('Missing content entry: src/content/pages/resume.md');
  }

  if (resumeEntry.data.template !== 'resume') {
    throw new Error('The resume page entry must use the "resume" template.');
  }

  const pdfPath = resumeEntry.data.pdf.path;

  return {
    page: {
      title: resumeEntry.data.title,
      description: resumeEntry.data.description,
    },
    pdf: resumeEntry.data.pdf,
    highlights: resumeEntry.data.highlights,
    fileName: pdfPath.split('/').pop() ?? 'resume.pdf',
  };
}
