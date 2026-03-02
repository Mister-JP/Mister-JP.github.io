export const WRITING_CATEGORY_VALUES = [
  'research',
  'project-note',
  'method',
  'technical-note',
] as const;

export type WritingCategory = (typeof WRITING_CATEGORY_VALUES)[number];
export type WritingCategoryTagTone = 'default' | 'accent' | 'muted';
export type WritingCategoryPanelTone =
  | 'default'
  | 'soft'
  | 'muted'
  | 'accent'
  | 'neutral';
export type WritingIndexPresentation = 'cards' | 'compact';

const LEGACY_WRITING_CATEGORY_ALIASES = {
  'case-study': 'project-note',
  'field-note': 'research',
} as const;

interface WritingCategoryMeta {
  label: string;
  pluralLabel: string;
  ctaLabel: string;
  pathSegment: string;
  countLabelSingular?: string;
  countLabelPlural?: string;
  tagTone: WritingCategoryTagTone;
  panelTone: WritingCategoryPanelTone;
  indexPresentation: WritingIndexPresentation;
}

const WRITING_CATEGORY_META: Record<WritingCategory, WritingCategoryMeta> = {
  research: {
    label: 'Research',
    pluralLabel: 'Research',
    ctaLabel: 'Read research',
    pathSegment: 'research',
    countLabelSingular: 'research piece',
    countLabelPlural: 'research pieces',
    tagTone: 'default',
    panelTone: 'soft',
    indexPresentation: 'cards',
  },
  'project-note': {
    label: 'Project Note',
    pluralLabel: 'Project Notes',
    ctaLabel: 'Read project note',
    pathSegment: 'project-notes',
    tagTone: 'accent',
    panelTone: 'default',
    indexPresentation: 'cards',
  },
  method: {
    label: 'Method',
    pluralLabel: 'Methods',
    ctaLabel: 'Read method',
    pathSegment: 'methods',
    tagTone: 'default',
    panelTone: 'muted',
    indexPresentation: 'cards',
  },
  'technical-note': {
    label: 'Technical Note',
    pluralLabel: 'Technical Notes',
    ctaLabel: 'Read note',
    pathSegment: 'technical-notes',
    tagTone: 'muted',
    panelTone: 'neutral',
    indexPresentation: 'compact',
  },
};

const isWritingCategory = (category: string): category is WritingCategory =>
  Object.prototype.hasOwnProperty.call(WRITING_CATEGORY_META, category);

export const WRITING_CATEGORY_ORDER = [...WRITING_CATEGORY_VALUES];

export const normalizeWritingCategory = (
  category: WritingCategory | string,
): WritingCategory => {
  const normalizedCategory =
    LEGACY_WRITING_CATEGORY_ALIASES[
      category as keyof typeof LEGACY_WRITING_CATEGORY_ALIASES
    ] ?? category;

  if (isWritingCategory(normalizedCategory)) {
    return normalizedCategory;
  }

  throw new Error(
    `Unknown writing category "${category}". Expected one of: ${WRITING_CATEGORY_VALUES.join(', ')}.`,
  );
};

export const getWritingCategoryMeta = (category: WritingCategory | string) =>
  WRITING_CATEGORY_META[normalizeWritingCategory(category)];

export const getWritingCategoryLabel = (category: WritingCategory | string) =>
  getWritingCategoryMeta(category).label;

export const getWritingCategoryCollectionLabel = (
  category: WritingCategory | string,
) =>
  getWritingCategoryMeta(category).pluralLabel;

export const getWritingCategoryPathSegment = (
  category: WritingCategory | string,
) =>
  getWritingCategoryMeta(category).pathSegment;

export const getWritingCategoryCountLabel = (
  category: WritingCategory | string,
  count: number,
) => {
  const meta = getWritingCategoryMeta(category);
  const singularLabel = meta.countLabelSingular ?? meta.label.toLowerCase();
  const pluralLabel = meta.countLabelPlural ?? meta.pluralLabel.toLowerCase();

  return `${count} ${count === 1 ? singularLabel : pluralLabel}`;
};
