import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

type ResumePageData = Extract<CollectionEntry<'pages'>['data'], { template: 'resume' }>;

export interface ResumePageContent {
  page: Pick<ResumePageData, 'title' | 'description' | 'eyebrow'>;
  pdf: ResumePageData['pdf'];
  highlights: ResumePageData['highlights'];
  hasPdf: boolean;
  fileName: string;
  assetContractPath: string;
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
  const assetContractPath = `public${pdfPath}`;
  const assetFilePath = fileURLToPath(
    new URL(`../../${assetContractPath}`, import.meta.url),
  );

  return {
    page: {
      title: resumeEntry.data.title,
      description: resumeEntry.data.description,
      eyebrow: resumeEntry.data.eyebrow,
    },
    pdf: resumeEntry.data.pdf,
    highlights: resumeEntry.data.highlights,
    hasPdf: existsSync(assetFilePath),
    fileName: pdfPath.split('/').pop() ?? 'resume.pdf',
    assetContractPath,
  };
}
