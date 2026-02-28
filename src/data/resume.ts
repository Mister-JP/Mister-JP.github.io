export const resumeConfig = {
  pdfPath: '/resume/jignasu-pathak-resume.pdf',
  expectedAssetPath: 'public/resume/jignasu-pathak-resume.pdf',
  title: 'Resume PDF',
  summary:
    'TODO: short recruiter-facing summary covering research engineering, evaluation systems, and tool-building strengths.',
  actions: {
    download: 'Download PDF',
    open: 'Open in new tab',
  },
  fallback: {
    title: 'Resume preview pending',
    summary:
      'Add the finalized PDF to the expected asset path to enable inline preview and direct download.',
  },
  highlights: [
    'TODO: add one recruiter-facing highlight about systems you build.',
    'TODO: add one highlight about evaluation, reproducibility, or research engineering.',
    'TODO: add one highlight about collaboration, delivery, or technical ownership.',
  ],
} as const;
