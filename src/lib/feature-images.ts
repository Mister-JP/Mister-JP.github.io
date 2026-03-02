export const PROJECT_FEATURE_IMAGE_FALLBACK = '/images/entry-previews/project-detail.svg';
export const WRITING_FEATURE_IMAGE_FALLBACK = '/images/entry-previews/writing-detail.svg';
export const TOOL_FEATURE_IMAGE_FALLBACK = '/images/entry-previews/tool-detail.svg';

export const getProjectFeatureImage = (src?: string) =>
  src ?? PROJECT_FEATURE_IMAGE_FALLBACK;

export const getWritingFeatureImage = (src?: string) =>
  src ?? WRITING_FEATURE_IMAGE_FALLBACK;

export const getToolFeatureImage = (src?: string) =>
  src ?? TOOL_FEATURE_IMAGE_FALLBACK;

export const hasProjectFeatureImage = (src?: string) =>
  Boolean(src && src !== PROJECT_FEATURE_IMAGE_FALLBACK);

export const hasWritingFeatureImage = (src?: string) =>
  Boolean(src && src !== WRITING_FEATURE_IMAGE_FALLBACK);

export const hasToolFeatureImage = (src?: string) =>
  Boolean(src && src !== TOOL_FEATURE_IMAGE_FALLBACK);
